# Ranked optimisations from the PR #1877 run data

Derived from [run-analysis-pr1877.md](run-analysis-pr1877.md). Everything here is grounded in
measured figures from that run plus the checkpoint positions in the `work-package` definitions.

## The governing finding: cost tracks *dispatch count*, not call count

Splitting the run's 21 activity entries by whether they needed more than one dispatch:

| Group | Activities | Tool calls | Tokens | **tok/call** |
|-------|-----------:|-----------:|-------:|-------------:|
| Single-dispatch | 11 | 369 | 1,141,290 | **3,093** |
| Multi-dispatch (resumed) | 10 | 552 | 2,989,367 | **5,416** |

**Ratio 1.75×.** Applying the delta across the 552 multi-dispatch calls implies
**~1,282,000 tokens — 31% of the run — is re-dispatch overhead.** That corroborates the run's own
attribution of ~1,020,000 tokens (24.7%) to its 12 resumed dispatches by an independent route.

Critically, it is **not** context accumulation inside a long worker:

| Activity | Dispatches | Calls | tok/call |
|----------|-----------:|------:|---------:|
| `codebase-comprehension` | 1 | 88 | **2,543** ← cheapest in the run |
| `start-work-package` | 1 | 57 | 2,544 |
| `implementation-analysis` | 1 | 68 | 3,097 |
| `post-impl-review` | 3 | 133 | 4,822 |
| `submit-for-review` | 3 | 65 | **7,621** ← dearest in the run |

`codebase-comprehension` did 88 calls in one dispatch at the lowest per-call cost on record.
`submit-for-review` did 65 calls across three dispatches at three times that. **Long activities are
cheap; re-dispatched activities are expensive.**

## What drives the re-dispatches: checkpoints, fired mid-activity

The run resolved 10 checkpoints (8 client + 2 meta) and paid 12 resumes. Per the run's own note, the
resumes were "checkpoint continuations, and one recovery from an organisation spend limit" — so
**~10 of 12 resumes are checkpoint-driven, at roughly 116K tokens each.**

Mapping the 8 client checkpoints that actually fired to their step position in the activity
definition:

| Checkpoint | Activity | Step position | Steps remaining after it |
|------------|----------|--------------:|-------------------------:|
| `local-validation-permission` | `11-validate` | **0 of 11** | 10 |
| `file-index-table` | `10-post-impl-review` | 3 of 18 | 14 |
| `unsigned-commits-prompt` | `12-strategic-review` | 2 of 14 | 11 |
| `review-summary-approval` | `13-submit-for-review` | 5 of 32 | 26 |
| `research-convergence#pass-1` | `04-research` | 5 of 20 (loop body) | 14 |
| `retrospective-confirm` | `14-complete` | 7 of 11 | 3 |
| `ticket-completeness` | `02-design-philosophy` | 9 of 11 | 1 |
| `review-findings` | `12-strategic-review` | **13 of 14 (last)** | 0 |

**Seven of eight fired mid-activity. Only one sat at the activity boundary, where a yield is free.**

And one is pathological: `validate-local-validation-permission` is **step 0** — the activity's very
first step. The worker is spawned, pays full delivery, immediately yields, and is resumed. The whole
first dispatch exists only to ask a question. `validate` cost 92,793 tokens over 2 dispatches for
18 tool calls.

Structural risk worth noting even though it did not bite here: `13-submit-for-review` declares
**9 checkpoints across 32 steps** and posted the run's worst per-call cost (7,621). `01-start-work-package`
declares 10 checkpoints but fired none in review mode, and posted the second-*best* cost (2,544).
So the cost driver is checkpoint **firing position**, not checkpoint count.

## Ranked optimisations

### O1 — Let a resumed worker use reference delivery ⇒ target ~25–31%

The largest single win. Two rules look like they conflict:

- `workers-need-full-delivery`: *"Dispatched workers are fresh contexts with no prior deliveries…
  never instruct a worker to pass `bundle: "reference"`: an unchanged-reference points at content
  the new worker has never received."*
- `resume-is-optimisation`: *"Harness-level resume preserves the context window."*

**The rule is not the defect — the delivery ledger is.** `deliveredHash` reads
`state.deliveredContent[state.agentId][key]` (`src/utils/delivery.ts:44`), and `agentId` is the
**session's** agent id, shared by every worker dispatched against that session. So reference
delivery on a worker session would hand worker B unchanged-markers for content worker A received.
`workers-need-full-delivery` is a *correct* guard over a ledger that cannot distinguish worker
contexts. It can only relax after the ledger can.

Server work, in dependency order:

1. **Scope the ledger to a worker context, not the session agent.** Mint a context id per spawn,
   carried by the worker on its calls and *reused* on a harness resume. Fresh spawn ⇒ empty ledger
   ⇒ full delivery (correct today's behaviour). Resume ⇒ populated ledger ⇒ references (the win).
2. **Add the per-call reference opt-in to `get_technique` and `get_resource`.** `get_activity`
   already has one — `bundle: "reference"` works independently of session mode
   (`src/tools/workflow-tools.ts:674`). Techniques and resources do not: they gate on
   `state.contextMode === 'persistent'` alone (`src/tools/resource-tools.ts:738`, `:764`, `:847`),
   with only `full: true` to force the other way. Without this, a resumed worker cannot dedup the
   86 technique and 30 resource deliveries this run paid for.

`force-full-after-summarization` remains the escape for a resume that did *not* preserve context.

Corpus work follows the server, never precedes it: relax `workers-need-full-delivery` to key on
context identity, and have `dispatch-activity` / `continue-agent` carry the context id and request
reference delivery on the resume path.

### O2 — Delete checkpoint-at-entry ⇒ target ~1 dispatch per occurrence, no tradeoff

`11-validate` yields at step 0. That dispatch cannot do anything but ask. A question asked before
any work is not worker work — it belongs either to the **preceding activity's tail** or to the
**orchestrator's dispatch precondition**.

Worth codifying as an anti-pattern: **a checkpoint as an activity's first step is always a wasted
dispatch.** A repo guard can detect it mechanically (`steps[0].kind == "checkpoint"`), so it is
cheap to enforce corpus-wide.

Independent of O1 and strictly additive — O1 makes the resume cheap, O2 removes the dispatch
entirely.

### O3 — Ledger the invisible third ⇒ 0% direct, but gates verification of O1 and O2

You cannot confirm O1 worked without this. Three concrete gaps in the run's history:

1. `activity_usage` fired **11 times against 33 dispatches** — no event type represents a resumed
   dispatch, an out-of-band dispatch, or an abandoned session. Cost accounting understated the run
   by a third. Fix: emit a dispatch event carrying a fresh/resume discriminator.
2. Delivery events carry **no magnitude**. `technique_bundled` / `technique_fetched` /
   `resource_fetched` `data` holds `techniqueId` / `resourceId` / `stepId` and nothing else, so
   delivery cost is unmeasurable from the ledger — every payload figure in this planning folder is
   an estimate for that reason. Fix: add a char count.
3. The out-of-band prism dispatch — 176,215 tokens, and the source of CR-0 and B7, **the two
   Critical findings the review's verdict rested on** — has no server record at all.

Small, server-side, and it is the instrument for everything above.

### O4 — Fix trace-token emission ⇒ fidelity

The run's `trace_tokens` resolved **empty**, so L7 produced nothing and error/validation-warning
history is unavailable for the whole walk.

Do not assume orchestrator negligence. Direct evidence from this session (server v2.1.0): a
`next_activity` call returned

```json
{ "activity_id": "discover-session", "name": "Discover Session", "session_index": "GC5XMW" }
```

— **no `_meta` envelope at all**, therefore no `_meta.trace_token` for an orchestrator to
accumulate. Check emission server-side before changing the accumulate rule.

### O5 — Artifact handoff digests ⇒ part of the ~7% cold-start term

403 KB of planning artifacts across 21 files, including a 57 KB assumptions log, a 50 KB structural
analysis and a 40 KB research document. `context-travels-as-state` routes prior context through
these, so every cold start re-reads a slice.

Have each activity emit a short digest beside its full artifact, and point step inputs at the digest
by default with the full artifact on demand. Existing threads to fold into:
[2026-07-17-slim-work-package-planning-artifacts](../2026-07-17-slim-work-package-planning-artifacts/),
[2026-07-28-workflow-design-slim-down](../2026-07-28-workflow-design-slim-down/).

Sequence this **after** re-measuring, since O1 changes what a cold start costs.

### O6 — Confirm the repo-binding fix shipped ⇒ 2%

The abandoned first meta run (`SXD664`, wrong repo binding) burned 81,762 tokens.
[2026-07-28-git-derived-host-repo-binding](../2026-07-28-git-derived-host-repo-binding/) addresses
the cause; verify it landed rather than re-deriving it.

## Explicit anti-recommendation

**Do not split `post-impl-review` because it is large.** It is the run's heaviest activity — 133
calls, 641,275 tokens, 42m — and "split the big one" is the obvious move. The data says it is the
wrong one: single-dispatch activities are the cheapest per call in the run, and splitting adds
dispatches, which is the expensive operation.

Split an activity **only where the split lands on a checkpoint that currently fires mid-activity**,
converting a resume into an activity boundary. And note that O1 and that split are **alternatives,
not complements**: if a resume becomes cheap, keeping the resume beats paying a second cold start.

## Suggested sequence

| Phase | Work | Why this order |
|-------|------|----------------|
| 1 | **O3** instrumentation | It is the measuring instrument for everything else, and it is small |
| 2 | **O1** reference delivery on resume + **O2** checkpoint-at-entry guard | The two largest wins; independent of each other |
| 3 | Re-measure a comparable walk | O1 changes the cold-start baseline that O5 is sized against |
| 4 | **O4** trace emission, then **O5** digests, **O6** confirm binding fix | Fidelity and long-tail |

Packaged execution manifests do not appear on this list. Per
[run-analysis-pr1877.md §4](run-analysis-pr1877.md), they address ~6% of calls and ~0% of tokens.
