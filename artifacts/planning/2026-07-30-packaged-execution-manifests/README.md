# Packaged execution manifests — attesting stepwise fidelity without the tool-call drum-beat

> Planning · Created 2026-07-30 · **Status:** Explored and measured. Feature **not recommended as
> specified**; redirected — see [run-analysis-pr1877.md](run-analysis-pr1877.md) §7.

> Recorded outside the workflow engine at the user's direction (no `meta` walk for this session).

## Outcome

Measured against a real full `work-package` walk ([PR #1877 review](run-analysis-pr1877.md)):
packaging execution manifests would remove **~6% of tool calls and ~0% of tokens**, because 83% of
calls are the agent's own domain work and a fresh worker needs the content in its context window
regardless of transport. **Do not build it as a tool-call reduction.**

The run identifies a real target four times larger: **resumed dispatches — 12 of 33, ~25% of the
run's 4.13M tokens** — caused by `workers-need-full-delivery` forcing `fresh` mode so every resume
re-pays full delivery. Packaging is a plausible mechanism *there*, reframed as cheap cold-start /
resume rehydration rather than call reduction. The attestation problem largely dissolves under that
framing, because a resumed worker is already gated into its activity.

The same run also shows the existing attestation surface failing far more severely than packaging
would threaten: `trace_tokens` resolved **empty**, `activity_usage` covered 11 of 33 dispatches, and
an out-of-band dispatch that produced the two Critical findings the verdict rested on is invisible
to the server entirely.

## The idea under exploration

Agents driving workflow-server make a large number of tool calls. The proposal: at workflow
start, the server **packages each activity's execution manifest** and delivers it to the
agent's planning folder — not the definition files verbatim, but a per-activity, resolved
execution package (step bodies, composed techniques, resource bodies). The agent then works
from the cached package instead of pulling content step by step.

The stated caveat: without the per-call drum-beat, the server loses the stepwise accounting
mechanism it mandates. The question posed: **how do we assure faithful stepwise execution over
a packaged, delivered, cached execution manifest?**

The candidate mechanism offered for discussion was a signed (tamperproof) binary the agent must
run before starting the workflow, which watches the filesystem and attests to progress.

## Executive summary of the exploration

1. **The premise overstates present enforcement.** Of the seven fidelity layers in
   [`docs/workflow-fidelity.md`](../../../docs/workflow-fidelity.md), only L1 (HMAC token
   integrity) and L2 (checkpoint gate) are hard gates. L3–L6 warn and do not block. The doc's
   own Limitations section already states step execution is not provable. Packaging therefore
   degrades **detection**, not enforcement.

2. **Two detection losses are real**, and one is usually overlooked:
   - **L5 technique-fetch fidelity** — the "manifested step with no delivery event" warning,
     which is the silent-degradation signature. `bundleTechniques` already downgraded this from
     *content was consumed* to *content was available*; packaging completes that erosion.
   - **L7 mechanical trace resolution** — trace fidelity is proportional to tool-call frequency.
     A packaged activity emits ~2 trace events, losing per-step timing, per-step attribution,
     and last-call-before-silence failure diagnosis. Probably the larger loss.

3. **The signed filesystem-watcher binary is rejected.** It attests to the wrong observable,
   confuses observer integrity with observation integrity, is client-side DRM against a party
   that owns the machine, and mis-specifies the threat model. See
   [attestation-options.md](attestation-options.md#rejected-signed-filesystem-watcher).

4. **Threat model is the pivot.** The adversary is a lazy or context-truncated LLM, not a
   malicious human. Against that adversary, *hard to skip accidentally* plus *detectable
   post-hoc* is sufficient; cryptographic unforgeability is unnecessary and code signing is
   theatre.

5. **The workable mechanism is a witness chain** — server-minted per-step nonces embedded in
   the delivered package and returned, hash-chained, in `step_manifest`. Verified in one call at
   the activity boundary. Upgrades L5 from *reported* to *read, and sequentially committed*, at
   zero extra tool calls. Complemented by outcome attestation and spot-audit escalation.

6. **An unresolved fork blocks design.** Packaging trades **round-trip economy for context
   economy** — it converts MCP calls into file reads but defeats progressive disclosure. Which
   cost is actually hurting is not yet established, and the two answers point at different
   designs. Instrumentation precedes design here.

## Open questions — resolved by measurement

| # | Question | Resolution |
|---|----------|-----------|
| Q1 | Is the pain **round-trip count / latency**, or **context consumption**? | **Neither, in delivery.** ~157 of 921 calls are server protocol; the packageable subset is 54 (5.9%). Protocol payload is ~11% of tokens and packaging does not remove it — transport changes, presence does not. The pain is repeated cold-start context reconstruction across 33 dispatches. |
| Q2 | Where do the calls actually go, measured? | **83% is the agent's own domain work** (diff reads, greps, tests, `gh`, RAG). My `commit-and-persist` / `sync-progress-status` prediction was wrong — nothing in the protocol dominates. |
| Q3 | Is losing L7 per-step trace resolution acceptable? | **Moot.** `trace_tokens` resolved empty on the measured run; L7 produced nothing. This flips from a packaging risk to an existing defect (P3). |
| Q4 | Do checkpoints stay live calls? | Yes — L2 is the only hard sequence gate. Unchanged, and it partitions a walk into checkpoint-bounded packageable segments. |
| Q5 | How is package staleness handled? | Still open, but now scoped to the resume-rehydration reframing: packages carry workflow+activity version and are rejected on drift (L3 already detects it). |

## Progress

| # | Item | Description | Status |
|---|------|-------------|--------|
| — | [Attestation options](attestation-options.md) | What the drum-beat buys, why the watcher fails, the workable mechanisms | ✅ Complete |
| — | [Run analysis — PR #1877](run-analysis-pr1877.md) | Measured call mix, token mix, cost centres, verdict | ✅ Complete |
| — | [Ranked optimisations](optimisations.md) | Dispatch-count cost law, checkpoint firing positions, O1–O6 ranked with a suggested sequence | ✅ Complete |
| — | [#353](https://github.com/m2ux/workflow-server/issues/353) | Tracking issue — server PR (`main`) + corpus PR (`workflows`), scope and exclusions | ✅ Raised |
| — | O1 — context-scoped delivery ledger + resume-time references (~25–31%) | #353 PR 1 §1.1–1.2, then PR 2 §2.1 | ⬜ Not started |
| — | O2 — checkpoint-at-entry (`11-validate` step 0) + guard | #353 PR 1 §1.4, PR 2 §2.2 | ⬜ Not started |
| — | O3 — ledger the invisible third | #353 PR 1 §1.3 — instrument for verifying O1 | ⬜ Not started |
| — | O4 — trace emission | Excluded from #353 pending diagnosis; needs its own issue | ⬜ Not started |
| — | ~~Packaged manifests as call reduction~~ | Dropped — ~6% call saving, 0% token saving | ⛔ Dropped |
| — | ~~Signed filesystem-watcher~~ | Dropped — wrong observable, wrong threat model | ⛔ Dropped |

## Links

| Resource | Link |
|----------|------|
| Fidelity layers + Limitations | [`docs/workflow-fidelity.md`](../../../docs/workflow-fidelity.md) |
| Hybrid technique bundling | [`docs/resource_resolution_model.md`](../../../docs/resource_resolution_model.md) (§12) |
| Reference delivery (server) | `src/utils/delivery.ts` |
| Trace tokens | `src/trace.ts` |
| Prior art — token reductions | [2026-07-16-token-usage-reductions](../2026-07-16-token-usage-reductions/README.md) |
| Prior art — token tracking | [2026-07-14-token-use-tracking](../2026-07-14-token-use-tracking/) |
| Prior art — execution traces | [2026-03-25-execution-traces](../2026-03-25-execution-traces/) |
| Prior art — checkpoint enforcement | [2026-03-12-checkpoint-enforcement-reliability](../2026-03-12-checkpoint-enforcement-reliability/README.md) |
| Measured run (source data) | `~/projects/dev/midnight-agent-eng/.engineering/artifacts/planning/2026-07-28-review-midnight-node-pr-1877/` |
