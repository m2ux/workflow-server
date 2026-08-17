# Orchestration Topology — architect lens

Lens `51` / `architect` ("What alternative architectures exist?"), serving the **Orchestration Topology** dimension, applied to `workflows/meta/**` and `workflows/work-package/**` with `src/**` and `scripts/**` as implementation surface.

Every figure below was measured against the corpus at `/home/mike1/projects/dev/workflow-server` on 2026-08-17. Step-level counts flatten loop bodies into the parent activity. "Modal create path" means the variable bag `is_review_mode=false, stealth_mode=false, issue_platform=github, issue_present=true, needs_issue_creation=false, pr_exists=false, body_conforms=true` — the ordinary new-implementation run.

---

## Step 1 — Current architecture fingerprint

Three decisions carry the topology. Everything else in `src/` could be rewritten without changing what a run costs.

### D1 — The server is a delivery-and-ledger plane. All control flow is agent-side.

All 16 registered MCP tools are session control-plane. The server holds the full variable bag — `session.schema.ts:92` declares `variables: z.record(z.unknown()).default({})` — and it holds two working condition evaluators, `evaluateCondition` in `src/schema/condition.schema.ts` and `evaluateWhenExpression` in `src/schema/when-expression.ts`. **Neither is imported by anything under `src/tools/`.** Their only callers are `scripts/check-review-mode-gating.ts:37`, `scripts/check-stealth-isolation.ts:42`, `scripts/generate-schemas.ts:7` and `scripts/smoke/smoke-orchestrator.ts:31`. The server can decide which branch of an activity is live and never does.

- **Enables** host-agnosticism. `docs/dispatch_model.md:5` and `:149-153` promise that any harness — and the inline single-thread fallback — drives the same definitions, because the definitions are inert data and the agent is the interpreter.
- **Prevents** every optimisation that needs to know which branch is live: pruning, gate hoisting, liveness-aware bundling, halt-aware batching.
- **Costs**, measured: **22,262 bytes across 55 steps of work-package's step definitions are provably dead on the modal create path — 32.2% of all step bytes.** Concentrated exactly where the grounding said the checkpoints are: `01-start-work-package.yaml` ships 11,881 dead bytes over 27 dead steps (68.3% of that activity's step bytes), `13-submit-for-review.yaml` ships 6,516 dead bytes over 16 dead steps (55.9%). In meta, `00-discover-session.yaml` ships 1,248 dead bytes over 2 steps (36.4%). Every one of those bytes is delivered whole and charged against `deliveredChars` (`src/utils/batch.ts:98-123`), which is the quantity the batch bound is expressed in.

The checkpoint concentration is **definitional, not runtime**. Of `01-start-work-package`'s 10 gates, exactly **1 fires** on the modal create path (`pr-creation`); the other 9 are review-mode, Jira-platform or issue-creation branches. Of `13-submit-for-review`'s 9 gates, **4 fire** (`dco-sign-off-confirmation`, `build-artifact-check`, `review-received`, `review-outcome`); 5 are review-mode or stealth-mode. Across work-package's 44 gates: **20 certainly fire, 8 depend on run-time state, 16 never fire.** Across meta's 5: 1 fires, 1 conditional, 3 never.

### D2 — The delivery unit and the dispatch unit are both the whole activity.

`get_activity` (`src/tools/workflow-tools.ts:770`) takes no `activity_id` — it serves whatever the session cursor points at, entire. The batch bound (`src/utils/batch.ts:129-139`) then limits a worker context to `context_tokens × 0.35 × 4` characters and `3` distinct activities (`DEFAULT_BATCH_HEADROOM_FRACTION`, `DEFAULT_BATCH_MAX_ACTIVITIES`, `src/config.ts:200-201`).

- **Enables** the batch, and with it the harness-establishment saving `docs/dispatch_model.md:78` prices at "two to four times what the delivered content collapsing saves". `scripts/run-batch-benchmark.ts` defaults `--spawn-seconds=87`, the mean of four real dispatches (77, 65, 42, 165 s) on the profiled 27 July 2026 run.
- **Prevents** sub-activity dispatch. `01-start-work-package` is 52 flat steps / 21,217 B of YAML; `13-submit-for-review` is 33 steps / 15,079 B. Neither can be split across two contexts without splitting the file.
- **Costs**: with the budget binding after two activities on the main workflow (`docs/dispatch_model.md:95`), work-package's 15 activities need **at least 8 worker contexts**, at a measured mean spawn of 87 s ≈ **11.6 minutes of pure establishment**. The activity cap of 3 would give 5 contexts; the character budget is what takes it to 8, and 32.2% of the step bytes drawing that budget down are dead branches.

### D3 — A checkpoint is a full context handoff, and the corpus has 49 of them.

`yield-checkpoint.md` step 2 is explicit: on `status: yielded` the worker "STOPS — make no further tool calls until the orchestrator resumes you." The round trip that follows is fixed:

| Hop | Actor | Call |
|---|---|---|
| 1 | worker | `yield_checkpoint` |
| 2 | orchestrator | `present_checkpoint` |
| 3 | orchestrator | `git ls-tree -r --name-only origin/{branch} {planning_folder_path}` — a **remote** call, `present-checkpoint-to-user.md` step 3 |
| 4 | orchestrator | `AskQuestion` (user) |
| 5 | orchestrator | `respond_checkpoint` |
| 6 | orchestrator | harness `continue-agent` |
| 7 | worker | `resume_checkpoint` |

**7 hops per gate**, of which 4 are MCP calls, 1 is a network round trip to the git remote, 1 is a harness resume and 1 is a human.

Eight of the 44 work-package gates sit inside loop bodies, and **five of those carry a `#{instance}` discriminator, so they fire once per collection item**:

| Activity | Loop | `maxIterations` | Per-iteration gate |
|---|---|---|---|
| `04-research` | `assumption-interview` (forEach over `open_assumptions`) | 20 | `research-assumption-decision#{current_assumption.id}` |
| `05-implementation-analysis` | `assumption-interview` | 20 | `analysis-assumption-decision#{current_assumption.id}` |
| `07-assumptions-review` | `assumption-interview-loop` | **unbounded** | `assumption-decision#{current_assumption.id}` |
| `08-implement` | `assumption-interview` | 20 | `implementation-assumption-decision#{current_assumption.id}` |
| `10-post-impl-review` | `block-interview-loop` (forEach over `flagged_block_indices`) | 50 | `block-interview#{current_block_index}` |
| meta `02-resolve-target` | `component-selection` | 25 | `submodule-selection#{candidate_component.path}` |

That is **110 bounded per-iteration presentations plus one unbounded loop in work-package, and 25 in meta** — up to **770+ hops in work-package and 175 in meta from loop gates alone**, all strictly serial.

**A fourth fact, which is really D1's consequence and is the single largest lever in the system.** `src/tools/workflow-tools.ts:939-946` collects eager-bundling candidates with:

```ts
if (s.when !== undefined || s.condition !== undefined) continue;
```

A gated step is never eagerly bundled — regardless of size, regardless of whether its gate is already decidable. Measured effect:

| Workflow | Technique steps | Eager-eligible | Permanently lazy | Lazy share |
|---|---|---|---|---|
| work-package | 174 | 85 | **89** | **51.1%** |
| meta | 23 | 11 | **12** | **52.2%** |

Of the 89, 23 are lazy only because an enclosing loop carries a condition. Resolving refs to files: work-package eagerly bundles **200.6 KB** and leaves **189.8 KB over 69 resolvable `get_technique` round trips**. Three activities bundle **nothing at all**: `11-validate` (8/8 gated, 19.0 KB lazy), `13-submit-for-review` (17/17 gated, 42.7 KB lazy over 17 fetches), `09-lean-coding-audit` (all refs cross-workflow). Meta's `03-dispatch-client-workflow` — the orchestrator's own hot loop, re-entered once per client activity — bundles **0 KB and fetches 28.6 KB over 6 lazy `get_technique` calls**.

And the eager budget is nowhere near binding. At a 200,000-token window it is `200000 × 0.8 × 4 = 625 KB per activity`. The largest single activity's entire technique surface is 46.3 KB. **The budget is ~13× underused on the heaviest activity and the `gated ⇒ lazy` predicate is the sole reason 51% of steps stay lazy.** Second-order: `workflow-tools.ts:1013` collects linked resource ids only for steps that made it into the bundle, so the 89 lazy steps' resources (37 resources, 194 KB in work-package) are lazy too.

**Estimated modal-path hop budget for one work-package run**: ~180 orchestrator/worker hops at the per-activity floor (15 × [`next_activity` + `record_usage` + spawn/continue + ~6 git ops + ~2 README ops]), plus 69 lazy `get_technique`, plus 140 gate hops for the 20 certain gates — **≈ 390 hops before a single conditional gate, loop iteration or lazy `get_resource`**.

---

## Step 2 — Alternative architectures

### Option A — Invert D1: the server evaluates gates

Reverse the most consequential decision. The server already has the bag and the evaluators; make the delivery path use them.

**Interface.** `get_activity` gains a three-valued liveness pass over the step tree, run against `state.variables`:

```
get_activity → {
  steps:          [...],   // gate verdict TRUE or UNKNOWN — body delivered
  pruned_steps:   [ { id, gate, verdict: "false" } ],  // id + expression only, no body
  gate_schedule:  { certain: [...], possible: [...], excluded: [...] },
  _meta: { pruned_chars, pruned_steps_count }
}
```

**Data flow.** `evaluateCondition` / `evaluateWhenExpression` move from `scripts/`-only into a new `src/utils/liveness.ts`, called from the `get_activity` handler before the bundling loop. The bundling predicate at `workflow-tools.ts:941` changes from *ungated* to *not-provably-dead*. Verdicts are three-valued: bundle on TRUE or UNKNOWN, skip on FALSE. Loop-shadowing inherits the enclosing verdict, so a loop whose own condition is provably false takes its whole body with it.

**Module boundary.** `src/schema/{condition,when-expression}.ts` stops being an authoring-guard library and becomes a delivery dependency. `scripts/smoke/smoke-orchestrator.ts` — which already imports `evaluateCondition` and drives a full walk — becomes the conformance oracle rather than a test fixture.

**What it buys.** 22,262 dead bytes off work-package's wire and off the batch budget (32.2% of step bytes); the bundling predicate flip pulls the decidable share of 89 lazy steps / 189.8 KB / 69 round trips into a 625 KB budget currently spending 200.6 KB. `13-submit-for-review` goes from 0 KB eager and 17 lazy fetches to bundling its ~13 modal-path-live steps.

**What it gives up.** Host-agnosticism survives (the mode is additive; an agent that ignores `pruned_steps` behaves as today) but **the server's evaluator and the worker's evaluator become two implementations of one semantics, and divergence is silent**: a worker that never receives a step cannot report skipping it, and `steps_completed` manifests validate against what was delivered. It also makes the bag's freshness load-bearing — today `variables_changed` need only reach the envelope; under A it must reach the session before the next `get_activity`.

### Option B — Decompose differently: the segment, not the activity, is the unit

Keep every feature; move the boundary to the gate. An activity becomes a sequence of **segments** delimited by its own checkpoints.

**What becomes internal.** The activity file stops being the delivery quantum. `get_segment { session_index, segment_index }` joins `get_activity`. `01-start-work-package`'s 52 steps across 10 gates become 11 segments averaging 4.7 steps; `13-submit-for-review`'s 33 steps across 9 gates become 10 segments averaging 3.3 steps. `commit-and-persist` stays per activity — the commit boundary and the delivery boundary decouple.

**What becomes external.** The batch bound stops counting activities. `batchBound.maxActivities` (`batch.ts:135`) becomes `maxSegments`, and the cap's stated purpose — covering "the establishment the server never delivers, the code the worker reads, the artifacts it drafts, and degradation across a long walk" (`src/config.ts:107-110`) — maps onto a unit that actually tracks context growth, because a segment is exactly the run between two halts.

**What it buys.** Heavy activities become dispatchable in pieces. Today `01` (21,217 B) and `13` (15,079 B) arrive whole even though the modal path executes 25 and 13 steps. Under segments the orchestrator can retire a spent context at a natural seam instead of at an activity boundary that may be 40 steps away.

**What it gives up — and this is disqualifying on its own.** Worker continuity across a gate. Today a resumed worker keeps everything: the code it read, the artifacts it drafted, its model of the codebase. Segmenting invites re-establishment at every seam, which is precisely the cost #407 was built to remove and which `docs/dispatch_model.md:78` prices at 2–4× the content saving. B only pays if segments default to staying inside one context and split only under budget pressure — at which point it is a change to the *bound*, not to the dispatch topology, and Option C subsumes it.

### Option C — Change the invariant: conserve halts, not characters

**The property the current system conserves is delivered characters.** `deliveredChars` (`batch.ts:98`) is the accounting primitive; `batchBound` (`batch.ts:129`) is expressed in it; `scripts/run-batch-benchmark.ts` counts with the server's own function precisely "so this script cannot report a saving the bound disagrees with"; and the same script records that server-side wall-clock "is a wash, and that is the finding, not a defect". Characters are the conserved quantity and time is explicitly not.

**Conserve instead the number of times a human or a spawn sits on the critical path.**

**Concrete shape.**

1. At `next_activity`, the server derives the activity's **gate schedule** from the bag: `certain` (condition provably true), `possible` (depends on a variable the activity's own steps bind), `excluded` (provably false). On the modal path that partitions work-package's 44 gates as 20 / 8 / 16 and meta's 5 as 1 / 1 / 3.
2. Gates that are `certain` **and** whose `message` templates no variable the activity itself declares as a step output are **hoistable**: presentable before the worker spawns.
3. New tools `present_checkpoints` / `respond_checkpoints` in `src/tools/workflow-tools.ts` resolve N gates in one round trip against one `AskUserQuestion`.
4. A per-iteration loop gate becomes **one batched presentation over the collection** instead of N sequential ones. The corpus already does this by hand in exactly one place — `workflows/work-package/workflow.yaml`'s `fragments.checkpoints.assumption-interview` offers "accept agent positions for the batch / defer all / interview individually" as a manual escape from the very loop that follows. C makes that the mechanism rather than a per-activity prose workaround.
5. `blocking` (`src/schema/activity.schema.ts:113`) stops being "agent-honored" and becomes the server's refusal predicate: a `blocking: true` gate whose condition depends on a step output is never hoisted.
6. `batchBound` gains a third limit, `maxHalts`, counted off yield events for the scope — the bound finally denominated in the thing the topology actually spends.

**What improves.** The 16 provably-dead gates cost nothing (today they cost their definition bytes and an agent evaluation each). The 20 certain gates collapse toward ~8–10 presentation events. The five per-iteration loop gates — 110 bounded presentations plus one unbounded loop, at 7 hops each — collapse to 5 batched presentations with an opt-out to individual interview. That is the largest single reduction available anywhere in the corpus.

**What degrades.** Interaction quality, in a specific and checkable way. `issue-review` in `01-start-work-package` says "Here is the drafted issue" — hoisting it would ask before drafting. So hoisting is sound only for gates whose message templates nothing the activity binds, which is a static property of the YAML (`{...}` placeholders in `message` versus the activity's declared step outputs) and therefore enforceable by a guard alongside the existing 26 `check-*.ts`.

---

## Step 3 — Trade-off matrix

Baseline: work-package, modal create path, 200,000-token worker window.

| Metric | Current | A (server evaluates gates) | B (segment unit) | C (conserve halts) |
|---|---|---|---|---|
| Dead step bytes delivered | 22,262 B (32.2%) | **~0** (pruned) | 22,262 B (unchanged — segments still carry their gates) | 22,262 B unless combined with A |
| Eager-bundle share of technique steps | 85/174 (48.9%) | **~140/174 est.** (all not-provably-dead) | 85/174 | 85/174 |
| Lazy `get_technique` round trips | 69 resolvable, 189.8 KB | **~25 est., ~70 KB est.** | 69 | 69 |
| Eager budget utilisation | 200.6 KB of 625 KB (32%) | ~390 KB of 625 KB (62%) | lower per segment, same total | unchanged |
| Worker contexts for 15 activities | ≥8 (budget binds at 2) | **≥5** (cap binds, budget freed by pruning) | 5–11 depending on `maxSegments` | ≥8 |
| Spawn cost at 87 s/dispatch | ~11.6 min | **~7.3 min** | 7.3–16 min | ~11.6 min |
| Gate hops, certain gates | 20 × 7 = 140 | 140 | 140 | **~60** (8–10 batched presentations) |
| Gate hops, per-iteration loop gates | 110+ × 7 = 770+ | 770+ | 770+ | **35** (5 batched) |
| Gates evaluated by the agent | 44 | **28** (16 excluded server-side) | 44 | 28 |
| New public API surface | — | +2 response fields, 0 tools | **+1 tool** (`get_segment`), schema change to `Activity` | **+2 tools**, +1 bound field |
| `src/` LOC added (est.) | — | ~200 (`liveness.ts` + handler) | ~600 (segmentation, cursor, bound rework) | ~350 (schedule + batch tools + `maxHalts`) |
| Definition edits required | — | **none** | every activity re-cursored | ~20 gates annotated or derived |
| New guard scripts | — | 1 (`check-gate-decidability.ts`) | 2 | 1 (`check-gate-hoistability.ts`) |
| Host-agnosticism (`dispatch_model.md:5`) | full | full (additive) | **reduced** — inline fallback must track a segment cursor | full |
| Silent-failure risk | low | **high** — divergent evaluators drop steps unobserved | medium — cursor drift | low — batching is visible to the user |
| Worker continuity across a gate | preserved | preserved | **lost by default** | preserved |

**Unchanged under all three**: the sealed-session model, `session_index` authentication, the trace store, `record_usage`'s per-activity resolution (`dispatch-activity.md#account-every-activity`), and the three batch carve-outs (`batch.ts:152-159`).

---

## Step 4 — Migration path

The most promising target is **A and C staged together**, because both key on the same new capability — server-side gate evaluation against the bag — and both are additive to the wire format. B is not on the path.

Each stage leaves the system working.

**Stage 1 — Emit the reading, act on nothing.** Add `src/utils/liveness.ts` wrapping `evaluateCondition` / `evaluateWhenExpression` with three-valued semantics and loop-shadow inheritance. Have `get_activity` attach `_meta.gate_schedule` and `_meta.pruned_chars` as observability only. Ship `scripts/check-gate-decidability.ts` classifying all 49 corpus gates as bag-decidable-at-entry / step-dependent / undecidable, and stamp the counts as a baseline next to `scripts/stamp-corpus-baseline.ts`. *Nothing consumes the new fields; behaviour is byte-identical.* Surface: ~150 LOC in `src/utils/` + ~120 LOC script.

**Stage 2 — Flip the bundling predicate.** Replace `workflow-tools.ts:941` with a liveness call: bundle on TRUE or UNKNOWN, skip on FALSE. This is a strict superset of today's behaviour for ungated steps and a strict subset for provably-dead ones, so **no worker can ever lose a step it would have executed**. This is where the bulk of the saving lands and it carries no correctness risk. Expected: the eager bundle moves from 200.6 KB / 85 steps toward ~390 KB / ~140 steps, and lazy `get_technique` from 69 to roughly 25. Verify with `npm run bench:batch` and `npm run bench:dispatch`, both of which count with `deliveredChars` and so cannot report a saving the bound disagrees with.

**Stage 3 — Batch the gate presentation (Option C's core).** Add `present_checkpoints` / `respond_checkpoints` to `src/tools/workflow-tools.ts`, taking a list of ids the schedule marked `certain` and message-independent. Add `scripts/check-gate-hoistability.ts` failing any gate marked hoistable whose `message` templates a variable the activity's own steps declare as an output. Edit the five per-iteration loop gates to declare a batched presentation with an individual-interview opt-out, generalising the hand-rolled `assumption-interview` fragment already in `workflow.yaml`. Expected: certain-gate hops 140 → ~60; per-iteration hops 770+ → 35.

**Stage 4 — Prune the delivered step list.** Only after Stages 2–3 have run in production and the `batch_refused` / `activity_redelivered` tallies show no regression, drop provably-dead step **bodies** from `steps[]`, leaving `{ id, gate, verdict }` rows under `pruned_steps`. Expected: 22,262 B off work-package, 1,248 B off meta.

**Stage 5 — Denominate the bound in halts.** Add `maxHalts` to `BatchBound` (`batch.ts:19-24`) and `batchState` (`batch.ts:149`), counted off the scope's yield events. Meaningless before Stage 3, because until gates batch, the halt count is not reducible.

**The hardest step is Stage 4.** Not because the evaluation is difficult — `scripts/smoke/smoke-orchestrator.ts:31` already evaluates conditions across a whole walk — but because it is the first stage whose failure mode is silent. A wrongly-pruned step is one the worker never sees, cannot report, and cannot fail a manifest check on: `steps_completed` validates against what was delivered, so the gap closes over itself. Three mitigations, all costing back part of the saving: keep the id and gate expression in the payload so the manifest has a row to disagree about; have the worker re-evaluate the retained expressions and raise on divergence; and gate the rollout on `scripts/smoke/smoke-orchestrator.ts` walking both workflows with pruning on and off and diffing the step manifests. Note also that `batch_refused` already demonstrates the forward-compatibility hazard here — `docs/dispatch_model.md:113` records that adding one history event type made older servers read the session as `SEAL_MISMATCH`. A `pruned_steps` field is safer (it is response-shaped, not history-shaped), but any new history event Stage 4 emits inherits that rollback problem.

---

## Step 5 — Decision

**Take A+C, staged as above. Reject B.**

A and C are one mechanism wearing two hats: both need the server to read the bag through the evaluators it already ships, and both are additive to the wire, so the inline fallback and every non-cooperating harness keep working unchanged. Between them they address the two costs the measurements actually show — 32.2% dead definition bytes with a 51% lazy-technique rate on one side, and 7-hop serialised gates multiplied by loop cardinality on the other. B is rejected because its one real benefit (splitting `01` and `13`) is obtainable through A's pruning at a fraction of the cost, while its price is the worker continuity that #407 was built to buy.

Sequence matters: **Stage 2 first**, because it is the largest saving with zero correctness risk, and its result de-risks everything after it. Stage 4, the highest-risk stage, is also the smallest saving (22,262 B against ~120 KB of bundling gain) — so if the divergence risk proves unmanageable, dropping Stage 4 costs 18% of the programme's value.

### The conservation law

**Round trips, bytes, and freshness form a closed triangle. Every reduction in round trips is paid for in staleness, and the workflow's own gate density fixes the exchange rate.**

The pairwise trades are already visible in the code:

- **Fewer contexts** means more bytes in one window — which is exactly what `BATCH_HEADROOM_FRACTION = 0.35` prices, and why the budget binds after two activities on the main workflow while the activity cap of 3 goes unused.
- **Fewer bytes** requires a liveness decision, and a liveness decision requires the bag to be current — so pruning buys batch room by spending on state freshness.
- **Fewer halts** means deciding earlier on less evidence, and a decision taken too early produces a rework loop; a rework loop is a re-delivery, which is more bytes and possibly a new context. `13-submit-for-review`'s `body-non-conformant` gate is the corpus admitting this in miniature: two automatic re-render iterations, then a gate that can `transitionTo: submit-for-review` and re-run the whole activity.

The system already concedes the inescapable term and says so plainly. `batch.ts:146-148`: `mayContinue` "is answered before the lazy fetches of the activity just taken draw down the same budget, so `true` can still become a refusal at the next boundary." And `docs/dispatch_model.md:99`: admission is checked before a delivery rather than after, so an admitted activity can carry a batch past the budget "by up to one heavy activity, 261,827 characters on measured content" — because "refusing after composing would pay the composition and still not un-deliver it."

That is the law in one sentence: **you can know the answer, or you can act cheaply, but the reading you act on is always older than the act.** No topology escapes it. What a topology chooses is only *how* stale — a batch decides context capacity one activity early, gate hoisting decides a user question one activity early, and pruning decides branch liveness one activity early. The programme above is worth running because in this corpus the staleness window is one activity wide and the gate conditions are dominated by mode variables (`is_review_mode`, `stealth_mode`, `issue_platform`) that are bound in `01-start-work-package` and never change again — so 16 of 44 gates and 22,262 bytes can be decided at entry with no staleness cost whatsoever.

---

## Appendix — costed opportunity register

Ordered by saving per unit of build cost.

| # | Opportunity | Surface | Saving (measured / estimated) | Build cost |
|---|---|---|---|---|
| 1 | Bundle steps whose gate is not provably false | `src/tools/workflow-tools.ts:941` + new `src/utils/liveness.ts` | ~44 fewer `get_technique` round trips, ~120 KB moved from lazy to bundled; eager budget utilisation 32% → 62% | ~200 LOC, no definition edits, no correctness risk |
| 2 | Batch the five per-iteration loop gates | definition edits in `04`, `05`, `07`, `08`, `10` + `present_checkpoints` tool | 110+ presentations → 5; ~735 hops removed | ~200 LOC tool + 5 activity edits + 1 guard |
| 3 | Hoist certain, message-independent gates | `next_activity` gate schedule + `respond_checkpoints` | 20 certain gates → ~8–10 presentations; ~80 hops | ~150 LOC + `check-gate-hoistability.ts` |
| 4 | Prune provably-dead step bodies | `get_activity` response shape | 22,262 B (work-package), 1,248 B (meta); frees batch budget, 8 contexts → ~5, ~4.3 min of spawn time | ~100 LOC + high-risk verification harness |
| 5 | Cache the orchestrator's own six techniques | `03-dispatch-client-workflow.yaml` — all 6 technique steps gated, 28.6 KB, 0 eagerly bundled | 6 lazy fetches per client-activity iteration × 15 iterations | falls out of #1 for free once the predicate flips |
| 6 | Drop the per-gate `git ls-tree` against origin | `present-checkpoint-to-user.md` step 3 | one network round trip per firing gate — 20+ per modal run | definition edit; cost is a stale-link risk the step exists to prevent |
| 7 | Concurrent independent probes in `01-start-work-package` | steps `analyze-repo-with-gitnexus`, `detect-merge-strategy`, `detect-project-type`, `check-issue` — mutually independent given `host_repo_path`, currently serial | 4 serial probes → 1 wave | needs a concurrency field on `kind: loop` / a parallel step group; `activity.schema.ts:143` has none, though `scatter-gather.md` and `harness-compat::spawn-concurrent` already define the primitive |
| 8 | Concurrent read-only reviews in `10-post-impl-review` | `code-review`, `test-suite-review`, `architecture-summary` are independent analyses run in sequence | 3 serial analyses → 1 wave | same schema gap as #7 |
| 9 | Denominate the batch bound in halts | `src/utils/batch.ts:19-24, 129-160` | makes the bound track the quantity the topology spends | ~120 LOC; only meaningful after #2 and #3 |
| 10 | Gate the warn-only fan-out figures | `src/utils/fan-out.ts:12-14` — "nothing gates on these" | no direct saving; makes regressions from #1 and #4 arguable | ~60 LOC + a stamped baseline via `scripts/stamp-corpus-baseline.ts` |
