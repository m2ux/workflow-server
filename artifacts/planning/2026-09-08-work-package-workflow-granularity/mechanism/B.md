# B. What crosses the boundary, in each direction, and by what mechanism

# B. What crosses the child-workflow boundary, in each direction, and by what mechanism

## 1. Inbound — the complete list

`dispatch_child` has exactly two branches (`src/tools/resource-tools.ts:505-585` transient-meta-parent promotion, `:587-625` persistent parent). They differ only in where the file is written; **what they construct for the child is identical** (`:552-560` vs `:596-604`). Everything the child begins life with comes from one call to `createInitialSessionFile` (`src/schema/session.schema.ts:295-341`).

### 1a. The child's variable bag — two contributors, no more

```ts
const inheritedRequest = loaded.state.variables?.['user_request'];       // :481
const childVariables = (wf) => ({
  ...seedDefaults(wf.variables),                                        // :483
  ...(inheritedRequest !== undefined ? { user_request: inheritedRequest } : {}),  // :484
});
```

| Bag key | Source | Condition |
|---|---|---|
| every `name` whose **child-side** declaration carries `defaultValue` | the child workflow's own `workflow.yaml` | `v.defaultValue !== undefined` — presence, not truthiness, so `false`/`""`/`0` seed (`src/utils/variable-seed.ts:12-18`) |
| `user_request` | the **parent's** bag, verbatim | parent's bag holds the key |

That is the entire bag. Nothing else from the parent's bag crosses. The seeded map is recorded as one `variables_seeded` history event on the child (`session.schema.ts:327-332`).

**Correction to the established facts.** The prior pass said `user_request` crosses "where the child declares it". It is not conditioned on the child's declaration — `:482-485` spreads it in whenever the *parent's* bag has it, with no reference to `wf.variables`. The doc comment at `:478-480` ("A child that declares `user_request` resolves it; one that does not is unaffected") describes the *consequence*, not a filter. This matters twice over: the key lands in the bag of a workflow that never declared it, and because a grandchild's dispatch reads `loaded.state.variables['user_request']` of the *child*, it propagates transitively down an arbitrarily deep chain even through levels that declare nothing.

### 1b. Session fields set on the child

| Field | Value | Citation |
|---|---|---|
| `sessionIndex` | HMAC over `realpath(parentFolder) + ':' + jsonPath`, 6 base32 chars | `:595` / `src/utils/session/derivation.ts:122-131` |
| `workflowId` | the `workflow_id` argument | `:598` |
| `workflowVersion` | `wfResult.value.version ?? ''`, resolved up front | `:471-473`, `:599` |
| `agentId` | the `agent_id` argument — **schema default `'worker'`** | `:458`, `:600` |
| `repo` | `parentState.repo` — inherited, possibly just bound by the `repo` arg via `bindSessionRepo` | `:490-503`, `:601` |
| `contextMode` | the **`context_mode` argument**, when passed | `:602` |
| `seq`/`ts`/`startedAt` | `0` / now / now | `session.schema.ts:315-317` |
| `currentActivity`/`currentTechnique`/`exit` | `''` | `session.schema.ts:318-320` |
| `completedActivities`/`checkpointResponses`/`triggeredWorkflows` | empty | `session.schema.ts:322-334` |
| `status` | `'running'` | `session.schema.ts:333` |
| `history` | `[workflow_started, variables_seeded?]` | `session.schema.ts:327-332` |

**Correction.** `contextMode` is **not** inherited from the parent. It is set only from the `context_mode` tool argument (`:558`, `:602`); a persistent parent dispatching without the argument produces a child with no `contextMode` at all, i.e. fresh delivery.

**Absent on the child, by omission at the call site:** `parentSession`, `planningFolderPath`, `activeCheckpoint`, `deliveredContent`, `declaredArtifacts`. `createInitialSessionFile` accepts `parentSession` and `planningFolderPath` (`session.schema.ts:300-301`) and neither dispatch branch passes them. The missing `planningFolderPath` is a live consequence: `work-package` declares `planning_folder_path` as a variable with no default, so a promoted child has neither the bag key nor the session field, and must be told the path.

### 1c. The parent-side record and the dispatch response

The parent gains one `EmbeddedSessionRef` (`:562-569`, `:606-613`): `workflowId`, `sessionIndex`, `triggeredAt`, `triggeredFrom: { activityId: parent's currentActivity }`, `status: 'running'`, `state: childInitial` — plus a `workflow_triggered` history event (`:570-575`, `:614-619`).

The tool response carries **three** values, not one: `session_index`, `workflow { id, version, initialActivity }`, and `planning_folder_path` (the parent's folder), with `planning_slug` added on the transient branch (`:582`, `:623`; described at `:450`). `handle-sub-workflow.md:20-24` declares only `child_session_index` as an output — the technique under-declares the server's response. `create-session.md:44` captures all three, and its `initialActivity` capture is load-bearing: the parent otherwise has no way to know the child's first activity id without loading a bundle it will not execute (`:450`).

### 1d. Is there ANY server route for a no-default parent value? — No.

- `dispatch_child`'s `inputSchema` is `.strict()` with exactly six keys, none of them a variable map (`:455-462`).
- `start_session`'s is `.strict()` and accepts only `user_request` as a bag payload (`:111-120`) — and `dispatch_child` is explicitly not that tool's job (`:109`).
- `respond_checkpoint` accepts no free-form values; its writes come from the option `effect` in the workflow definition (`src/tools/workflow-tools.ts:1944-1949`, `:2001`).

So the one hard-coded exception, `user_request`, is the *only* named value that crosses without a child-side default.

### 1e. The agent-relayed alternatives, in operational terms

**Route A — a control-plane bag write. Exists in the tool surface; used by no definition.**

*Which agent:* the parent orchestrator (the only context holding both the parent's values and the child's `session_index`). *Which call:* `next_activity { session_index: <child_session_index>, activity_id: <initialActivity>, variables_changed: { target: "…", … } }` (`workflow-tools.ts:702`). *At what point:* the child's **first** transition — the same call that enters its initial activity, before any worker is dispatched. The write is unconditional (`:804-810` → `variable-seed.ts:68-107`) and an **undeclared** name passes completely silently: `declarations.get(name)` returns undefined, so neither the type check (`variable-seed.ts:80`) nor the value-set check (`:86`) can fire. Attribution is to the *exiting* activity, and on a first call `draft.currentActivity` is `''`, so the `variable_set` event carries no activity field (`:807`).

No technique in the corpus does this. `handle-sub-workflow.md:28` is a bare dispatch, and none of the four dispatch sites (`prism-audit/activities/02-execute-analysis.yaml:76-81`, `prism-evaluate/activities/02-execute-analysis.yaml:91-96`, `work-package/activities/10-post-impl-review.yaml:178-183`, `create-session.md:44`) passes a bag payload. Whether an agent is *permitted* to make this call is partly prose: `worker-control-plane-ban` bars a worker from `next_activity` at all (`activity-worker.md:62-64`), and the engine's `variable-mutation-source` rule admits only two write sources — checkpoint `setVariable` effects and worker `activity_complete` results (`meta/techniques/workflow-engine/TECHNIQUE.md:36-38`). An orchestrator relaying a parent value would be a third source, so authoring Route A would need that rule amended.

**Route B — prose relay into the worker's prompt. This is what the corpus actually does.**

`compose-trigger-context` sets `target`, `target_description`, `output_path`, `pipeline_mode`, `analysis_focus` — **in the parent's bag** (`prism-audit/techniques/execute-analysis/compose-trigger-context.md`, Outputs + Protocol). `dispatch-activity` then takes `state` = "current variable state for stub substitution" and, at Protocol step 3, applies `compose-prompt` "with … `{state}` as substitutions" (`meta/techniques/workflow-engine/dispatch-activity.md`, Inputs::state and Protocol 3). So the value reaches the child's **worker context as prompt text**; it does not enter the child session's bag.

The asymmetry is visible in `prism/workflow.yaml`: `target` is `required: true` with **no** `defaultValue`, `output_path` has `defaultValue: .`. At dispatch the child bag is therefore `{ output_path: "." }` (plus inherited `user_request`), and `target` is absent. `variable-binding` step 2.2's implicit same-name bind would find nothing (`meta/techniques/variable-binding.md`), so the required input is satisfied by the prompt alone. The value only ever reaches the child's persisted bag if that worker reports it back in its own `activity_complete.variables_changed` and the driving orchestrator relays it under the child's index (`finalize-activity.md:46-48`, `:72`).

---

## 2. Outbound

### 2a. `returnedContext` — declared five times, written zero times

| Where | What it is |
|---|---|
| `src/schema/session.schema.ts:30` | doc comment: "Context returned from the child on completion" |
| `src/schema/session.schema.ts:249` | `returnedContext: z.record(z.unknown()).optional()` on `EmbeddedSessionRefSchema` |
| `src/schema/state.schema.ts:150` | same field on the parallel `TriggeredWorkflowRefSchema` |
| `schemas/session-file.schema.json:307` | generated JSON Schema |
| `schemas/state.schema.json:318` | generated JSON Schema |
| `schemas/README.md:930-941` | a worked example: `"returnedContext": { "pr_number": "123" }` |

No assignment exists. A whole-repository search for `returnedContext` outside `.engineering/` and `site/` returns only the six declarations above plus the one consumer, `work-packages/techniques/orchestrate-package-execution/execute-package.md:57`. No tool reads it either: `projectChildren` emits `index`, `sessionIndex`, `workflowId`, and then `status`/`currentActivity`/`completed` **read out of the embedded `state`**, never the ref's own fields (`workflow-tools.ts:326-338`). And it cannot be supplied out of band: `session.json` is sealed, and `verifySeal` throws `SEAL_MISMATCH` — "session.json has been modified outside the server" — on any external edit (`src/utils/session/store.ts:365-393`).

So `execute-package.md:57` instructs an agent to read a field that never holds a value. Worse, `src/schema/state.schema.ts`'s entire `WorkflowState` family is dead code: nothing outside that module imports `WorkflowStateSchema` or `TriggeredWorkflowRefSchema`, and `schemas/state.schema.json` is merely its generated projection — so one of the two `returnedContext` declarations, along with `parentWorkflow.passedContext` and `returnTo` (`state.schema.ts:119-121`, `:172`), is doubly inert.

### 2b. `EmbeddedSessionRef.status` / `completedAt` — a completion notifier that cannot fire

There *is* a code path for it. On the child's terminal `next_activity`, the server loads the parent, finds `triggeredWorkflows[i]` by the child's `sessionIndex`, flips `status: 'running' → 'completed'`, sets `completedAt`, and appends a `workflow_returned` history event (`workflow-tools.ts:926-953`).

It is gated on `state.parentSession?.sessionIndex` (`:930`). **Nothing sets `parentSession`.** The only writer is `createInitialSessionFile` from its argument (`session.schema.ts:336`), and none of its three callers passes one: `start_session` (`resource-tools.ts:339-361`, whose comment at `:331` says "Fresh top-level session — no parent"), and both `dispatch_child` branches (`:552-560`, `:596-604`). The fourth caller is legacy migration (`src/utils/session/migration.ts:190-195`), which also omits it.

Consequences: a `dispatch_child` child's `EmbeddedSessionRef.status` is written once as `'running'` at dispatch and never changes; `completedAt` is never set; no `workflow_returned` event ever reaches a parent; and `get_workflow_status`'s `parent` block (`workflow-tools.ts:2243-2250`), `parentChainDepth`'s soft warning (`session.schema.ts:276-289`, `resource-tools.ts:388-392`), and the trace's `psid` (`resource-tools.ts:397`) are all likewise unreachable.

**Two corpus statements to correct.** `store.ts:677-681` says transient sessions' "state lives only long enough to dispatch a child workflow, which then snapshots them into `session.json#parentSession` and discards the parent" — there is no such snapshot; the promotion branch writes the parent's state to a durable folder and repoints the transient index (`resource-tools.ts:577-580`). And `workflow-tools.ts:928-929`'s "transient parents were already discarded when the child captured them" rests on the same absent capture.

### 2c. What IS structurally readable by a parent

The child's own `SessionFile` at `triggeredWorkflows[N].state` stays current without any return call, because `saveSessionForTool` re-inserts the child's state at its `jsonPath` and rewrites the whole top file (`src/utils/session/resolver.ts:193-201`). And the child's **own** `status` does flip to `'completed'` on its terminal transition (`workflow-tools.ts:860-863`) — that is a different field from the ref's `status`.

Three read channels reach it:

| Call | Yields |
|---|---|
| `inspect_session { session_index: <parent>, view: 'children' }` | per-child `index`, `sessionIndex`, `workflowId`, and `status`/`currentActivity`/`completed` from the embedded state, plus that child's cost kept outside the parent's totals (`workflow-tools.ts:326-338`, `:537`) |
| `inspect_session { session_index: <parent>, view: 'variables', child_index: N }` | the child's **entire variable bag** (`:2288-2290`, `:530-533`); one level of descent only |
| `get_workflow_status` / `inspect_session { session_index: <child> }` | same, by direct address at any depth — `get_workflow_status` returns `variables: state.variables` outright (`:2235`) |

So the child's whole final bag is readable by the parent. It is not a *return value* — the parent must know to look, must know the name of what it is looking for, and no authored technique in the corpus performs any of these reads on a child.

### 2d. What the corpus actually uses: a file on disk

The prism children return through an artifact. `deliver-result` emits `RUN-MANIFEST.json` into `{output_path}` (`prism/activities/04-deliver-result.yaml:15`; `prism/techniques/emit-run-manifest.md:76`) — a path the parent chose and relayed **inbound by prompt**. The parent then reads `report_path`, `definitive_findings_path`, the artifact list, and `status` (`complete`/`partial`/`error`) straight out of the file, with no directory re-scan (`prism-audit/techniques/execute-analysis/read-run-manifest.md:24-27`). `prism-audit/README.md:114-117` names this the contract in as many words: "The audit reads each run's declared contract artifacts — `RUN-MANIFEST.json`, `REPORT.md`, `DEFINITIVE-FINDINGS.md` — which is where the run's reconciled result lives." The manifest's `status` is the de facto child return status (`prism/resources/run-manifest.md:11`, template + field table).

### 2e. The strongest channel is not a channel

Because the parent orchestrator drives the child's activities inline (`meta/activities/03-dispatch-client-workflow.yaml:31-116`), the child's final `activity_complete` envelope — `variables_changed`, `artifacts_produced`, `selected_exit`, `next_activity_id`, `activity_exit`, `batch_may_continue` (`finalize-activity.md:32-68`) — is returned by the worker straight into the driving orchestrator's own context. The parent holds the child's result because it *is* the same agent, not because anything crossed a session boundary. That is why no return channel was ever needed, and it is exactly what evaporates the moment a child runs under a different agent or concurrently with a sibling.

---

## 3. Verdict

### Inbound contract

| What crosses | Carried by |
|---|---|
| child's `sessionIndex` (derived from parent folder + jsonPath) | **structure** |
| `workflowId`, `workflowVersion` | **structure** |
| `agentId` (dispatch arg; default `'worker'`) | **structure** |
| `repo` (inherited from the parent session) | **structure** |
| `contextMode` (dispatch arg only — *not* inherited) | **structure** |
| every child-declared variable that has a `defaultValue` | **structure** |
| `user_request` from the parent's bag | **structure** — the single hard-coded exception |
| the planning folder the child will use | **structure outbound to the dispatcher** (`planning_folder_path` in the response), **prose inbound to the child** — the child's own `planningFolderPath` field is never set |
| the child's first activity id | **structure** (`workflow.initialActivity` in the response) |
| **any other parent bag value the child declares without a default** (`target`, `output_path` overrides, `pipeline_mode`, `analysis_focus`, `branch_name`, `implementation_plan`, …) | **prose relay** — parent's bag → `dispatch-activity`'s `state` → `compose-prompt` substitutions → worker prompt. Never reaches the child session's bag. A structural route exists (`next_activity.variables_changed`) but no definition uses it and the engine's `variable-mutation-source` rule does not currently sanction it |

For scale on the promotion question: `work-package` declares 26 variables, 13 with a `defaultValue` and 13 without (`target_path`, `target_repo`, `component_git_dir`, `pr_number`, `branch_name`, `issue_type`, `user_request`, `planning_folder_path`, `default_branch`, `flagged_block_indices`, `question_domains`, `implementation_plan`, `issue_title`). Promote a set of activities into a child and 12 of those 13 (all but `user_request`) become prose-relay obligations on the parent.

### Outbound contract

| What a parent can learn | Carried by |
|---|---|
| that a child was dispatched, when, and from which activity | **structure** (`EmbeddedSessionRef` + `workflow_triggered` event) |
| the child's live `status`, `currentActivity`, `completedActivities`, and cost | **structure**, via `inspect_session view: 'children'` — read out of the embedded `state`, and only if the parent asks |
| the child's complete final variable bag | **structure**, via `inspect_session view: 'variables'` (+ `child_index`) or `get_workflow_status` on the child's index — available, unused by any definition |
| the child's history and trace | **structure**, via `inspect_session view: 'history'` / `get_trace` |
| `triggeredWorkflows[N].status` transitioning to `completed`, and `completedAt` | **not at all** — the notifier at `workflow-tools.ts:930` is gated on `parentSession`, which nothing ever sets |
| `triggeredWorkflows[N].returnedContext` | **not at all** — declared in two Zod schemas, two generated JSON Schemas, and a README example; written by no code, read by no tool, unwritable out of band because of the seal |
| the child's declared results (report paths, findings, artifact list, run verdict) | **a file on disk** — `RUN-MANIFEST.json`, at a path the parent relayed inbound by prose. The only working return contract in the corpus |
| the child's final `activity_complete` envelope | **same-context accident** — the driving orchestrator receives it directly because it is the agent running the child. Not a boundary mechanism |

The boundary is therefore structural in one direction only for *identity and defaults*, and prose in both directions for *everything domain-specific*. A promoted child is cheap to create and expensive to talk to.

## Corrections to prior premises

- `user_request` is NOT gated on the child declaring it. `src/tools/resource-tools.ts:482-485` spreads `{ user_request: inheritedRequest }` over `seedDefaults(wf.variables)` with no reference to `wf.variables`, so the key lands in the bag of a workflow that never declared it — and because a grandchild dispatch reads the child's own bag (`:481`), it propagates transitively through levels that declare nothing.
- `contextMode` is not inherited from the parent. It comes only from the `context_mode` tool argument (`src/tools/resource-tools.ts:558`, `:602`); a persistent parent dispatching without the argument yields a child with no `contextMode`. Only `repo` is inherited, from `parentState.repo` (`:557`, `:601`).
- `dispatch_child` returns three values, not one: `session_index`, `workflow { id, version, initialActivity }`, and `planning_folder_path` (plus `planning_slug` on the transient branch) — `src/tools/resource-tools.ts:582`, `:623`, described at `:450`. `handle-sub-workflow.md:20-24` declares only `child_session_index`, so the technique under-declares the server's response; `create-session.md:44` captures all three.
- `dispatch_child`'s `agent_id` schema default is `'worker'` (`src/tools/resource-tools.ts:458`), not `workflow-orchestrator`; the latter is what `handle-sub-workflow.md:28` chooses to pass.
- The child's `planningFolderPath` session field is never set. `createInitialSessionFile` accepts it (`src/schema/session.schema.ts:301`) and neither dispatch branch passes it (`resource-tools.ts:552-560`, `:596-604`). The parent's folder reaches the dispatcher in the tool response only.
- A completion-notify path for `triggeredWorkflows[N].status` / `completedAt` exists at `src/tools/workflow-tools.ts:926-953` but can never fire for a `dispatch_child` child: it is gated on `state.parentSession?.sessionIndex` (`:930`) and nothing anywhere sets `parentSession` — the only writer is `createInitialSessionFile` from its argument (`session.schema.ts:336`) and all four callers omit it (`resource-tools.ts:339`, `:552`, `:596`; `migration.ts:190`). The ref's `status` therefore stays `'running'` forever and no `workflow_returned` event ever reaches a parent.
- `src/utils/session/store.ts:677-681` claims a child "snapshots [the transient parent] into `session.json#parentSession` and discards the parent". No such snapshot exists; the promotion branch writes the parent's state to a durable folder and repoints the transient index (`resource-tools.ts:577-580`). The comment at `workflow-tools.ts:928-929` ("transient parents were already discarded when the child captured them") rests on the same absent capture.
- `returnedContext` is declared in `src/schema/session.schema.ts:30,249`, `src/schema/state.schema.ts:150`, `schemas/session-file.schema.json:307`, `schemas/state.schema.json:318`, and exemplified in `schemas/README.md:930-941` — and is written by no code path, read by no tool, and absent from `projectChildren` (`workflow-tools.ts:326-338`). It also cannot be supplied out of band, since `verifySeal` rejects any external edit to session.json (`store.ts:385-391`). `execute-package.md:57` reads a field that never holds a value.
- The `WorkflowState` family in `src/schema/state.schema.ts` (including its own `returnedContext`, `parentWorkflow.passedContext`, `returnTo`) is dead: nothing outside that module imports `WorkflowStateSchema` or `TriggeredWorkflowRefSchema`, and `schemas/state.schema.json` is merely its generated projection.
- A structural inbound route for a no-default value DOES exist in the tool surface, though no definition uses it: `next_activity { session_index: <child>, variables_changed: {...} }` writes any name into the child's bag (`workflow-tools.ts:702`, `:804-810`), and an undeclared name passes with no warning at all because `declarations.get(name)` is undefined (`variable-seed.ts:80`, `:86`). The engine's `variable-mutation-source` rule (`meta/techniques/workflow-engine/TECHNIQUE.md:36-38`) sanctions only two write sources, so authoring this would require amending that rule.

## Confidence

Certain, from source: the complete inbound field-and-bag enumeration; that `dispatch_child`/`start_session` input schemas are `.strict()` with no variable-map parameter; that `seedDefaults` requires `defaultValue !== undefined`; that `user_request` crosses unconditionally on the parent side; that `contextMode` comes from the argument and `repo` from the parent session; that `parentSession` and `planningFolderPath` are never set on a child, hence the completion-notify block at workflow-tools.ts:930 is unreachable; that `returnedContext` has no writer or reader anywhere in src/, schemas/ or workflows/ (verified by whole-repo grep and by tracing every `createInitialSessionFile` and `triggeredWorkflows` mutation site); that `inspect_session`/`get_workflow_status` do expose a child's full bag and embedded status to a parent holding its index; and that the corpus's only working return contract is RUN-MANIFEST.json on disk.

Not settled from the corpus: (1) whether a parent orchestrator agent is actually *able* to issue `next_activity` against a child's index in a given harness — the server applies no agent-role gate on that tool, and the only prohibition is prose (`worker-control-plane-ban`, `variable-mutation-source`); a permission-layer or client-side restriction would settle it. (2) Whether `variables_changed` writes into a child's bag are safe in practice with respect to the drive loop's `distrust-then-reconcile` rule — that is an authoring question, not a code fact. (3) I did not run the test suite; my claims about dead code paths rest on grep-verified absence of callers and imports, not on execution.

## Citations

- src/tools/resource-tools.ts:446-462
- src/tools/resource-tools.ts:450
- src/tools/resource-tools.ts:455-462
- src/tools/resource-tools.ts:458
- src/tools/resource-tools.ts:464-473
- src/tools/resource-tools.ts:478-485
- src/tools/resource-tools.ts:490-503
- src/tools/resource-tools.ts:505-585
- src/tools/resource-tools.ts:548-560
- src/tools/resource-tools.ts:562-575
- src/tools/resource-tools.ts:577-580
- src/tools/resource-tools.ts:582
- src/tools/resource-tools.ts:587-604
- src/tools/resource-tools.ts:601
- src/tools/resource-tools.ts:602
- src/tools/resource-tools.ts:606-619
- src/tools/resource-tools.ts:621-625
- src/tools/resource-tools.ts:623
- src/tools/resource-tools.ts:102-121
- src/tools/resource-tools.ts:109
- src/tools/resource-tools.ts:111-120
- src/tools/resource-tools.ts:331-361
- src/tools/resource-tools.ts:388-392
- src/tools/resource-tools.ts:397
- src/utils/variable-seed.ts:5-18
- src/utils/variable-seed.ts:68-107
- src/utils/variable-seed.ts:75-93
- src/schema/session.schema.ts:17-36
- src/schema/session.schema.ts:29-30
- src/schema/session.schema.ts:239-251
- src/schema/session.schema.ts:249
- src/schema/session.schema.ts:276-289
- src/schema/session.schema.ts:295-341
- src/schema/session.schema.ts:300-301
- src/schema/session.schema.ts:315-334
- src/schema/session.schema.ts:327-332
- src/schema/session.schema.ts:336
- src/schema/state.schema.ts:119-121
- src/schema/state.schema.ts:150
- src/schema/state.schema.ts:155-180
- src/schema/state.schema.ts:172
- src/utils/session/derivation.ts:92
- src/utils/session/derivation.ts:122-131
- src/utils/session/resolver.ts:193-201
- src/utils/session/store.ts:124-125
- src/utils/session/store.ts:365-393
- src/utils/session/store.ts:677-690
- src/utils/session/migration.ts:190-195
- src/tools/workflow-tools.ts:85-90
- src/tools/workflow-tools.ts:180-183
- src/tools/workflow-tools.ts:213-214
- src/tools/workflow-tools.ts:315-338
- src/tools/workflow-tools.ts:521-543
- src/tools/workflow-tools.ts:530-533
- src/tools/workflow-tools.ts:673-675
- src/tools/workflow-tools.ts:695-713
- src/tools/workflow-tools.ts:702
- src/tools/workflow-tools.ts:760-762
- src/tools/workflow-tools.ts:799-810
- src/tools/workflow-tools.ts:856-863
- src/tools/workflow-tools.ts:926-953
- src/tools/workflow-tools.ts:930
- src/tools/workflow-tools.ts:1941-1949
- src/tools/workflow-tools.ts:2001
- src/tools/workflow-tools.ts:2229-2250
- src/tools/workflow-tools.ts:2268-2298
- src/index.ts:7
- schemas/session-file.schema.json:307
- schemas/state.schema.json:318
- schemas/README.md:930-941
- workflows/meta/techniques/workflow-engine/handle-sub-workflow.md:20-24
- workflows/meta/techniques/workflow-engine/handle-sub-workflow.md:28
- workflows/meta/techniques/workflow-engine/create-session.md:44
- workflows/meta/techniques/workflow-engine/finalize-activity.md:32-68
- workflows/meta/techniques/workflow-engine/finalize-activity.md:46-48
- workflows/meta/techniques/workflow-engine/finalize-activity.md:72
- workflows/meta/techniques/workflow-engine/dispatch-activity.md:22-26
- workflows/meta/techniques/workflow-engine/dispatch-activity.md:56-58
- workflows/meta/techniques/workflow-engine/dispatch-activity.md:76
- workflows/meta/techniques/workflow-engine/activity-worker.md:62-64
- workflows/meta/techniques/workflow-engine/TECHNIQUE.md:36-38
- workflows/meta/techniques/variable-binding.md:11-20
- workflows/meta/techniques/variable-binding.md:39
- workflows/meta/activities/03-dispatch-client-workflow.yaml:31-116
- workflows/prism/workflow.yaml:22-38
- workflows/prism/activities/04-deliver-result.yaml:15
- workflows/prism/techniques/emit-run-manifest.md:76
- workflows/prism/resources/run-manifest.md:3
- workflows/prism/resources/run-manifest.md:11-58
- workflows/prism-audit/activities/02-execute-analysis.yaml:76-81
- workflows/prism-audit/techniques/execute-analysis/compose-trigger-context.md:12-38
- workflows/prism-audit/techniques/execute-analysis/read-run-manifest.md:24-27
- workflows/prism-audit/README.md:114-117
- workflows/prism-evaluate/activities/02-execute-analysis.yaml:91-96
- workflows/work-package/activities/10-post-impl-review.yaml:178-183
- workflows/work-packages/techniques/orchestrate-package-execution/execute-package.md:52
- workflows/work-packages/techniques/orchestrate-package-execution/execute-package.md:57
- workflows/work-package/workflow.yaml