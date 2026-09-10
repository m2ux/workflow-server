# D. How a checkpoint inside a child reaches the user, and the answer gets back

# D. A checkpoint raised inside a child workflow

## 1. Who presents the gate

**The single top-level, user-facing agent — the same one that presents a gate raised in the parent.** Nothing about a child changes who asks.

The chain has exactly three roles and only the top one has a user channel:

- The worker that reaches the gate calls `yield_checkpoint`, emits `<checkpoint_yield>`, and stops making tool calls (`workflows/meta/techniques/workflow-engine/yield-checkpoint.md:26`).
- A **workflow orchestrator relays without reading**: "On `checkpoint_pending`, bubble the yield, then apply `resume-worker` with the resolved effects" (`workflows/meta/techniques/workflow-engine/workflow-orchestrator.md:40`). The rule that assigns the duty is explicit that resolution is not the workflow orchestrator's: "Resolving a checkpoint is the meta-orchestrator's… a workflow orchestrator passes the yield it receives upward unchanged" (`workflows/meta/techniques/agent-conduct.md:34`).
- The top-level agent presents through **the host's own question primitive** and waits for an explicit selection (`workflows/meta/techniques/workflow-engine/present-checkpoint-to-user.md:32`), and may solicit user input for nothing else (`workflows/meta/techniques/orchestrator-conduct.md:34`).

A child does not get an orchestrator of its own that could present: "one orchestrator agent drives all orchestrator-level work **across all session levels**" (`workflows/meta/techniques/harness-compat/spawn-agent.md:44`).

**But the corpus gives that agent no way to address a child's gate.** The only drive loop in the corpus binds one index throughout — `client_session_index` at `workflows/meta/activities/03-dispatch-client-workflow.yaml:46,60,69,76,84`. `present-checkpoint-to-user` and `respond-checkpoint` are bound to it at `:69` and `:76`. And `{child_session_index}`, the sole declared output of `handle-sub-workflow` (`workflows/meta/techniques/workflow-engine/handle-sub-workflow.md:22-24`), is consumed by **nothing**: a grep across `workflows/` finds the token only in its own declaration and Protocol line. So the index that would have to reach the presenter never travels.

The two-line consequence is concrete. `present_checkpoint` throws `no active checkpoint on session '<idx>'` when the addressed node's slot is empty (`src/tools/workflow-tools.ts:1892-1897`), and that is exactly what the parent's index reports while the child holds the gate.

## 2. Which session the yield resolves against

**The child's own node. It passes through the parent's *file* but never through the parent's *state*.**

`yield_checkpoint` resolves `session_index` to a location, then reads and writes only the addressed sub-state:

| Step | Where |
|---|---|
| resolve index → `{folder, jsonPath}` | `src/utils/session/store.ts:527-578`; child match at `:463-467` pushes `[…, 'triggeredWorkflows', i, 'state']` |
| `state = navigatePath(topState, jsonPath)` | `src/utils/session/resolver.ts:155` |
| guard reads `state.activeCheckpoint` | `src/tools/workflow-tools.ts:1647` |
| write sets `draft.activeCheckpoint` | `src/tools/workflow-tools.ts:1746-1751` |
| save re-inserts at `jsonPath`, rewrites whole file | `src/utils/session/resolver.ts:197-200` |

So the gate lands at `triggeredWorkflows[N].state.activeCheckpoint` and the parent's own `activeCheckpoint` stays absent. The parent's file bytes and seal are rewritten (`src/utils/session/store.ts:328-338`) — that is the only sense in which the parent is involved.

The worker holding a child activity holds the *child's* index: "the worker **shares the orchestrator's index**… Spawning an orchestrator is the opposite case: it opens a child session of its own" (`docs/dispatch-model.md:56`). `present_checkpoint`, `respond_checkpoint` and `resume_checkpoint` all address one node the same way (`src/tools/workflow-tools.ts:1889-1892`, `1952-1954`, `1846-1851`), so the whole round trip is per-node.

## 3. Do parent and child each hold their own slot?

**Yes.** `activeCheckpoint` is a property of the `session-file` definition (`schemas/session-file.schema.json:54-115`), and `triggeredWorkflows[].state` is `{"$ref": "#/definitions/session-file"}` (`schemas/session-file.schema.json:311-313`). Every node in the tree therefore carries an independent slot. The runtime Zod schema recurses the same way via `z.lazy()` (`src/schema/session.schema.ts:227-233`).

Verified rather than inferred: a document with a parent plus two children, each carrying a distinct `activeCheckpoint`, validates against **both** `schemas/session-file.schema.json` (ajv) and `safeValidateSessionFile` (Zod). Three simultaneous outstanding gates are legal on-disk state.

The same recursion isolates the response ledger: `checkpointResponses` is keyed `<activityId>-<checkpointId>` with no workflow or agent component (`src/tools/workflow-tools.ts:2039`, replay lookup at `:1698-1699`), but the map lives on each node, so two children of the *same* workflow cannot cross-replay each other's answers.

## 4. Parent and child both holding a gate at the same time

**Nothing refuses it. It is legal state, and the failure mode is mis-addressing rather than a refusal.**

Derivation from code, guard by guard:

| Guard | Reads | Consequence |
|---|---|---|
| `yield_checkpoint` refusal (`workflow-tools.ts:1647-1649`) | addressed node only | child yields freely while parent's gate is outstanding |
| `assertNoActiveCheckpoint` (`src/utils/session/params.ts:62-70`), applied to `loaded.state` at `workflow-tools.ts:596,1025,2132` and `resource-tools.ts:651,881` | addressed node only | a child's gate blocks child-index `get_workflow`/`get_activity`/`get_technique`/`get_resource`/`get_trace` and nothing on the parent |
| `next_activity` refusal (`workflow-tools.ts:723-728`) | addressed node only | **the parent can advance past a child's unresolved gate** |
| `dispatch_child` (`src/tools/resource-tools.ts:464-626`) | **no checkpoint guard at all** | a parent holding an outstanding gate can still dispatch a child |
| `resume_checkpoint` (`workflow-tools.ts:1849-1851`) | addressed node only | each side waits on its own answer |

This is reachable in the corpus today. `work-package::post-impl-review` dispatches prism as a child at its `dispatch-prism` step (`workflows/work-package/activities/10-post-impl-review.yaml:176-182`) and then walks on to the `local-validation-permission` checkpoint (`:237`). The worker is required to outlive the child — "while a step of this activity holds work still running outside this context… stay live" (`workflows/meta/techniques/workflow-engine/activity-worker.md:74-76`) — and prism's own gate is `confirm-mode` in its first activity (`workflows/prism/activities/00-select-mode.yaml:43`). Parent slot and child slot occupied, no refusal.

**The sharp edge is that `respond_checkpoint` cannot name which gate it means.** Its inputs are `session_index` plus exactly one of `option_id` / `auto_advance` / `condition_not_met` (`src/tools/workflow-tools.ts:1944-1949`); the `checkpoint_id` is taken from whatever is active on the addressed node (`:1960`). The index is the *only* disambiguator. So with two gates outstanding:

- Wrong index + an option id the addressed gate does not declare → `Invalid option` (`:1993-1996`). Loud, recoverable.
- Wrong index + an option id the addressed gate *does* declare → **the wrong gate is resolved silently**, its effects applied to the wrong bag (`:2037-2077`). Shared option ids are not exotic: `proceed`-style ids recur, and `ref` fragments deliberately reuse one checkpoint body across sites (`docs/checkpoint-model.md:114`).

**And there is no discovery route.** No `inspect_session` projection reports `activeCheckpoint` at all — `projectCheckpoints` returns only `checkpointResponses` (`src/tools/workflow-tools.ts:219-229`), and `projectChildren` returns `status`/`currentActivity`/`completed` and no gate (`:326-339`). `get_workflow_status` reports `status: 'blocked'` but only for the index you already passed, and its `last_checkpoint` is the last *resolved* one from the trace store (`:2204-2205`, `:2225-2227`). To learn a child is blocked you must already hold the child's index — the index that nothing carries upward.

Also worth noting for the promotion decision: the embedded-child path never sets `parentSession` (`src/tools/resource-tools.ts:596-604`), so the child-completion notification that flips `triggeredWorkflows[i].status` to `completed` is gated on `state.parentSession?.sessionIndex` and never fires for a child created by `dispatch_child` (`src/tools/workflow-tools.ts:930-953`). A promoted child's status stays `running` forever.

## 5. Two children each holding a gate

Per-node, identical to the above: legal state, no refusal, two independent slots. **The new failure is at the file layer, and it destroys a yield silently.**

Every write is a whole-file read-modify-write against a snapshot taken at load time. `loadSessionForTool` captures `topState` (`src/utils/session/resolver.ts:154-156`); `saveSessionForTool` does `replacePath(loaded.topState, loaded.jsonPath, newState)` and rewrites the entire file (`:197-200`). There is no compare-and-swap, no `seq` check on write, and no lock — `writeSessionFile` canonicalises, seals and atomically renames whatever it is handed (`src/utils/session/store.ts:328-338`). A search for `mutex` / `flock` / `withLock` / `acquireLock` across `src/utils/session/` and `src/tools/` returns nothing.

I reproduced the interleaving directly against these functions (scratch harness, since removed). Two children of one folder, handlers interleaved as `load A → load B → save A → save B`:

```
child A activeCheckpoint after both saves: undefined
child B activeCheckpoint after both saves: {"checkpointId":"gate-B",...}
```

Child A's yield is **gone**. No error, and no `SEAL_MISMATCH` — the seal only detects out-of-band edits (`src/utils/session/store.ts:365-393`), and B re-sealed its own bytes legitimately. Run sequentially (`load A → save A → load B → save B`), both survive. The lost write also rolls A's `seq` back, and nothing reads `seq` for conflict detection (`src/utils/session/resolver.ts:164-181`).

Downstream, child A's worker is now stopped forever: it will not act until resumed, `resume_checkpoint` on A's index reports the gate cleared and hands back the *most recent* response on A's node (`src/tools/workflow-tools.ts:1862-1865`) — which is some earlier gate's answer, not the one just lost.

Whether two handlers actually interleave is a property of the caller and transport, not of the engine. The HTTP transport hands each POST to `transport.handleRequest` with no queue (`src/transports/http.ts:113-164`), and every handler awaits at each fs boundary, so interleaving is available whenever two calls are in flight. **Concurrency itself is caller-surface and cannot be settled from the corpus**: it bottoms out in one instruction to the model — "Emit multiple `Agent` calls in a single response turn; the harness executes them in parallel" (`workflows/meta/techniques/harness-compat/claude-code.md:26`). The definition schema has no parallel iteration construct at all: `loopType` is `forEach | while | doWhile` (`schemas/activity.schema.json:525-532`). What keeps prism-audit's two children apart today is a sentence — "Sequential execution. Audit scopes are triggered one prism run at a time" (`workflows/prism-audit/README.md:118`) — enforced by nothing.

The corpus does name the general shape of this race, but only for the variable bag and only for parallel *agents*: "Per-instance outputs are NEVER auto-bound into the parent variable bag by scalar name, which would race and clobber across instances" (`workflows/meta/techniques/scatter-gather.md:32`). It says nothing about `activeCheckpoint`, and nothing about two child *sessions* sharing one file.

## 6. Does the rules prose agree with the code?

| Prose | Code | Verdict |
|---|---|---|
| "Only one checkpoint may be active at a time. Yielding a second while one is outstanding is refused by name" (`docs/checkpoint-model.md:24`) | refusal reads the addressed node's slot only (`workflow-tools.ts:1647`); schema gives every node its own (`session-file.schema.json:54,311-313`) | **True per session, false per run.** As a whole-run invariant it is wrong, and it is the sentence a reader would rely on when promoting activities into children |
| Layer 2: three operations refuse — `next_activity`, `yield_checkpoint`, `resume_checkpoint — "Everything else stays open, deliberately" (`docs/workflow-fidelity.md:64-70`) | five more call sites gate: `get_workflow` (`:596`), `get_activity` (`:1025`), `get_trace` (`:2132`), `get_technique` (`resource-tools.ts:651`), `get_resource` (`:881`) | **Understates the gate.** Stale |
| The yield block "carries no payload — the active checkpoint is server-resident" (`yield-checkpoint.md:20,26`; `docs/checkpoint-model.md:19`) | the server instructs the opposite: "emit `<checkpoint_yield>` **with the returned session_index**" (`workflow-tools.ts:1630`), "Yield this session_index to the orchestrator using a `<checkpoint_yield>` block" (`:1772`) | **Direct conflict, and the child case is what makes it load-bearing.** Payload-free is harmless when one index is in play; it is the whole defect when the gate is on a child |
| Child creation via `start_session({ parent_planning_slug })`, child in its own folder, parent snapshotted under `parentSession` (`docs/dispatch-model.md:25-36`) | `dispatch_child`; child embedded at `triggeredWorkflows[N].state` in the parent's file; `parentSession` never set (`resource-tools.ts:593-604`); `parent_planning_slug` absent from the codebase | **Stale.** Describes an API that no longer exists |
| "The orchestrator in the middle passes a block it never parses… a gate can be added to an activity without touching anything between the worker and the user" (`docs/checkpoint-model.md:154`) | true for a gate on the driven session; false across a `dispatch_child` boundary, where the presenter's bound index is the parent's and no definition carries the child's | **True one level, false two.** This is the claim a promotion would be resting on |

Where the prose is *right*: the presenter's identity (`agent-conduct.md:34`, `workflow-orchestrator.md:40`, `checkpoint-model.md:28-40`) matches the code exactly, and replay-keying (`docs/dispatch-model.md:99`) matches `:1698-1699`, `:2039`.

## 7. What this means for the promotions being weighed

- **Promoting a set of activities that contains a checkpoint into a child requires new mechanism, not just a `dispatch_child` call.** Something must carry the child's `session_index` up to the presenter and bind it into `present-checkpoint-to-user` / `respond-checkpoint`. Today nothing does; the presenter's bound index throws `no active checkpoint`.
- **A parent gate and a child gate coexisting is unpoliced, not prevented,** and it is already reachable in `work-package::post-impl-review`. Because `respond_checkpoint` disambiguates by index alone, an off-by-one index resolves the wrong gate silently whenever the two share an option id.
- **Two children concurrently is unsafe at the storage layer, independent of checkpoints.** One shared file, whole-file read-modify-write, no CAS, no lock — a lost update is silent and seal-clean. Making two children concurrent is a change to `saveSessionForTool` (per-folder serialization or a `seq`-based CAS), not a change to a workflow definition.


## Corrections to prior premises

- "The child's activities are driven by the parent orchestrator, inline" — the `dispatch_child` call is made by an activity **worker**, not the orchestrator. `handle-sub-workflow` is bound as a `kind: technique` step inside an activity (`workflows/prism-audit/activities/02-execute-analysis.yaml:75-80`, `workflows/work-package/activities/10-post-impl-review.yaml:176-182`), and workers execute activity steps in document order (`workflows/meta/techniques/workflow-engine/activity-worker.md:49`). Neither workflow lists the technique in an orchestrator bundle — both declare only `techniques: activity: [variable-binding]` (`workflows/prism-audit/workflow.yaml:13-15`, `workflows/work-package/workflow.yaml:72-74`).
- "The child's activities are driven… inline [by `03-dispatch-client-workflow`]" — that loop drives the **meta→client** child created by `create-session` (`workflows/meta/techniques/workflow-engine/create-session.md:44`), and binds `client_session_index` at every step (`workflows/meta/activities/03-dispatch-client-workflow.yaml:46,60,69,76,84`). It does not and cannot drive a grandchild from `handle-sub-workflow`: nothing in the corpus consumes `{child_session_index}` (`workflows/meta/techniques/workflow-engine/handle-sub-workflow.md:22-24`), so no definition drives a sub-workflow's activity loop at all.
- `docs/checkpoint-model.md:24` ("Only one checkpoint may be active at a time") is not a run-level invariant. The refusal reads only the addressed node (`src/tools/workflow-tools.ts:1647`) and the schema gives every node in the `triggeredWorkflows` tree its own slot (`schemas/session-file.schema.json:54,311-313`) — parent and children can hold simultaneous gates, verified against both the JSON Schema and the runtime Zod schema.
- `docs/workflow-fidelity.md:64-70` claims exactly three operations refuse while a checkpoint is active and "everything else stays open, deliberately." Five more gate via `assertNoActiveCheckpoint`: `get_workflow` (`src/tools/workflow-tools.ts:596`), `get_activity` (`:1025`), `get_trace` (`:2132`), `get_technique` (`src/tools/resource-tools.ts:651`), `get_resource` (`:881`).
- `docs/dispatch-model.md:25-36` describes child creation via `start_session({ parent_planning_slug })` into the child's own folder, with the parent snapshotted under `parentSession`. None of that is the current code: creation is `dispatch_child`, the child is embedded at `triggeredWorkflows[N].state` in the parent's file, `parent_planning_slug` does not exist in `src/`, and `parentSession` is never set on an embedded child (`src/tools/resource-tools.ts:593-604`) — which also makes the parent-notification branch at `src/tools/workflow-tools.ts:930-953` dead for every `dispatch_child` child.

## Confidence

Certain, from code and schema: the per-node scoping of `activeCheckpoint` and of every guard that reads it; that parent and children each hold an independent slot (verified by running both the ajv JSON-Schema validator and `safeValidateSessionFile` against a three-gate document); that no server code refuses simultaneous gates across nodes; that `dispatch_child` carries no checkpoint guard; that `respond_checkpoint` has no `checkpoint_id` parameter and disambiguates by index alone; that no `inspect_session` projection surfaces `activeCheckpoint`; and that session writes are whole-file read-modify-write with no CAS or lock — I reproduced the silent lost update against the real `loadSessionForTool`/`saveSessionForTool` pair (scratch harness, removed afterwards).

Could not settle from the corpus: (a) whether the host actually issues two `yield_checkpoint` calls concurrently. That is the caller's tool surface — the corpus's only statement is an instruction to the model (`workflows/meta/techniques/harness-compat/claude-code.md:26`), and the definition schema has no parallel-iteration construct (`schemas/activity.schema.json:525-532`). What would settle it: whether the MCP client pipelines requests within one session, and which transport the deployment uses (the HTTP path at `src/transports/http.ts:113-164` has no queue; stdio would still not serialize handlers, since the SDK does not). (b) Whether meta activity 03 is run inline by the top-level agent or dispatched to a worker. `workflows/meta/README.md:52` says "driven inline" while `orchestrator-conduct.md:14` forbids an orchestrator executing activity steps, and meta lists `activity-worker` among its activity techniques (`workflows/meta/workflow.yaml:23`). This does not change any answer above — the presenter's identity is fixed by `agent-conduct.md:34` and `present-checkpoint-to-user.md:32` either way — but it is an unresolved tension in the corpus, settled only by a run trace showing whether a worker was spawned for `dispatch-client-workflow`.

## Citations

- workflows/meta/techniques/workflow-engine/yield-checkpoint.md:20
- workflows/meta/techniques/workflow-engine/yield-checkpoint.md:26
- workflows/meta/techniques/workflow-engine/yield-checkpoint.md:37
- workflows/meta/techniques/workflow-engine/present-checkpoint-to-user.md:28
- workflows/meta/techniques/workflow-engine/present-checkpoint-to-user.md:32
- workflows/meta/techniques/workflow-engine/present-checkpoint-to-user.md:45
- workflows/meta/techniques/workflow-engine/respond-checkpoint.md:29
- workflows/meta/techniques/workflow-engine/respond-checkpoint.md:30
- workflows/meta/techniques/workflow-engine/resume-worker.md:55
- workflows/meta/techniques/workflow-engine/resume-from-checkpoint.md:21
- workflows/meta/techniques/agent-conduct.md:34
- workflows/meta/techniques/orchestrator-conduct.md:34
- workflows/meta/techniques/orchestrator-conduct.md:14
- workflows/meta/techniques/orchestrator-conduct.md:18
- workflows/meta/techniques/workflow-engine/workflow-orchestrator.md:40
- workflows/meta/techniques/workflow-engine/activity-worker.md:49
- workflows/meta/techniques/workflow-engine/activity-worker.md:53
- workflows/meta/techniques/workflow-engine/activity-worker.md:62-64
- workflows/meta/techniques/workflow-engine/activity-worker.md:74-76
- workflows/meta/techniques/workflow-engine/activity-worker.md:80
- workflows/meta/techniques/harness-compat/spawn-agent.md:44
- workflows/meta/techniques/harness-compat/claude-code.md:26
- workflows/meta/techniques/harness-compat/spawn-concurrent.md:33
- workflows/meta/techniques/scatter-gather.md:32
- workflows/meta/techniques/workflow-engine/handle-sub-workflow.md:22-24
- workflows/meta/techniques/workflow-engine/handle-sub-workflow.md:28
- workflows/meta/techniques/workflow-engine/create-session.md:44
- workflows/meta/activities/03-dispatch-client-workflow.yaml:46
- workflows/meta/activities/03-dispatch-client-workflow.yaml:60
- workflows/meta/activities/03-dispatch-client-workflow.yaml:63-77
- workflows/meta/activities/03-dispatch-client-workflow.yaml:84
- workflows/meta/README.md:52
- workflows/meta/workflow.yaml:13-23
- workflows/work-package/activities/10-post-impl-review.yaml:176-182
- workflows/work-package/activities/10-post-impl-review.yaml:237-240
- workflows/work-package/workflow.yaml:72-74
- workflows/prism-audit/activities/02-execute-analysis.yaml:64-80
- workflows/prism-audit/workflow.yaml:13-15
- workflows/prism-audit/README.md:114-118
- workflows/prism/activities/00-select-mode.yaml:43
- schemas/session-file.schema.json:54-115
- schemas/session-file.schema.json:128-161
- schemas/session-file.schema.json:261-325
- schemas/session-file.schema.json:311-313
- schemas/activity.schema.json:525-532
- src/schema/session.schema.ts:227-233
- src/tools/workflow-tools.ts:219-229
- src/tools/workflow-tools.ts:326-339
- src/tools/workflow-tools.ts:596
- src/tools/workflow-tools.ts:723-728
- src/tools/workflow-tools.ts:930-953
- src/tools/workflow-tools.ts:1025
- src/tools/workflow-tools.ts:1630
- src/tools/workflow-tools.ts:1642-1649
- src/tools/workflow-tools.ts:1698-1699
- src/tools/workflow-tools.ts:1737-1759
- src/tools/workflow-tools.ts:1746-1751
- src/tools/workflow-tools.ts:1772
- src/tools/workflow-tools.ts:1846-1851
- src/tools/workflow-tools.ts:1862-1865
- src/tools/workflow-tools.ts:1889-1897
- src/tools/workflow-tools.ts:1920-1931
- src/tools/workflow-tools.ts:1944-1949
- src/tools/workflow-tools.ts:1952-1960
- src/tools/workflow-tools.ts:1993-1996
- src/tools/workflow-tools.ts:2037-2077
- src/tools/workflow-tools.ts:2132
- src/tools/workflow-tools.ts:2198-2208
- src/tools/workflow-tools.ts:2225-2227
- src/tools/workflow-tools.ts:2268-2305
- src/tools/resource-tools.ts:464-466
- src/tools/resource-tools.ts:593-604
- src/tools/resource-tools.ts:605-625
- src/tools/resource-tools.ts:651
- src/tools/resource-tools.ts:881
- src/utils/session/params.ts:62-70
- src/utils/session/resolver.ts:63-90
- src/utils/session/resolver.ts:154-156
- src/utils/session/resolver.ts:164-181
- src/utils/session/resolver.ts:193-201
- src/utils/session/store.ts:328-338
- src/utils/session/store.ts:365-393
- src/utils/session/store.ts:454-470
- src/utils/session/store.ts:527-578
- src/utils/session/derivation.ts:122-131
- src/transports/http.ts:113-164
- docs/checkpoint-model.md:19
- docs/checkpoint-model.md:24
- docs/checkpoint-model.md:28-40
- docs/checkpoint-model.md:114
- docs/checkpoint-model.md:154
- docs/workflow-fidelity.md:64-70
- docs/dispatch-model.md:25-36
- docs/dispatch-model.md:56
- docs/dispatch-model.md:99