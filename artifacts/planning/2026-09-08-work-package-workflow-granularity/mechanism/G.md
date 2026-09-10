# G. What a child session costs that an activity dispatch does not

# G. Pricing one child session

## 0. Three premise corrections first, because two of them remove cost from the estimate

**(a) A child pays no bootstrap.** `bootstrap-protocol.md` prices a *top-level* session, and a `dispatch_child` child cannot be one. `start_session` has no `session_index` parameter at all — its schema is `.strict()` over `{workflow_id, planning_folder, repo, user_request, agent_id, context_mode}` (`src/tools/resource-tools.ts:112-123`) and its description says outright "start_session is top-level only… Children use `dispatch_child`, not this tool" (`:109`). So of the protocol's three mandatory steps, the child pays none: step 1's git derivation of `owner/repo` is skipped because the child inherits `repo` from `parentState.repo` (`:601`); step 2 is unavailable; step 3's `get_workflow` is explicitly unnecessary because `dispatch_child` returns `workflow.initialActivity` itself (`:623`, described at `:450`). That last point is `complete-bootstrap-path` (AP-72, `workflows/workflow-design/resources/anti-patterns.md:961-971`) satisfied at the tool boundary rather than in prose: "every hop is discoverable from the prior tool's real return."

**(b) The technique under-declares the tool.** `handle-sub-workflow.md:20-24` declares one output, `child_session_index`. The tool returns three — `session_index`, `workflow.{id,version,initialActivity}`, and `planning_folder_path` (`resource-tools.ts:623`). An author working from the technique alone would go hunting for `initialActivity` with `get_workflow`, which measures **115,136 characters** for work-package (`scripts/fixtures/token-benchmark-baseline.json`, `/chars/get_workflow`, recorded against workflows@95660422). Worth fixing before promotion multiplies the number of dispatch sites.

**(c) No orchestrator context can be spawned for a child — and not only for the reason the prior pass gave.** Beyond `depth-1-only` (`spawn-agent.md:42-46`) and `worker-control-plane-ban` (`activity-worker.md:62-64`), the stub that would do it is unexecutable: `compose-prompt.md:46` instructs the workflow-orchestrator entry as `start_session { session_index, agent_id }` then `get_workflow { session_index }`, and `start_session` rejects `session_index` as an unknown key. Even if it accepted it, the tool resolves by planning **folder** and adopts that folder's *top-level* session (`resource-tools.ts:253-264`), never an embedded child. So the drive loop necessarily lands on the parent's already-running orchestrator, confirming the premise from a second direction — and meaning the "dedicated child orchestrator" topology cannot be priced because it cannot be run.

Also: the depth guard is blind here. `parentChainDepth` walks `state.parentSession` (`src/schema/session.schema.ts:276-288`), which `dispatch_child` never sets (`resource-tools.ts:596-604`), so the soft threshold of 5 (`session.schema.ts:268`) never fires on `triggeredWorkflows` nesting however deep it goes.

## 1. The forced context boundary — the one irreducible cost

The dispatch itself is one tool call. What it buys is a **new session file whose delivery ledger is empty by construction**: `createInitialSessionFile` gives the child `history: [workflow_started, variables_seeded]` and no `deliveredContent` (`session.schema.ts:309-335`). Delivery mode is decided by `mayReferBack = bundle !== 'full' && (referenceMode || hasDispatch(state, scope))` (`src/tools/workflow-tools.ts:1094`), and `hasDispatch` scans **that session's** history for an `activity_dispatched` event under the calling scope (`src/utils/dispatch.ts:35-40`). So no context can carry a delivery across the parent/child line: the ledger is per session file, keyed by `agent_id` *within* it (`src/utils/delivery.ts:47-65`).

Equally, no *batch* can cross it. `batchActivities` and `deliveredChars` read one session's `state.history` (`src/utils/batch.ts:72-123`), `get_activity` serves the activity in that session's state, and a worker may not call `next_activity`. A session boundary is therefore a hard batch boundary, and the child's first activity always takes full delivery in a fresh context.

## 2. First delivery — what "full" is, concretely, and what a held context collapses

One full `get_activity` response carries (`workflow-tools.ts:1096-1520`):

| Block | Where composed | Ledger key |
|---|---|---|
| Technique bundle: activity's own `techniques` + workflow `techniques.activity` + `CORE_WORKER_TECHNIQUES` (`activity-worker`, `yield-checkpoint`, `resume-from-checkpoint`, `finalize-activity`, `agent-conduct` — `src/loaders/core-ops.ts:77-89`) | `:1100-1104` | `bundle:<ref>` per technique (`:1109-1120`) |
| Rules bundle | `:1125-1133` | `bundle:rules:<hash>` — content-keyed, so *any* rule set this context ever held collapses, not just the last |
| `activity_rules` = `rules.activity` + `rules.universal` | `:1493-1503` | `activity_rules:<hash>` |
| Eagerly inlined step techniques, document order, until `context_tokens × 0.80 × 4` chars is spent | `:1170-1174`, `config.ts:155-156` | `technique:<id>`, shared with `get_technique` |
| Technique-linked resource bodies under `resources` | `:1413` | `resource:<id>` incl. `#section` |
| Shared inherited blocks (`inherited_inputs`/`inherited_outputs` split note-from-items, `rules`, `provenance_note`) | `delivery.ts:146-192` | content-keyed |
| Activity body with checkpoint fragments materialised, synthesised artifacts contract, `exit_destinations`, `enforcement_notes`, `batch:` block | `:1061-1070`, `:1465-1471`, `:1583` | not deduped |

Measured on this corpus, just now:

- **Same-activity re-delivery (a resume):** `bench:dispatch --workflow=work-package --activities=6` — fresh pass **1,350,013** chars, resume pass **488,325**, **63.8% collapsed**. Per activity that is 225,002 chars average delivered in full to a fresh context against 81,388 to a held one; `start-work-package` alone is **334,169** fresh.
- **Next-activity continuation (a batch):** `bench:batch` on `implementation-analysis, plan-prepare, assumptions-review` — 3 fresh contexts deliver **261,971** chars, one batched context **222,505**: **15.1% saved, 2 dispatches avoided**, and the third activity's wire payload falls 78,923 → 30,182.

Two readings to carry carefully. First, `docs/dispatch-model.md:79` still quotes 159,093 batched / 232,954 standalone for the same three activities; the corpus has grown past that, so those figures are stale against submodule `5f92dc06`. Second, collapsed content does not draw down `spentChars` (`workflow-tools.ts:1181-1184`), so a continuing context spends the freed eager budget inlining *more* step techniques — which is why the batched pass's second activity measured 106,893 chars on the wire against 97,615 standalone. The totals are the honest comparison; the per-activity wire figures are not comparable one to one.

## 3. Session-file writes and commits

**Same checkout, same branch, same folder.** The child inherits `planning_folder_path` (`resource-tools.ts:623`) and `repo` (`:601`). No second checkout, no second remote, no extra `session.json` or `.session-token`.

**Per-activity commit cadence is identical wherever the activity runs** — `commit-after-activity` (`commit-and-persist.md:36-41`): one Progress-mark commit + push before the worker spawns (`dispatch-activity.md:48-50` via `commit-regular-files.md`, which pushes), up to two commits + two pushes for source-side changes (`commit-submodule.md` steps 3 and 5-7: the submodule commit then the parent pointer bump), and one engineering commit + push carrying `README.md`, `session.json` and `.session-token` together (`commit-and-persist.md:27`, `session-files-ride-along` at `:52-54`). So **2-4 commits and 2-4 pushes an activity**, either side of the boundary.

**What the child adds is at the edges, not the interior:**

- It forfeits the only carve-out that batches commits. `setup-sequence-persists-once` (`commit-and-persist.md:43-50`) holds the commit across the meta workflow's whole setup sequence and pays it once at the dispatch moment. A child promoted inside work-package gets no such exemption — `commit-after-activity` applies per activity.
- It adds a close-out activity. `revise-session-metrics` (`end-workflow.yaml:23-26`) rewrites `token-usage.md`, `session-trace.md` and the README cost line **from the child's own ledger**, and only after the child's terminal activity has exited (`after-client-exit`, `revise-session-metrics.md:54-56`). One more activity's worth of commits and pushes per child.

**Write amplification is the number that matters.** `saveSessionForTool` re-canonicalises, seals and atomically rewrites the **whole top file** on every authenticated call by parent or child (`src/utils/session/resolver.ts:193-201`). Measured across the twelve largest sealed runs in this repo, the single child occupies **60-90% of its parent's file (median ~85%)**. The largest: `2026-08-18-optimisation-of-meta-and-work-package-workflows/session.json` is 252,056 canonical chars, of which the one `prism-evaluate` child (`QR6FTR`, 703 history events) is **221,908 — 88.1%**, against the parent's own 116 events / 23,198 chars. So a child multiplies the bytes rewritten on every call in that folder by roughly 6-8×, and that file is staged into the engineering commit at every activity boundary.

Index resolution rides along: `session_index` → location is an **uncached** recursive scan of every planning folder, parsing each folder's whole `session.json` and recursing through `triggeredWorkflows` (`src/utils/session/store.ts:436-500`). This repo's engineering root holds 200 planning folders. A child adds no folder, but adds its bytes and one recursion level to every lookup that reaches that folder.

## 4. Usage and trace accounting

**Usage: per activity, so no marginal cost — except that it does not roll up.** `account-every-activity` (`dispatch-activity.md:70-72`) requires exactly one `record_usage` row per activity whichever session runs it. But `projectUsage` sums only the addressed session's own `activity_usage` rows and reports children separately in `children_outside_totals` with `cost_known` (`workflow-tools.ts:478-486`; `sessionCost` at `:293-313`; `projectChildren` at `:315-339`). The code states the rule: *"A child workflow spends under its own session, so its cost is not in `totals`."* So the parent's total is not the run's total. `token-usage.md` demands one row per activity plus a coverage reconciliation and labels an unreconciled figure a floor (`:41,43`) — which costs one extra `inspect_session { session_index: <child>, view: 'usage' }` and one extra artifact revision per child. That is precisely why `revise-session-metrics` takes `client_session_index` as an input (`revise-session-metrics.md:12-14`).

**Trace: yes, the parent owes a resolve, and part of it must be a separate call.** `resolve-trace-at-close-out` (`dispatch-activity.md:78-80`) puts the accumulate half on the dispatch operation and the resolve half on the client close-out, once, via `get_trace { session_index, trace_tokens }`. Tokens are session-agnostic — each is decoded independently (`workflow-tools.ts:2139-2148`) — so the token half can ride one call carrying both sessions' tokens. The in-memory trace cannot: it is keyed `config.traceStore.getEvents(state.sessionIndex)` (`:2163`), so the child's trace is a different trace needing its own call under the child index. Each `get_trace` also advances and rewrites the whole top file (`:2133-2134`).

## 5. What batching buys that a child forfeits

`continue-batch.md` exists so the fixed per-agent cost is paid once a run: the worker "resumes in place" across activity boundaries and gates, "so the pauses cost a round trip rather than a respawn", and on the profiled setup walk "skipping two respawns saves roughly two to four times what the delivered content collapsing saves" (`docs/dispatch-model.md:62-64`). The bound is 3 distinct activities per context and `context_tokens × 0.35 × 4` chars (`config.ts:164-165`, `batch.ts:129-139`) — 280,000 chars at a 200k window.

Splitting a run of N activities into a child therefore:

- costs **at least one extra fresh context** (the child's first activity), and a **second** for the parent activity following the child's return — unless the promotion boundary already fell where a batch ended;
- does **not** change the interior arithmetic: the child batches its own N at `ceil(N/3)` contexts, the same as inside the parent. The loss is the boundary, not the interior.

Measured price of one forfeited boundary: 39,466 chars over the 2 dispatches avoided in the 3-activity batch (≈19,700 each), and a projected 174 s wall clock from `DEFAULT_SPAWN_SECONDS = 87` — the mean of the four setup dispatches on the profiled 27 July 2026 run, **77, 65, 42 and 165 s** (`scripts/run-batch-benchmark.ts:40-43,82-83`). Where the alternative was a same-context *resume* rather than a continuation, the forfeit is far larger: up to ~143,600 chars (the 63.8% figure above).

One sobering counterweight, from a real run: on 5 August **batching formed no run at all** — four setup identities for four activities, thirteen client identities for twelve activities, and **no `batch_refused` event anywhere in either session**, because `_meta.batch` never arrived in any `get_activity` response (`.engineering/artifacts/planning/2026-08-06-startup-cost-on-real-runs/README.md:104-121`). The saving a promotion forfeits is one the fleet has not yet reliably banked.

## 6. Two costs that are neither tokens nor turns

**Progress marks go dark.** `sync-progress-status` resolves rows through the workflow's readme-seed profile row-ownership map (`sync-progress-status.md:43-45`), and *"A row absent from the map is unselectable — a writer cannot resolve which activity owns it, so its status never advances"* (`workflows/meta/resources/planning-readme.md:105`). A child workflow's activities own no rows in a README seeded from the *parent's* profile, so every Progress write in the child is a silent no-op and the dispatch-mark commit at `dispatch-activity.md:48-50` has nothing to stage. The two repairs both cost something: extend the parent's seed profile with the child's inventory, or give the child its own README — and `create-readme` writes to `{planning_folder_path}/README.md` (`create-readme.md:53`), the inherited path, so a child that seeds its own overwrites the parent's.

**The bag does not travel.** `childVariables` is `seedDefaults(wf.variables)` plus `user_request` where declared (`resource-tools.ts:482-485`), and `seedDefaults` copies only declarations carrying a `defaultValue` (`src/utils/variable-seed.ts:12-18`). **work-package declares 26 workflow-level variables, 13 with defaults** — so a child of that shape opens with 13 values and 13 absent, and everything the parent's earlier activities derived (paths, ids, decisions, measurements) must be re-derived or newly declared with defaults. Only `repo` and `contextMode` cross as session fields (`:601-602`). And `dispatch_child` calls `loadWorkflow(config.workflowDir, workflow_id)` (`:471`), so the promoted activities must first exist as a registered workflow with its own `workflow.yaml`, activity files and seed profile.

**One live hazard to resolve before promotion multiplies child sessions.** `handle-sub-workflow.md:28` sets the child's `agent_id: 'workflow-orchestrator'`; `create-session.md:44` sets `'orchestrator'`. Whichever lands becomes the child session's `agentId`, and `batchState` exempts `scope === state.agentId` from **both** limits (`batch.ts:149-159`). A worker in the child passing that same id is unbounded — the case `docs/dispatch-model.md:95` names. Two techniques disagreeing on the value is a defect worth closing first.

## 7. The bottom line

Marginal cost of one child session, over dispatching one more activity inside the existing session:

| Component | Figure | Basis |
|---|---|---|
| `dispatch_child` | 1 tool call, ~600-char response | measured (response shape, `resource-tools.ts:623`) |
| `next_activity` on the child index | 1 call, ~99 chars | measured (baseline: 1,290 chars over 13 calls) |
| Forfeited batch continuation | 1-2 extra fresh worker contexts | derived (`batch.ts:72-123`, `worker-control-plane-ban`) |
| — delivery cost of that | ~19,700 chars per boundary; up to ~143,600 where a resume was the alternative | measured (`bench:batch`, `bench:dispatch`) |
| — wall clock of that | ~87 s per spawn; observed 42-165 s | measured on one run, used as a projection input |
| Close-out for the child | +1 `inspect_session` (child usage), +1 `get_trace` (child in-memory trace), +1 artifact revision, +1 engineering commit and push | derived (`workflow-tools.ts:478-486`, `:2163`, `revise-session-metrics.md`) |
| Session-file write amplification | 6-8× bytes rewritten per call in that folder | measured (252,056 vs ~30,000; child share 60-90% across 12 sealed runs) |
| Bag re-derivation | 13 of 26 work-package variables arrive; 13 absent | measured on the definition |
| Progress marks | 0 rows selectable until the seed profile is extended | derived (`planning-readme.md:105`) |
| Bootstrap | **zero** | corrected (`start_session` is top-level only) |

**Single figure.** One child session costs, over and above the activities it runs: **2 extra tool calls, 1-2 extra worker spawns, and one extra close-out activity — roughly 20,000-145,000 characters of re-delivered content (5,000-36,000 tokens at the server's own 4-chars-per-token factor), 90-180 seconds of wall clock, and 2-4 extra commits.** Central estimate for a promotion whose boundary is **not** already a batch boundary: **~40,000 chars / ~10,000 tokens / ~2 minutes / ~3 commits.** Where the promotion boundary already coincides with a batch boundary, the marginal cost collapses to the two tool calls, the close-out, and the write amplification — call it near-zero in tokens and one activity in turns.

**Measured:** every character count (both benchmarks run against this working tree; the twelve sealed `session.json` files; the committed baseline fixture), the variable counts, and the code paths. **Estimated:** all wall-clock figures, which rest on a single measured spawn cost of 87 s drawn from four dispatches on one run; and the commit counts, which vary with whether the working tree is dirty at each boundary.

## Corrections to prior premises

- "What does a new session's first turn have to do before any domain work starts?" presupposes a child pays the bootstrap. It does not. `start_session` is top-level only and has no `session_index` parameter (`src/tools/resource-tools.ts:112-123`, `.strict()`; description at `:109`: "Children use `dispatch_child`, not this tool"). All three bootstrap-protocol steps are skipped: the repo is inherited (`:601`), `start_session` is unavailable, and `get_workflow` is unnecessary because `dispatch_child` returns `workflow.initialActivity` (`:623`).
- The prior pass's "its only declared output is that index" is true of the technique but not of the tool. `dispatch_child` returns `session_index`, `workflow.{id,version,initialActivity}` and `planning_folder_path` (`src/tools/resource-tools.ts:623`). `handle-sub-workflow.md:20-24` declares only the first, so the technique under-declares the tool and would send an author to `get_workflow` — 115,136 chars for work-package (`scripts/fixtures/token-benchmark-baseline.json`, `/chars/get_workflow`).
- A dedicated orchestrator context for a child is not merely barred by `depth-1-only`; it is unimplementable as specified. `compose-prompt.md:46` instructs `start_session { session_index, agent_id }` for the workflow-orchestrator role, and `start_session` rejects `session_index` (strict schema, `src/tools/resource-tools.ts:112-123`) and resolves by planning folder to that folder's top-level session (`:253-264`), never an embedded child.
- The nesting-depth guard does not see embedded children. `parentChainDepth` walks `state.parentSession` (`src/schema/session.schema.ts:276-288`), which `dispatch_child` never sets (`src/tools/resource-tools.ts:596-604`), so the soft threshold of 5 (`session.schema.ts:268`) never fires on `triggeredWorkflows` nesting.
- `docs/dispatch-model.md:79`'s batch figures (159,093 batched / 232,954 standalone over three work-package activities) are stale against submodule 5f92dc06. Re-running `bench:batch` on this tree gives 222,505 batched / 261,971 standalone, 15.1% saved.
- A child's usage does NOT roll up to the parent. `projectUsage` sums only the addressed session's own rows and reports children separately in `children_outside_totals` (`src/tools/workflow-tools.ts:478-486`, `sessionCost` at `:293-313`): "A child workflow spends under its own session, so its cost is not in `totals`."
- The parent's trace resolve does not fully cover the child. Trace tokens decode independently of session (`src/tools/workflow-tools.ts:2139-2148`) so one `get_trace` can carry both sessions' tokens, but the in-memory trace is keyed on `state.sessionIndex` (`:2163`), so the child's trace needs its own call.
- `handle-sub-workflow.md:28` and `create-session.md:44` disagree on the child session's `agentId` ('workflow-orchestrator' vs 'orchestrator'). Whichever lands is exempt from both batch limits when a worker passes it (`src/utils/batch.ts:149-159`), the hazard `docs/dispatch-model.md:95` names.

## Confidence

Certain, from code and definitions with fresh measurements on this working tree: that a child pays no bootstrap and why; that the delivery ledger and the batch bound are both scoped inside one session file, making a session boundary a hard batch boundary; the concrete composition of a full `get_activity` delivery; that a child's usage stays outside the parent's totals and that its in-memory trace needs its own resolve; that the child shares the parent's checkout, folder and per-activity commit cadence, and that the whole top file is rewritten and resealed on every call. Every character count is measured — `bench:dispatch` (1,350,013 fresh vs 488,325 resumed over six work-package activities, 63.8%), `bench:batch` (261,971 vs 222,505, 15.1%, 2 dispatches avoided), the twelve sealed `session.json` files (child share 60-90%, median ~85%; the largest 221,908 of 252,056 chars), the committed baseline fixture (`get_workflow` 115,136; 12-activity walk 1,421,070), and the work-package variable count (26 declared, 13 with defaults).

Estimated, not measured: every wall-clock figure. The 87-second spawn cost is an input flag defaulted from four dispatches on one profiled run (77, 65, 42, 165 s) and the script itself says the projection is only as good as that input; the 90-180 s range for one child is that figure times one-to-two forfeited spawns. Commit counts are ranges because `commit-and-persist` step 4 is conditional on a dirty working tree.

Could not settle from the corpus: (1) The real per-spawn wall clock on the current harness — settled by re-running `npm run profile:run` on a live run, or by timing the gap between an `activity_dispatched` event and the worker's first server call in a fresh sealed session. (2) Whether two children can run concurrently. `claude-code.md:24-27` rule `concurrent` is an instruction to the model, not a server capability — nothing in `src/` schedules anything, so this is a property of the caller's tool surface. What would settle it: whether the host's Agent primitive returns before the sub-agent completes, plus a test that two children of one folder can interleave writes — which the last-writer-wins whole-file save (`src/utils/session/resolver.ts:193-201`, and the reload-before-save comment at `src/tools/workflow-tools.ts:1514`) suggests they cannot do safely. (3) Whether the Progress-row gap is actually hit in practice, since no run in this corpus has promoted activities into a child of a client workflow — the reasoning is from the definitions, not from an observed failure.

## Citations

- src/tools/resource-tools.ts:112-123
- src/tools/resource-tools.ts:109
- src/tools/resource-tools.ts:253-264
- src/tools/resource-tools.ts:450
- src/tools/resource-tools.ts:458
- src/tools/resource-tools.ts:471
- src/tools/resource-tools.ts:482-485
- src/tools/resource-tools.ts:596-604
- src/tools/resource-tools.ts:601
- src/tools/resource-tools.ts:623
- workflows/meta/resources/bootstrap-protocol.md:10-43
- workflows/workflow-design/resources/anti-patterns.md:961-971
- workflows/meta/techniques/workflow-engine/handle-sub-workflow.md:20-24
- workflows/meta/techniques/workflow-engine/handle-sub-workflow.md:28
- workflows/meta/techniques/workflow-engine/create-session.md:44
- workflows/meta/techniques/workflow-engine/compose-prompt.md:45-46
- workflows/meta/techniques/harness-compat/spawn-agent.md:42-46
- workflows/meta/techniques/workflow-engine/activity-worker.md:62-64
- workflows/meta/techniques/workflow-engine/activity-worker.md:70-72
- workflows/meta/techniques/workflow-engine/activity-worker.md:90-92
- src/schema/session.schema.ts:268
- src/schema/session.schema.ts:276-288
- src/schema/session.schema.ts:309-335
- src/tools/workflow-tools.ts:1094
- src/tools/workflow-tools.ts:1096-1104
- src/tools/workflow-tools.ts:1109-1133
- src/tools/workflow-tools.ts:1170-1174
- src/tools/workflow-tools.ts:1181-1184
- src/tools/workflow-tools.ts:1413
- src/tools/workflow-tools.ts:1465-1471
- src/tools/workflow-tools.ts:1493-1503
- src/tools/workflow-tools.ts:1514
- src/tools/workflow-tools.ts:1567-1583
- src/utils/dispatch.ts:35-40
- src/utils/delivery.ts:5-40
- src/utils/delivery.ts:47-65
- src/utils/delivery.ts:146-192
- src/loaders/core-ops.ts:77-89
- src/config.ts:155-156
- src/config.ts:164-165
- src/utils/batch.ts:72-123
- src/utils/batch.ts:129-139
- src/utils/batch.ts:149-159
- src/utils/batch.ts:168-183
- src/utils/session/resolver.ts:193-201
- src/utils/session/store.ts:436-500
- src/utils/variable-seed.ts:12-18
- src/tools/workflow-tools.ts:293-313
- src/tools/workflow-tools.ts:315-339
- src/tools/workflow-tools.ts:410-498
- src/tools/workflow-tools.ts:478-486
- src/tools/workflow-tools.ts:1784-1806
- src/tools/workflow-tools.ts:2133-2134
- src/tools/workflow-tools.ts:2139-2148
- src/tools/workflow-tools.ts:2163
- workflows/meta/techniques/workflow-engine/dispatch-activity.md:48-50
- workflows/meta/techniques/workflow-engine/dispatch-activity.md:70-72
- workflows/meta/techniques/workflow-engine/dispatch-activity.md:78-80
- workflows/meta/techniques/workflow-engine/dispatch-activity.md:100-106
- workflows/meta/techniques/workflow-engine/TECHNIQUE.md:40-44
- workflows/meta/techniques/workflow-engine/continue-batch.md:44-47
- workflows/meta/techniques/workflow-engine/continue-batch.md:60
- workflows/meta/techniques/workflow-engine/commit-and-persist.md:22-32
- workflows/meta/techniques/workflow-engine/commit-and-persist.md:36-41
- workflows/meta/techniques/workflow-engine/commit-and-persist.md:43-50
- workflows/meta/techniques/workflow-engine/commit-and-persist.md:52-54
- workflows/meta/techniques/workflow-engine/sync-progress-status.md:43-45
- workflows/meta/techniques/version-control/commit-regular-files.md:24-30
- workflows/meta/techniques/version-control/commit-submodule.md:32-41
- workflows/meta/techniques/workflow-engine/create-readme.md:53
- workflows/meta/techniques/workflow-engine/revise-session-metrics.md:12-14
- workflows/meta/techniques/workflow-engine/revise-session-metrics.md:54-56
- workflows/meta/resources/planning-readme.md:105
- workflows/meta/resources/token-usage.md:41
- workflows/meta/resources/token-usage.md:43
- workflows/meta/activities/03-dispatch-client-workflow.yaml:31-116
- workflows/meta/activities/04-end-workflow.yaml:20-38
- workflows/meta/activities/01-initialize-session.yaml:47-58
- workflows/meta/techniques/workflow-engine/workflow-orchestrator.md:33-34
- workflows/meta/techniques/harness-compat/claude-code.md:24-27
- docs/dispatch-model.md:60-101
- docs/dispatch-model.md:62-64
- docs/dispatch-model.md:79
- docs/dispatch-model.md:95
- scripts/run-batch-benchmark.ts:40-43
- scripts/run-batch-benchmark.ts:79-83
- scripts/run-batch-benchmark.ts:134-166
- scripts/run-dispatch-benchmark.ts:1-36
- scripts/fixtures/token-benchmark-baseline.json
- .engineering/artifacts/planning/2026-08-06-startup-cost-on-real-runs/README.md:104-121
- .engineering/artifacts/planning/2026-08-18-optimisation-of-meta-and-work-package-workflows/session.json
- workflows/work-package/workflow.yaml