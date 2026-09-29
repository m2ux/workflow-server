# #973 fact sheet — meta walk protocol defects

Trees:
- Engine `E:` = `/home/mike1/projects/dev/workflow-server/.worktrees/schema-description-hygiene` (main). `WT` = `E:src/tools/workflow-tools.ts`.
- Corpus `C:` = `/home/mike1/projects/dev/workflow-server/.worktrees/meta-walk-protocol/corpus` (workflow/meta-walk-protocol @ 03dfd4e2).

---

## 1. Walk termination

### Engine

**When a session completes** — `WT:1540-1543`, inside `advanceSession`, only when the frontier is empty after the retirement (`WT:1490`):
```ts
if (target === 'complete' || isTerminal) {
  draft.history.push({ timestamp: now, type: 'workflow_completed' });
  draft.status = 'completed';
}
```
- `isTerminal = destination === TERMINAL_SENTINEL` (`WT:1288`); `TERMINAL_SENTINEL = '__terminal__'` (`E:src/loaders/workflow-loader.ts:990`).
- `destination = boundDestination ?? activity_id` (`WT:1282-1285`): when `from_activity` + `exit` are given and the graph binds that exit, the graph wins; otherwise the caller's `activity_id` is used.
- `__terminal__`: nothing is pushed to the frontier (`WT:1533-1535`, only an `activity_entered` event). Frontier ends empty.
- `complete`: the target IS pushed to the frontier (`WT:1518-1521`) AND status flips to `completed` on entry — i.e. work-package reads `completed` while its `complete` activity is still in flight. Leaving `complete` via `done -> __terminal__` pushes a second `workflow_completed`.
- Launched-record close uses the caller's arg, not the derived target: `(activity_id === 'complete' || isTerminal)` (`WT:1552`). An exit bound to `complete` with a different `activity_id` arg completes the session but does not close the parent's launched record.

**What next_activity returns on completion** — `WT:1669-1693`:
```ts
const branchesInFlight = !entering || entered.length > 1;
const responseData = {
  activity_id: destinationField(destination),
  ...(branchesInFlight ? { outstanding: entered }
     : { name: getActivity(result.value, entered[0] ?? '')?.name ?? 'Workflow Complete' }),
  session_index,
};
```
- `__terminal__` => `{ activity_id: "__terminal__", name: "Workflow Complete", session_index }`. No `outstanding`, no completion flag, no status field. `_meta` carries `validation`, `trace_token`; no `batch` (`WT:1620` skips when terminal); no `barrier` unless a fan was open.
- `complete` => `{ activity_id: "complete", name: <complete's name>, session_index }` — indistinguishable from an ordinary advance.
- The only signal of completion is the session status (`get_workflow_status`) or the literal `__terminal__` destination.

**get_activity after the terminal** — frontier is empty, so:
- with `activity_id`: `frontierRefusal` -> `"get_activity: no activity in flight. Call next_activity first."` (`E:src/utils/session/resolver.ts:160-163`, called at `WT:1721-1722`).
- without: `"No activity in flight. Call next_activity first."` (`WT:1723-1726`).

**How get_activity reports a terminal exit** — `exit_destinations` = `getExitBindings(workflow, activityId).map(b => [b.exit, b.to])` (`WT:244-246`), emitted in the header (`WT:252-253`) and on `_meta.exit_destinations` (`WT:2355`). An exit bound to `__terminal__` arrives as `{ <exit>: "__terminal__" }`. `getExitBindings` (`E:src/loaders/workflow-loader.ts:531-540`) returns only exits the graph binds; an exitless activity gets no block at all.

**Exitless last activity — can it reach the terminal?** Yes, with or without `exit`:
- No `exit`: `boundDestination` undefined -> `destination = activity_id` (`WT:1282-1285`). T2 fan check only fires if an exit is fan-bound (`WT:1295-1302`). Validation accepts `__terminal__` from anywhere (`E:src/utils/validation.ts:47-50`):
  ```ts
  // The terminal sentinel is a valid terminal target from any activity (it may
  // be reached via an abort/checkpoint effect rather than a declared transition).
  if (requested.length === 1 && requested[0] === TERMINAL_SENTINEL) return null;
  const valid = exitDestinations(workflow, view.act);
  if (valid.length === 0) return null;
  ```
- With an `exit` the activity does not declare: `getExitBindings` is empty, so no binding; `validateReportedExit` returns null when `bindings.length === 0` (`validation.ts:288-294`) — no warning.
- Note `valid.length === 0 => null` also means ANY `activity_id` is accepted without warning from an exitless activity.
- Tested: `E:tests/launched-workflow-completion.test.ts:161-164` walks exitless `child-activity` (`E:tests/fixtures/variable-model/child-fixture/`, no graph) with `next_activity { activity_id: '__terminal__', from_activity }`, no exit, and asserts status `completed`.
- The e2e walker does the same: on `next === TERMINAL_SENTINEL` it calls `transition(..., next, pendingManifest, exiting)` with no exit and stops without get_activity (`E:tests/e2e/walker.ts:948-954`); on `!next` (exitless) it just breaks (`walker.ts:947`), leaving status `running`.

**get_workflow_status** — `WT:3004-3063`. `status = activeCheckpoint ? 'blocked' : state.status === 'running' ? 'active' : state.status` (`WT:3020`); `in_flight: state.frontier` (`WT:3033`); `completed_activities` (`WT:3034`).
| Case | status | in_flight | completed_activities |
|---|---|---|---|
| advanced to `__terminal__` | `completed` | `[]` | includes last |
| entered `complete` (still running it) | `completed` | `["complete"]` | excludes `complete` |
| exitless last activity, loop stopped, no terminal call | `active` | `[<last>]` | excludes last |
- A completed-via-`__terminal__` session and an unstarted one both report `in_flight: []`; `workflow-orchestrator.md:29` resumes from `in_flight` else `initialActivity`, reading nothing about status.
- After terminal, a next_activity with no `from_activity` sees an empty frontier and is treated as a first call (`WT:1006-1023`); validation only warns (`validation.ts:39-43`).

### Corpus graph census (script over every `workflow.yaml` + `activities/*.yaml`)

Ends on `__terminal__` (every terminal path bound):
- `meta` (`end-workflow.completed`; `C:meta/workflow.yaml:25-30`), `work-package` (`complete.done`, via activity `complete`), `workflow-authoring` (`intake-and-context.review-scope-declined`, `validate-and-commit.committed`), `plain-language`, all specimens.

Ends on an exitless activity (never completes under the loop):
- `prism` (`deliver-result`), `workflow-design` (`retrospective`), `codebase-wiki` (`publish`), `prism-audit` (`deliver-audit`), `work-packages` (`implementation`), `cicd-pipeline-security-audit` (`report-generation`, `sub-verification`, `sub-merge`).

Mixed (some paths terminal, some exitless):
- `midnight-system-review` (terminal `verdict-and-report.report-only`; exitless `publish-review`), `ponytail` (terminal `apply-ladder.safety-floor-breached`; exitless `harvest-debt-and-report`), `prism-evaluate` (terminal `deliver-results.delivered`, `resolution-dialogue.resolved`; exitless `apply-mitigations`), `prism-update` (terminal on `abort`s; exitless `commit-and-submit`), `requirements-refinement` (terminal `...source-unreadable`, `finalize-specification.accepted`; exitless `report-failure`), `substrate-node-security-audit` (terminal `report-generation.complete`, `ensemble-pass.complete`; exitless `gap-analysis`, `sub-*`).
- `remediate-vuln`: graph routes to `complete` and many activities that have no files (only `01-start.yaml` exists) — incomplete workflow.

### Corpus text

- `C:meta/routines/activity-loop.yaml:30-32` — output `current_activity`: "The activity the walk holds, and null once the graph routes to none."
- `activity-loop.yaml:54-63` — `continueWhile: { variable: current_activity, operator: "!=", value: null }`, `maxIterations: 200`.
- `activity-loop.yaml:67` — continue-batch gate: `worker_agent_id && ... && worker_result.batch_may_continue && worker_result.next_activity_id && !worker_result.next_activity_fans` (`"__terminal__"` is truthy).
- `activity-loop.yaml:209-215` — `advance-activity` sets `current_activity = "{worker_result.next_activity_id}"`.
- `activity-loop.yaml:216-222` — release worker when `!batch_may_continue || !next_activity_id || next_activity_fans`.
- `C:meta/techniques/workflow-engine/evaluate-transition.md:26-28` — `next_activity_id`: "... an activity id, `__terminal__` where the exit ends the run, ..., or null if the activity declares no exit to take."; `:54` "A destination of `__terminal__` ends the run."; `:56-58` Record Missing Exit: "Where no exit was taken — the activity declares none — set `{next_activity_id}` to null ...".
- `C:meta/techniques/workflow-engine/finalize-activity.md:62-64` — `next_activity_id`: "The `next_activity_id` output of evaluate-transition, carried unread." (The phrase "when the workflow is complete" in the issue does not appear at this head; the null semantics live in evaluate-transition.)
- `C:meta/techniques/workflow-engine/take-activity.md:48-50` — rule `no-session-left-running`: "Take its activities until `get_workflow_status` reports the session `completed` ...". Used as `enter_activity` by `prism-audit/activities/02-execute-analysis.yaml:93`, `prism-evaluate/activities/02-execute-analysis.yaml:108`, `work-package/activities/10-post-impl-review.yaml:211`; `handle-sub-workflow.md:44` names it for launched walks.
- `C:meta/activities/03-dispatch-client-workflow.yaml:13-22` — writes `client_workflow_completed` ("Whether the client workflow walk ended with no further activity routed") and `current_activity` ("null once the client graph routes to none"); `:25-33` runs `activity-loop`; `:34-40` sets `client_workflow_completed: true` `when: current_activity == null`; `:41-43` exit `"null"` `when: current_activity == null`. Nothing reads server status.
- `C:meta/activities/04-end-workflow.yaml:26` gates on `client_workflow_completed == true`.

Traced behaviour:
- `__terminal__` graph: worker returns `next_activity_id: "__terminal__"` -> loop continues -> continue-batch or dispatch-activity calls `next_activity { activity_id: "__terminal__", ... }` (session DOES complete there) -> then continues/spawns a worker for `__terminal__`, whose `get_activity` is refused (above); `current_activity` stays `"__terminal__"`, so the loop does not end cleanly and 03 never sets `client_workflow_completed`.
- Exitless end: `next_activity_id` null -> loop exits -> no next_activity from the last activity -> session `active`, last activity still in flight.

---

## 2. Fan entry

### Engine

**`_meta.fan`** — `WT:1645`: `if (fanEnter !== undefined) meta['fan'] = fanEnter.report;`. Report type `WT:1073-1074`:
```ts
report: Array<{ activity: string; variable?: string; over?: string; branches: string[] }>;
```
- Bare/static member: `{ activity: m, branches: [m] }` (`WT:1094-1100`).
- Instance fan: `{ activity, variable, over, branches: ["<activity>#0", ...] }` (`WT:1153-1160`; `INSTANCE_SEPARATOR = '#'`, `workflow-loader.ts:472`).
- Static list `[a, b]` => `[{activity:"a",branches:["a"]},{activity:"b",branches:["b"]}]`; instance fan over 3 => `[{activity:"probe-unit",variable:"probe_target",over:"probe_targets",branches:["probe-unit#0","probe-unit#1","probe-unit#2"]}]`; mixed => one entry per member.

**`outstanding`** (response body) — `WT:1681-1686`: on the fan-open call `entering` is true, so `outstanding` appears only when `entered.length > 1`. Its value is `next.frontier`: flattened, instance-qualified branch ids. Edge: an instance fan over a ONE-element collection returns `name`, not `outstanding` (the comment at `WT:1676-1680` says the opening call is always branches; the code does not check `fanEnter`). `_meta.fan[].branches` is present in every case.
- Body `activity_id` on open = `destinationField(destination)` = flattened BASE ids, e.g. `["probe-unit"]` (`E:src/schema/workflow.schema.ts:95-96`) — not addressable ids.

**`_meta.barrier`** — `WT:1637-1643`:
```ts
if (openFan !== undefined || fanEnter !== undefined || next.frontier.length > 1) {
  meta['barrier'] = {
    destination: openFan?.join ?? (entering && !fanEnter ? targets[0] : undefined),
    pending: next.frontier,
    met: entering,
  };
}
```
- `openFan` = the fan whose branches include the RETIRING activity (`WT:1307`). On the fan-OPEN call the retiring activity is the source, not a branch, so `openFan` is undefined; `fanEnter` is defined => `destination` is `undefined` (dropped from JSON). The opening call reports `{ pending: [branch ids], met: true }` — no destination, and `met: true`.
- On each branch retirement: `{ destination: <join>, pending: <remaining>, met: <frontier emptied> }`.
- No test asserts `_meta.barrier` (grep of `E:tests`); `E:tests/batch-loop-walk.test.ts:93-99` stubs `enter-fan` to set `fan_convergence_activity = 'gather'` itself.
- **Additional defect beyond the issue**: `enter-fan` reads `_meta.barrier.destination` as `{barrier_destination}` on the opening call, which the engine never supplies there. `advance-past-fan` (`when: fan_convergence_activity`) then never fires and `retire-branch` passes an unset `activity_id` (required by `DestinationSchema`, `WT:1226`). The join is derivable from each branch envelope's `next_activity_id` (every branch exit names the join, enforced at load via `fanGroups().join`, `workflow-loader.ts:583-605`), or from the first retirement's `_meta.barrier.destination`.

**Ids each branch must use** —
- `from_activity` on retirement: the frontier entry verbatim, e.g. `probe-unit#1` (`WT:1229-1230`; exact match in `resolveRetiringActivity`, `WT:1006-1022`). `from_activity` is `z.string()` — an object fails schema validation before the handler.
- `get_activity { activity_id }`: same entry (`WT:1709-1710`), required while several are in flight (`resolver.ts:167-170`), with a distinct `agent_id` per branch (`fanIdentityRefusal`, `WT:1727-1728`).
- Retirement `activity_id` must be the join: T9 refuses anything else (`WT:1304-1316`).

**Tests reading the branch ids**
- `E:tests/e2e/fan-walk.test.ts:96-97`:
  ```ts
  const fan = (opened._meta as { fan?: Array<{ branches: string[] }> } | undefined)?.fan;
  expect(fan?.flatMap((member) => member.branches)).toEqual(['probe-unit#0', 'probe-unit#1']);
  ```
  (the open call at `:86-95` also passes `variables_changed: { probe_targets: [...] }`, proving the enter reads this call's writes).
- `E:tests/e2e/walker.ts:419-426` — `const branches = (meta?.fan ?? []).flatMap((member) => member.branches);`
- `E:tests/fan-outstanding-ids.test.ts:51-62` — open returns `outstanding: ['probe-unit#0','probe-unit#1','probe-unit#2']`, no `name`; `:66-103` retirements report shrinking `outstanding`, converging call returns `name`; `:106-156` mixed fan.

### Corpus text

- `C:meta/techniques/fan/enter-fan.md:38-44` — outputs `branch_activities` ("The branches the destination opened, in the order the server gave them.") and `barrier_destination` ("as the barrier reported it").
- `enter-fan.md:55` — "Call `next_activity { session_index, activity_id: fan_destination, from_activity, exit: exit_id, step_manifest }`; ... read `_meta.fan` as `{branch_activities}` and `_meta.barrier.destination` as `{barrier_destination}`." (no `variables_changed`).
- `C:meta/techniques/fan/spawn-branches.md:34` — "For each entry of `{branch_activities}`, mint an identity ... adding that entry as `activity_id` ..." (one worker per REPORT entry => one per member, not per instance).
- `C:meta/techniques/fan/retire-branch.md:32` — "Call `next_activity { session_index, activity_id: barrier_destination, from_activity: branch_activity, exit, step_manifest, variables_changed, artifacts_produced }`, taking every field after the destination from that entry". Envelope field names are `activity_exit` and `steps_completed` (`finalize-activity.md:42-72`), not `exit`/`step_manifest`.
- `retire-branch.md:34` — "The call reports what is still outstanding at `outstanding`, each branch as the id that addresses it."
- `C:meta/routines/activity-loop.yaml:87-97` — `enter-fan` binds `fan_destination: current_activity`, `exit_id: "{worker_result.activity_exit}"`, `session_index`; output `barrier_destination: fan_convergence_activity`. No `step_manifest`, no `variables_changed`.
- `activity-loop.yaml:98-108` — `spawn-branches` binds `branch_activities: branch_activities`.
- `activity-loop.yaml:109-130` — `branch-retirement` forEach `current_branch` over `branch_activities`; `retire-branch` binds `branch_activity: current_branch`, `barrier_destination: fan_convergence_activity`.
- `activity-loop.yaml:138-157` — `advance-past-fan` / `retire-fan-envelope` gated `when: fan_convergence_activity`.
- `C:meta/techniques/fan/TECHNIQUE.md:26-32` — `the-barrier-is-a-reading`, `retire-in-the-order-the-branches-opened`.

---

## 3. Advance arguments

### Engine

**`variables_changed`** — schema `WT:115-120` ("relay the worker's `activity_complete` `variables_changed` map verbatim ... Omit when the activity changed nothing.").
- Written into the bag at `WT:1430-1450` via `applyVariableWrites` (`E:src/utils/variable-seed.ts:83-139`): one `variable_set` event per name; declared type and value-set mismatches are warn-only and stored as written. A retiring fan branch's map lands whole in its slot `<activity_snake>_outputs[i].result` (`branchLanding`, `WT:1216-1221`; `variable-seed.ts:108-137`), validated against that activity's own `writes` (`WT:1441-1443`).
- Also overlaid onto the bag the fan enter reads (`WT:1368-1373`), so the source can seed its own fan's collection on the opening call.
- Absent: nothing is written. Bag holds only seeded defaults + checkpoint `setVariable`. An instance fan over a collection with no default is refused by `openFanBranches` (`WT:1104-1108`): "`'<over>' is not in the variable bag. A fan reads its collection out of the bag, so the activity before the fan writes it.`"

**`step_manifest`** — schema `WT:84-87` (`[{step_id, output}]`, one entry per step per iteration; "Omit entirely when no steps ran").
- Present: advisory `validateStepManifest` (`E:src/utils/validation.ts:115-200`: missing/unexpected steps, order, empty output, output keys the technique does not declare) and `validateTechniqueFetches` (`WT:1320-1347`); one `step_completed` history event per non-empty entry (`WT:1452-1465`).
- Absent: warning `"No step_manifest provided for previous activity '<id>'. Include a manifest to enable step completion validation."` (`WT:1348-1350`). Never refused.

**`exit`** — absent means the destination is the caller's `activity_id` (`WT:1282-1285`), `validateReportedExit` is skipped (`WT:1352-1357`), `draft.exit = ''` (`WT:1483`); refused only off an activity with a fan-bound exit (`WT:1295-1302`).

### Corpus: envelope

- `C:meta/techniques/workflow-engine/finalize-activity.md:50-52` — envelope field `variables_changed`: "state variables the activity mutated, reported by the worker"; `:82` "Populate the envelope's `variables_changed` map with every bag key this activity mutated — declared step outputs landed per variable-binding (including remapped output names), plus any checkpoint `setVariable` effects already applied."
- Envelope also carries `steps_completed` (`:42-44`), `artifacts_produced` (`:54-56`), `activity_exit` (`:70-72`), `next_activity_id`, `next_activity_fans`, `batch_may_continue`.
- `C:meta/techniques/workflow-engine/TECHNIQUE.md:58-60` — `variable-mutation-source` names worker `activity_complete` `variables_changed` as a sanctioned source.

### Corpus: callers of next_activity

| Technique | Call (file:line) | Declares (own) | Inherited from `workflow-engine/TECHNIQUE.md:10-30` |
|---|---|---|---|
| dispatch-activity | `dispatch-activity.md:48` `{ session_index, activity_id, from_activity, exit: exit_id, step_manifest }` | `from_activity`, `agent_technique`, `planning_folder_path` (`:10-22`) | `session_index`, `activity_id`, `exit_id`, `step_manifest`, `variable_bag` |
| continue-batch | `continue-batch.md:34` `{ session_index, activity_id, from_activity, exit: exit_id, step_manifest, agent_id: worker_agent_id }` | `from_activity`, `worker_agent_id` (`:10-18`) | same |
| take-activity | `take-activity.md:30` `{ session_index, activity_id, from_activity, exit: exit_id, step_manifest }` | `from_activity`, `agent_technique` (`:10-18`) | same |
| enter-fan | `enter-fan.md:55` `{ session_index, activity_id: fan_destination, from_activity, exit: exit_id, step_manifest }` | `session_index`, `fan_destination`, `from_activity`, `exit_id`, `step_manifest`, `planning_folder_path` (`:10-34`) | (fan/TECHNIQUE.md declares no inputs) |
| retire-branch | `retire-branch.md:32` includes `variables_changed`, `artifacts_produced` | `session_index`, `barrier_destination`, `branch_activity`, `branch_envelopes` | — |

- `step_manifest` and `exit_id` ARE declared: contract-inherited for workflow-engine techniques (`TECHNIQUE.md:20-26`; engine delivers them as `inherited_inputs`, `E:src/schema/technique.schema.ts:85-89`) and own-declared in enter-fan (`enter-fan.md:24-30`). The issue's "pass it without declaring it" is not accurate at this head; the real gap is the binding.
- `variables_changed` is declared nowhere (own or inherited) and passed by none of the four advance techniques; only `retire-branch` passes it.
- `artifacts_produced` likewise passed only by `retire-branch`.

### Corpus: what activity-loop binds

- `continue-batched-worker` (`activity-loop.yaml:65-76`): `activity_id: "{worker_result.next_activity_id}"`, `exit_id: "{worker_result.activity_exit}"`, `session_index`, `worker_agent_id`, `step_manifest: "{worker_result.steps_completed}"`, `variable_bag: variables`. No `variables_changed`.
- `enter-activity` (`:77-86`): `activity_id: current_activity`, `session_index`, `agent_technique`, `variable_bag`. **No `exit_id`, no `step_manifest`**, no `variables_changed`. Unbound inputs resolve by bag name (`:203-205` comment: "Each operation's `from_activity` input resolves to this target by name"); the loop defines no `exit_id` / `step_manifest` name (inputs `:9-27`, outputs `:29-35`, internals `:37-39`), so both arrive unset.
- `enter-fan` (`:87-97`): `exit_id` bound; no `step_manifest`, no `variables_changed`.
- Effect: every advance made by dispatch-activity/take-activity carries no exit and no manifest (engine warns, records no `step_completed`, skips exit check); no advance except a branch retirement carries worker outputs.
- `fan-conformance` depends on it: `survey_plan` (`specimens/fan-conformance/activities/01-plan-conformance.yaml:16-18`) and `probe_targets` (`04-choose-probes.yaml:14-17`) have no defaultValue, so both fans are refused "not in the variable bag" unless the opening advance carries `variables_changed`. `note_targets` defaults to `[]` (`07-open-notes.yaml:14-17`).

---

## 4. Exitless options (workflow-design)

Graph `C:workflow-design/workflow.yaml:43-70`:
```yaml
  intake-and-context:
    review-scope-confirmed: quality-review
    context-established: requirements-refinement
  ...
  scope-and-draft:
    done: quality-review
    redraft: scope-and-draft
```
(`:44-46`, `:56-58`). `intake-and-context` has no self-loop exit.

### 06-scope-and-draft — `revise`

`C:workflow-design/activities/06-scope-and-draft.yaml:135-149`:
```yaml
  - kind: checkpoint
    id: scope-and-structure-confirmed
    message: "Complete file manifest, structural design, and drafting order ([scope manifest]({scope_manifest_path}))."
    defaultOption: confirmed
    autoAdvanceMs: 30000
    options:
      - id: confirmed
        label: Yes, scope and structure are correct
        description: File manifest and implementation order are accurate.
        effect:
          setVariable:
            scope_manifest_confirmed: true
      - id: revise
        label: Needs revision
        description: File manifest or implementation order requires adjustment.
```
Exits `:484-488`: `done` (`isDefault: true`), `redraft` (`immediate: true`).
- On `revise`: no effect; `scope_manifest_confirmed` stays false, so `file-drafting-loop` (`:160-167`, `when: scope_manifest_confirmed == true`) is skipped, remaining steps run, default `done` -> `quality-review` with nothing drafted.
- Label implies: re-scope — `redraft` (self-loop to `scope-and-draft`, immediate) re-runs `scope-definition`.
- Siblings in this activity: `confirmed` routes by default `done`; every other revise-style option carries `effect.exit: redraft` — `pre-attestation-blocker.redraft` (`:428-432`), `draft-attestation.revise-block` (`:450-454`), `batch-review-attested.revise-specific` / `revise-block` / `redraft-all` (`:469-483`).

### 01-intake-and-context — `wrong-review-target`

`C:workflow-design/activities/01-intake-and-context.yaml:79-131` (checkpoint `design-intent-batch`, condition `intent_needs_confirmation == true && update_seeded_from_review != true`), option at `:117-123`:
```yaml
      - id: wrong-review-target
        label: Wrong review target set
        description: Rejects the review target set; supply a corrected `target_workflow_ids` list.
        effect:
          setVariable:
            review_scope_confirmed: false
            intent_needs_confirmation: true
```
Exits `:229-234`:
```yaml
exits:
  - id: review-scope-confirmed
    when: operation_type == "review" && review_scope_confirmed == true
  - id: context-established
    when: format_literacy_confirmed == true && schema_constructs_confirmed == true
    isDefault: true
```
- On `wrong-review-target` (review mode): `announce-certain-review-scope` skipped (`:146-154`, needs `intent_needs_confirmation == false`); `auto-confirm-literacy` skipped (`:212-221`, `operation_type != 'review'`); neither `when` holds -> default `context-established` -> `requirements-refinement` with a review run.
- Label implies: re-ask for the target set — re-enter `intake-and-context` (needs a new self-loop exit + graph edge), or end the run.
- Siblings: no option in `design-intent-batch` carries an exit; all route by `setVariable` + exit `when`. `confirm-intent` (`:94-100`, sets `review_scope_confirmed: true`) -> `review-scope-confirmed` -> `quality-review` in review mode; `confirm-create`, `confirm-update`, `cancel-as-create` (`:101-116`, `:124-131`) -> `context-established` -> `requirements-refinement`.

---

## Specimens (`C:specimens/`)

- `mvw` — 1 activity `dispatch` (`activities/01-dispatch.yaml`, one routine step `record-dispatch`, exit `dispatched` isDefault); graph `dispatch.dispatched: __terminal__` (`workflow.yaml:14-16`). Terminal graph, no fan, no checkpoint.
- `fan-conformance` — 10 activities; `workflow.yaml:25-58`: `plan-conformance.planned` -> mixed list fan `[survey-files, survey-history, {activity: survey-tree, over: survey_plan.roots, variable: survey_root, maxInstances: 2}]` -> join `choose-probes`; `choose-probes.chosen` -> instance fan `probe-directory` over `probe_targets` -> join `open-notes`; `open-notes.opened` -> instance fan `note-probe` over `note_targets` (own checkouts) -> `merge-notes`, or `nothing-to-note` -> `report-conformance`; `report-conformance.reported: __terminal__`. Covers static, instance, mixed, dotted `over`, gated route past a fan, terminal end.
- `routine-conformance` — linear `plan-probes -> count-pass -> size-pass -> report-conformance -> __terminal__` (`workflow.yaml:25-33`).
- `contract-composition` — `pair.paired: __terminal__`; `readme-links-conformance` — `seed-links.seeded: __terminal__`; `namespace-conformance` — `reach-by-name -> reach-by-path.reached: __terminal__`; `git-pin-conformance`, `github-library-conformance`, and 22 `gitnexus-*-conformance` specimens — linear, each ending `report-*.reported`/`*.reached: __terminal__`. `shared-probe` holds techniques only.
- No specimen ends on an exitless activity; that shape is covered only by corpus workflows (prism, workflow-design, codebase-wiki, ...) and the engine fixture `E:tests/fixtures/variable-model/child-fixture`.
- Engine fan fixtures: `E:tests/fixtures/fan-corpus/` (`instance-fan-fixture`: `scope-sweep.scoped` -> instance fan `probe-unit` over `probe_targets` -> `combine-probes.settled: __terminal__`; also list, mixed, dotted, gather, collision fixtures).

## Sidecar

- Reload script: `E:tests/scripts/reload-exp-sidecar.sh` (stops the named container, compiles the engine checkout, rebuilds image only on dependency/Dockerfile drift, restarts on the same host port and corpus with `dist` and `schemas` bound; refuses name `workflow-server` and port 3000). Test: `E:tests/reload-exp-sidecar.test.ts`. Skill `server-in-the-loop` drives it (port 32772).
- Both `workflow-server` and `workflow-server-exp` MCP servers were unreachable (ECONNREFUSED) this session.
