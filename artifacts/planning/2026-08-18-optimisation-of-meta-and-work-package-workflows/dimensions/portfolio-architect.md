---
Target: /home/mike1/projects/dev/workflow-server — workflows/meta/** and workflows/work-package/**, with src/tools/, src/utils/, src/config.ts and tests/e2e/harness.ts as the implementation surface
Evaluation Date: 2026-08-18
Lens: architect (51) — "Where the code should GO"
Dimension: Orchestration Topology and Critical Path
---

# Portfolio Architect — Orchestration Topology and Critical Path

The server composes a payload in 52 milliseconds. A model turn on this workload costs 13.1 seconds. Every architecture below is an answer to the same question: what is the topology worth building when the round trip is 250 times more expensive than the work it carries?

## Measurement basis

Every figure is measured at `workflow-server@1297e655`, `workflows@2e8b6297`, work-package v3.44.0.

**The reference walk** — `bench:token`, twelve-activity `skip-optional` path, one agent, fresh mode:

| Call | Count | Characters |
|---|---:|---:|
| `get_resource` | 162 | 527,683 |
| `get_technique` | 24 | 146,205 |
| `get_activity` | 12 | 520,075 |
| `next_activity` | 12 | 1,195 |
| `get_workflow` | 1 | 108,356 |
| `yield` / `respond` / `resume_checkpoint` | 30 | 6,828 |
| `start_session` | 1 | 789 |
| **Total** | **242** | **1,311,131** |

The brief's 1,302,319 is the four content channels alone; the 8,812-character difference is `start_session`, `next_activity` and the thirty checkpoint calls. Both figures reproduce the committed fixture.

**The same walk with collapse on** (`--context-mode=persistent`): 203 calls, 900,256 characters. Calls fall 16.1%, characters 31.3%.

**Wall-clock coefficients**, from the committed profiler (`.engineering/artifacts/planning/2026-08-02-workflow-startup-cost/runs-profiled.txt`) over the five real runs whose startup window carries no overnight gap: 142.5 minutes over 673 model responses — **12.7 seconds per response, median 13.1**. Mean spawn cost 87 seconds (77, 65, 42, 165). Server composition, from `bench:batch`: 314 ms over six calls, **52 ms a call** — 0.4% of one model turn.

**Batch cap sweep**, twelve-activity path, eager `get_activity` only, driven through a harness with `batchMaxActivities` set. No shipped instrument can do this: `tests/e2e/harness.ts:36-43` builds its config literal without `batchMaxActivities` or `batchHeadroomFraction`, and `loadConfig` (`src/config.ts:605-607`) is the only reader of `BATCH_MAX_ACTIVITIES` and `BATCH_HEADROOM_FRACTION`. Every benchmark therefore runs at the compiled defaults regardless of environment.

| Cap | Headroom | Worker contexts | Eager characters |
|---:|---:|---:|---:|
| 1 | 0.35 | 12 | 904,085 |
| **3** | **0.35** | **4** | **730,060** |
| 6 | 0.35 | 3 | 728,358 |
| 12 | 0.80 | **1** | **604,526** |

**The meta tree**, same method: five dispatches cost 293,294 eager characters; one context costs 137,140 — **53.2% less**. Its `get_workflow` is 104,571 characters, paid once.

## Step 1 — Current architecture fingerprint

Three decisions are load-bearing. Everything else in the topology is a consequence.

### Decision 1 — The activity is the unit of dispatch, delivery, accounting and the session pointer

One `currentActivity`. `next_activity` moves it, `get_activity` delivers it, `batchActivities` counts distinct ones (`src/utils/batch.ts:72-86`), `record_usage` writes one row per one, and the step manifest validates one at a time.

*Enables:* per-activity cost resolution the batch settings are revised from; a failed worker costs one activity, not a run; a manifest the server can check.

*Prevents:* any dispatch granularity that is not an integer number of activities. Two activities cannot share a payload even inside one batch — each still needs its own `next_activity` and `get_activity` pair.

*Costs:* 24 round trips on the reference walk before a single technique or resource is fetched. Four worker contexts on the twelve-activity path at the shipped cap, against one that the character budget alone would admit.

### Decision 2 — Variables travel by envelope, so the server cannot see inside an activity

`ActionSchema` states it plainly (`src/schema/activity.schema.ts:26`): "The server has no action interpreter: executing `set` is the worker's job, and its value reaches the session variable bag when the worker reports it in the `variables_changed` its orchestrator relays on `next_activity`."

*Enables:* a server with no domain plane. Eighteen tools, all session control-plane; workflow definitions stay data.

*Prevents:* the delivery layer from deciding any gate whose variable is written in the same activity. `gate-liveness.ts:157` returns `undefined` the moment a read path is in `writtenInActivity`, and it must — the write will not arrive until the activity ends.

*Costs, measured at session creation:* of work-package's 176 technique steps, 108 carry no gate. Of the 68 that do, **1 answers true, 3 answer false, 8 have no answer because their variable is written inside the same activity, and 56 have no answer because nothing has bound the variable yet.** meta: 23 steps, 11 ungated; of the 12 gated, 1 true, 0 false, 4 same-activity, 7 unbound. The 56 and the 7 shrink as a real run fills the bag — the reference walk bundles 66 of 90 delivered technique steps, 73.3%. The 8 and the 4 never shrink. They are the permanent residue of the envelope relay.

Fifty `set`, `validate`, `log` and `message` actions sit across 45 action steps in the two trees — 20 `set`, 14 `validate`, 8 `message`, 8 `log`. Four of the work-package action steps declare no actions at all. Every one costs a model turn to execute a verb the server already parses.

### Decision 3 — One decision in flight per session

`activeCheckpoint` is a single slot. `yield_checkpoint` throws when it is occupied (`src/tools/workflow-tools.ts:1385-1387`); `next_activity` refuses while it is set (`:542-546`); `resume_checkpoint` refuses until it clears (`:1533-1535`). A response is keyed `activityId-checkpointId` with no agent component, which is what makes replay work across a worker replacement.

*Enables:* one user-facing question queue with no ambiguity about which question an answer answers; free replay after a lost worker.

*Prevents:* concurrent workers, batched presentation, and parking a long wait beside live work.

*Costs:* 44 checkpoints in work-package across 13 of 15 activities — 10 in `01-start-work-package`, 9 in `13-submit-for-review`, 0 in `11-validate` and `14-complete` — and 5 in meta, 3 of them in `00-discover-session`. Nine sit inside loop bodies. Each gate costs four server calls (`yield`, `present`, `respond`, `resume`), roughly nine turn boundaries across three contexts, one human turn, and a hard three-second floor (`:1586`, `:1627-1631`). Fifteen work-package checkpoints carry `autoAdvanceMs`: fourteen at 30,000 ms and one at 15,000 ms. In review mode the workflow's own rule resolves every one of them by `auto_advance`, and the server enforces the full timer — **435 seconds of literal sleep on the critical path of a headless run**.

`13-submit-for-review.yaml:347-387` is the extreme case and survives the remediation untouched: an unbounded `doWhile` whose body is one empty action step and one checkpoint offering "still waiting". It holds a worker context, the batch identity and the session's only checkpoint slot for the entire duration of a human pull-request review.

### What the remediation already closed

Server PRs #467/#471 and definition PRs #468/#470 shut four topology findings, and this report does not re-price them: gate-aware bundling exists (`src/utils/gate-liveness.ts`, 176 lines), the batch reading is taken at the activity boundary (`src/tools/workflow-tools.ts:740-757`), `get_technique` accepts an `activity_id` to check against (`src/tools/resource-tools.ts:639`), and block deduplication is response-local with per-entry hashing of inherited `note` and `items` (`src/utils/delivery.ts:146-192`).

What remains is the shape itself.

## Step 2 — Three alternative architectures

### Option A — Invert the dominant decision: deliver the run, not the activity

Make the *run* the delivery unit and the activity a cursor inside it. The transition census says this is available: **10 of work-package's 15 activities and all 5 of meta's have at most one outgoing edge**, and 12 of work-package's 27 transitions carry no condition. On the reference path the branch points are exactly four — `codebase-comprehension` (4 exits), `assumptions-review` (5), `strategic-review` (3), `submit-for-review` (3). Everything between them is a straight line the server can see at composition time.

**Interfaces.** `get_run { session_index, agent_id, context_tokens, from_activity }` returns an ordered list of activity payloads — each with its own step bundle — plus one merged resource map deduplicated across the whole run, stopping at the first activity with more than one live exit or the eager budget, whichever comes first. `next_activity` splits: `report_activity { session_index, activity_id, manifest, variables_changed }` records completion without gating the next delivery.

**Data flow.** The worker walks the run without contacting the server between activities. It calls back at a branch, at a gate, or at the run's end.

**Boundaries.** The batch bound moves from the delivery call to run composition; `deliveredChars` counts a run. The activity keeps its identity in the manifest, the usage row and the trace, and loses it as a delivery unit.

**Buys.** Twelve `get_activity` and twelve `next_activity` calls become at most four and four. Worker contexts fall from four to one: three spawns at 87 seconds is 261 seconds, and against the per-activity topology the profiled runs actually exhibit — five workers for four meta activities — it is eleven spawns and 957 seconds. Eight `continue-batch` handovers disappear, each a full orchestrator wake, prompt composition and worker resume. Eager delivery falls from 730,060 characters to 604,526, and the whole walk running in one context turns on collapse for activities 2 through 12, which is the measured 162-to-123 fall in resource calls.

**Costs.** Run composition and a run-shaped manifest, roughly 400 lines. The batch bound reworked around a run. `bench:batch` re-pointed.

**Breaks.** Per-activity usage resolution: `record_usage`'s contract (`dispatch-activity.md`, `account-every-activity`) is one row per activity supplied by an orchestrator that is woken per activity, and a run wakes it once. The row has to move onto the worker's report, and a worker cannot self-measure. `commit-and-persist` loses its per-activity trigger, which is where the Progress table and the artifact push live. And a lost worker now costs the run rather than one activity — the failure mode the current bound was chosen to bound.

### Option B — Decompose differently: split the decision plane from the delivery plane

Keep the activity as the delivery unit. Take gates out of the walk.

**What becomes internal.** `activeCheckpoint: {…}` becomes `pendingDecisions: [...]`. Two tools replace four: `request_decisions { session_index, checkpoint_ids[] }` posts *n* gates in one call and returns one handle; `resolve_decisions { handle, answers[] }` applies them all. The yield/present/respond/resume quadruple — four server calls and roughly nine turn boundaries per gate — collapses to a post and a resolve.

**What becomes external.** A decisions surface the meta orchestrator drains, which `get_workflow_status` already half-exposes through `last_checkpoint`.

**What it changes in the walk.** A worker posts every gate it can see coming in the activity, keeps executing steps that do not read those variables, and blocks only at the first step that does. `01-start-work-package`'s 10 gates become one presentation; `13-submit-for-review`'s 9 become one or two; the 9 in-loop gates become one batched presentation per collection instead of one per item.

**Buys.** On the measured walk, 10 fired gates become about 4 posts: six gates × nine turn boundaries × 13.1 seconds ≈ **707 seconds**, plus six three-second floors. In review mode, fifteen sequential 30-second auto-advance timers become one wait — **up to 405 of the 435 seconds**. The await-review spin loop stops holding the slot, because a queue admits a parked decision beside a live one.

**Costs.** Roughly 350 lines: queue schema, two tools, a migration arm beside the two legacy normalisers already in `src/utils/session/migration.ts`. Five activity edits. One guard asserting that a batched gate's message templates nothing bound between the post and the answer — a static property, so checkable.

**Breaks.** Gate ordering. Today a gate's answer provably precedes every later step; a posted gate is answered out of order, so a gate whose *message* depends on a value a later step writes cannot be batched. That is a real subset, not an empty one — `check-decision-order.ts` exists because the corpus has been wrong about this before. It also breaks the replay key's meaning: one batched answer now covers several `activityId-checkpointId` pairs, and the resume path has to reconstruct which.

### Option C — Change the invariant: conserve turns instead of context authority

**The property conserved today** is that exactly one agent context is authoritative for the session at any instant: one pointer, one checkpoint slot, one ledger scope in play, variables travelling by envelope. Everything expensive follows from it.

**Conserve instead: no round trip returns less than it cost.** Three concrete changes.

*Plural fetch.* `get_resource` takes exactly one `resource_id` (`src/tools/resource-tools.ts:873`); `get_technique` takes exactly one `step_id` (`:639`). Widen both to `string | string[]`. **162 resource calls become 12** — one per activity — and 24 technique calls become at most 12.

*No marker-only answers.* A collapsed `get_resource` response is **257 characters**, measured. In the persistent walk, **71 of 123 resource calls returned one** — 57.7% of the resource round trips exist to be told "you already hold this", at 13.1 seconds apiece. Plural fetch alone removes them, because a marker rides back inside a response that also carries content.

*Bundle resource bodies in full mode.* `src/tools/workflow-tools.ts:1161-1166` pushes ids only when `referenceMode` is false, and `referenceMode` is false on the first activity of every dispatch (`:869`, with the corpus keeping `context_mode: persistent` off worker sessions). Measured across the twelve-activity path: **a full-mode delivery names 98 technique-linked resource bodies and delivers none of them; a reference-mode delivery of the same activities delivers 94 of the 98 inside the same response.** The design note in the source prices the difference honestly — +24.5% on `get_activity` — and prices it in bytes. In turns it is 98 round trips against nothing.

*Feed intra-activity writes.* An optional `variables` parameter on `get_technique` and `get_resource` lets a worker's `set` reach the bag without waiting for the activity boundary. The 12 structurally-undecidable gates become decidable, and the 20 `set` actions stop needing a relay.

**Buys.** 162 fewer round trips of 242 — 67% of the walk's server calls, ≈ **2,120 seconds** at the measured coefficient.

**Degrades.** Per-call ledger accounting: a plural fetch records one event for *n* resources unless the event shape changes, which is `TOP-10`'s problem arriving by a new road. And a plural fetch asks for everything the activity links rather than what the worker reads, which is the byte cost the full-mode design deliberately took.

## Step 3 — Trade-off matrix

Against the twelve-activity reference walk, measured where measured and derived from measured coefficients where derived.

| | Current | A — run delivery | B — decision plane | C — turn conservation |
|---|---:|---:|---:|---:|
| Server calls | 242 | ~190 | ~220 | **~80** |
| Worker contexts | 4 | **1** | 4 | 4 |
| Spawns at 87 s | 348 s | **87 s** | 348 s | 348 s |
| Eager delivery | 730,060 | **604,526** | 730,060 | 730,060 |
| Total delivery | 1,311,131 | **~900,000** | 1,311,131 | ~1,311,000 |
| Gate turn boundaries (10 fired) | ~90 | ~90 | **~36** | ~90 |
| Auto-advance sleep, review mode | 435 s | 435 s | **~30 s** | 435 s |
| Derived wall-clock saved | — | ~1,100 s | ~700 s interactive, ~1,100 s review | **~2,120 s** |
| New lines of server code | — | ~400 | ~350 | **~120** |
| Definition edits | — | 3 | 5 | **0** |
| Public tool surface | 18 | 19 | 19 | **18** |
| Supervision granularity lost | — | per activity | per gate | per fetch |
| Silent-failure risk introduced | — | run-scoped worker loss | out-of-order gate | none |

Three things the matrix makes plain. C is the cheapest by an order of magnitude on both axes and touches no definition. A is the only option that moves spawn cost, which is the single largest per-event term at 87 seconds. B is the only option that moves the gate term, which is the largest aggregate term on a gate-heavy path and the only one that also moves the review-mode timer.

They are close to orthogonal. C removes fetch round trips, A removes dispatches, B removes gate handovers. The one overlap is 39 resource calls that a single context would collapse anyway, counted in both the A and C columns, so a combined programme saves 39 × 13.1 ≈ 511 seconds less than the two columns added together.

Nothing in C blocks A; C makes A safe, because A's single context is only viable once the lazy half of delivery shrinks — 604,526 eager characters against a 640,000-character budget at headroom 0.80 is 94.5% of it, and every lazy fetch draws down the same budget.

## Step 4 — Migration path

Take C, then A. Each step leaves the system working.

1. **Widen `resource_id` to `string | string[]`.** Additive union; every existing single-string call is unchanged. One `resource_fetched` event per requested id, so the ledger keeps its resolution. ~40 lines. 162 calls become 12.
2. **Widen `step_id` the same way.** ~30 lines. 24 calls become at most 12.
3. **Give the benchmarks a config path.** Add `batchMaxActivities` and `batchHeadroomFraction` to `tests/e2e/harness.ts:36-43` from environment, and a `--max-activities` flag to `run-batch-benchmark.ts`. Two lines and a flag. Nothing measures the batch dial until this lands, which is why `ECO-06`'s "re-measure it" has stayed open.
4. **Re-run the delivery gate and the batch benchmark.** The gate now has something to resolve: 162 fewer round trips is not a byte claim, so record the call count beside the character count in `token-benchmark-baseline.json`. Today the fixture carries `toolCalls` and nothing gates on it.
5. **Set the dial from the new measurement.** Measured, cap 12 at headroom 0.80 puts the whole twelve-activity walk in one context. Do not set it before step 1, or the lazy half binds the budget mid-walk and the run ends in a refusal at its most expensive activity.
6. **Bundle resource bodies on the first activity of a dispatch**, behind the existing eager budget and the 80,000-character per-resource cap (`src/utils/resource-delivery.ts:6`). 98 refs become 94 bundled bodies.
7. **Add `get_run`.** By this point the transition census is the only new analysis it needs, and the corpus branch points are already enumerated.

**The hardest step is 5, and the difficulty is not the code.** The code is one config literal. The dial was set higher once and revised down, and the comment above the default records why: the character budget "is blind to the context establishment the server never delivers, the code a worker reads, the artifacts it drafts, and degradation across a long walk" (`src/config.ts:106-114`). Every one of those is invisible to every instrument in the repository. `bench:batch` says so itself — its projected saving is `dispatchesAvoided × spawnSeconds`, with the spawn figure supplied as a flag because "nothing headless can observe it". Re-deciding the dial needs a real profiled run under the new setting, compared against the nine already on disk. That is a day of somebody's actual work package, not a benchmark invocation, and it is the only evidence that can answer the question the dial asks.

## Step 5 — Decision

**Take C first, in full, then A, then B.**

C is 120 lines, no definition edit, no new tool, no lost guarantee, and it removes two thirds of the walk's round trips. It is the largest saving in this dimension and the cheapest, and the ratio is not close. A is next because spawn cost is the largest per-event term and C is what makes a single context survivable. B is last because it is the only option that changes when a question is asked relative to the work that reads its answer, and that is the one class of change this corpus has already got wrong.

### The conservation law

**Every round trip removed is a moment at which the server loses the right to refuse.**

The batch bound works because the worker must come back for the next activity. The step manifest works because the worker must report before it advances. The checkpoint slot works because the worker must yield before it asks. The delivery ledger meters per call because there is a call to meter. All four are the same mechanism seen from four sides: supervision is purchased with round trips, and the server's whole authority is the fact that it is asked.

So the trade is inescapable, and it is the same trade in every option. A run delivered whole is a run the server cannot bound mid-flight. A plural fetch is a fetch it cannot meter per item. A decision queue is a queue in which it no longer knows which question the worker is standing at. Each architecture spends supervision granularity and buys wall-clock, and the only thing that differs between them is the exchange rate.

On this workload the rate is knowable and it is lopsided: **13.1 seconds of wall-clock per round trip, against a server that composes the payload in 52 milliseconds.** The system was designed when the server's cost was the interesting one. It is not. Two hundred and forty-two round trips buy supervision at a price of roughly fifty-three minutes of model turns, and the four guarantees that price pays for could each be re-established at a coarser grain — per run, per fetch batch, per decision set — for a fraction of it. Coarser supervision at the same coverage is the whole design space, and every option above is one point in it.
