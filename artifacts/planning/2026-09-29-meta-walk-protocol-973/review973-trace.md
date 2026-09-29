# Protocol trace — corpus PR #991 against engine PR #978

Trees:
- `C:` = `.worktrees/meta-walk-protocol/corpus` at `f093a318`.
- `E:` = `.worktrees/fan-barrier-destination` at `3807a6c2`.
- `WT` = `E:src/tools/workflow-tools.ts`.
- `AL` = `C:meta/routines/activity-loop.yaml`.

Method: I walked AL step by step as a literal orchestrator would, with each bound technique, and checked every `next_activity` / `get_activity` / checkpoint call against its handler.
- A routine body is spliced at load (`E:src/loaders/routine-resolver.ts:612-681`).
- Internals are renamed per site (`:568-571`).
- Unbound inputs, and undeclared names (`worker_result`, `worker_agent_id`, `branch_activities`, `user_selection`, `checkpoint_reply`), fall through to the host bag under their own spelling (`:648-650`).
- Technique inputs a step does not bind (`from_activity`, `planning_folder_path`) are resolved by name at run time, against the host bag.

## Path-by-path

| # | Path | Calls as bound | Engine | Proceeds as claimed |
|---|---|---|---|---|
| 1 | First dispatch of a walk | Iteration 1: `continue-batched-worker` is skipped (`worker_agent_id` unset). `enter-activity` → dispatch-activity `next_activity { session_index, activity_id: initial }`. `exit_id`, `step_manifest` and `variables_changed` come from the unset `worker_result`, and `from_activity` is unset. | Unnamed retirement with an empty frontier is the first call (`WT:1023`). The initial activity is pushed (`WT:1517-1521`). `name` is returned. | **Yes**, on a session that has entered nothing. It is refused when the session already stands on its activity (F3), or when the host bag holds a `from_activity` from an earlier walk at the same site (F2). |
| 2 | Batch continuation | Iteration N: `commit` → `note-exiting` (`from_activity=A`) → `advance-activity` (`current=B`). Release is skipped, because `batch_may_continue` holds, the destination is not terminal, and it does not fan. Iteration N+1: `continue-batched-worker` → `next_activity { activity_id: B, from_activity: A, exit, step_manifest, variables_changed, agent_id }`. | `A` is in the frontier (`WT:1008-1009`). The graph binding wins (`WT:1282-1285`). The writes land in the bag (`WT:1430-1450`) and `step_completed` is recorded (`WT:1452-1465`). | **Yes.** The continue gate (AL:69) and the release gate (AL:247) are exact complements on one `activity_complete` envelope. |
| 3a | Checkpoint yield, respond, resume, clear | The worker returns `checkpoint_pending`. The entry steps are skipped (`worker_agent_id` set). `present-checkpoint-to-user` → `user_selection` → `respond-checkpoint { checkpoint_resolution: user_selection }` → `checkpoint_reply` → `resume-worker { activity_id: current, worker_agent_id, checkpoint_reply }` → `clear-checkpoint-reply`. If the resumed envelope is `activity_complete`, the same iteration commits, notes and advances. A second `checkpoint_pending` is answered on the next iteration with no advance. | `respond_checkpoint` clears the gate and applies `setVariable` (`WT:2860-2901`). `resume_checkpoint` reports the effect and the exit (`WT:2643-2690`). `next_activity` is refused while a gate is held (`WT:1258-1264`), and the loop never advances then. | **Yes.** |
| 3b | Checkpoint whose exit ends the activity | As 3a. The reply carries `exit.ends_activity`. The worker stops, and finalize sets `selected_exit`. evaluate-transition step 1 gives `activity_exit=<exit>` and `next_activity_id=<binding>`. `retarget` and `redraft` are immediate self-loops. | The self-loop re-enters the same activity (`WT:1517-1521`), and `forgetEarlierVisitAnswers` clears the earlier answers. `retarget` is bound (`C:workflow-design/workflow.yaml:47`). Three exits with one default passes `validateExitBindings` (`E:src/loaders/workflow-loader.ts:647-652`). | **Yes.** |
| 4a | Plain activity → `__terminal__` by a terminal exit | Iteration N: `advance-activity` sets `current="__terminal__"`. `release-spent-worker` fires (AL:247). Iteration N+1: `enter-activity` → dispatch-activity phase 1 is skipped (terminal). Phase 2: `next_activity { activity_id: "__terminal__", from_activity: A, exit, step_manifest, variables_changed }`, which returns `workflow_complete`. Then `end-walk` sets `current=null`, and the loop condition fails. | The bound destination is `__terminal__`. Nothing is pushed. `workflow_completed` is recorded and `status=completed` (`WT:1533-1543`). The launched record is closed (`WT:1552`). The body is `{activity_id:"__terminal__", name:"Workflow Complete"}`. | **Yes.** No worker is minted. `worker_agent_id` stays null. |
| 4b | Exitless activity → `__terminal__` | evaluate-transition step 5 (`evaluate-transition.md:58`) gives `next_activity_id="__terminal__"` with `activity_exit` unset. The rest is as 4a, and `exit` is omitted (or empty). | No binding exists, so `destination = activity_id` (`WT:1282-1285`). T2 does not fire, because no exit fans (`WT:1295-1302`). The validator accepts `__terminal__` from anywhere. | **Yes** (`exitless-end`). |
| 5 | Batch path reaching `__terminal__` | The continue gate refuses `next_activity_id == "__terminal__"` (AL:69). The release fires (AL:247). The next iteration runs as 4a, with `agent_id` omitted. | As 4a. `_meta.batch` is suppressed when terminal (`WT:1620`). | **Yes.** |
| 6a | Static fan `[a,b]` | Iteration N: the source returns `fans:true`. It commits, notes `from=S`, and advances `current=[a,b]`. The release fires. Iteration N+1: `enter-activity` is skipped (fans). `enter-fan` → `next_activity { activity_id: [a,b], from_activity: S, exit, step_manifest, variables_changed }`. `branch_activities` is the flat map of `_meta.fan[].branches`, which is `[a,b]`. `barrier_destination` is `_meta.barrier.destination`, which is `J`. `spawn-branches` then gives one identity per entry. Each worker calls `get_activity { activity_id: a }`. `retire-branch`, in order, calls `next_activity { activity_id: J, from_activity: a, exit: <activity_exit>, step_manifest: <steps_completed>, variables_changed, artifacts_produced }`. | `openFanBranches` reports `[{activity:a,branches:[a]},{activity:b,branches:[b]}]` (`WT:1094-1100`). On the open call the barrier is `{destination: J (enteredFan, WT:1639-1642), pending:[a,b], met:false}`. T9 passes, because every branch names J (`WT:1307-1316`). The last retirement pushes J. | **Yes** on the corpus side. The branches and the join exist only in `_meta` (F1). |
| 6b | Instance fan over N ≥ 2 | As 6a. The report is `[{activity:p, variable, over, branches:[p#0..]}]` (`WT:1153-1160`). The collection comes from the overlay of this call's `variables_changed` (`WT:1368-1373`). | An absent collection is refused (`WT:1104-1108`). With the overlay carried it is accepted. | **Yes.** |
| 6c | Mixed fan | As 6a. There is one report entry per member, concatenated as `[survey-files, survey-history, survey-tree#0, survey-tree#1]`. The frontier is pushed in the same order (`WT:1503-1506`). | The dotted `over` is read (`WT:1053-1058`). | **Yes.** |
| 6d | Instance fan over a 1-element collection | As 6b. enter-fan reads `_meta.fan` and `_meta.barrier`, never the body. | `entering` is true and the frontier has length 1, so the body carries `name` and no `outstanding` (`WT:1684-1689`). `getActivity` strips `#0` (`workflow-loader.ts:460-463`), so `name` is the activity's own name, not "Workflow Complete". `_meta.fan` and `_meta.barrier {destination:J, pending:[p#0], met:false}` are present, because `fanEnter` is defined (`WT:1638`). | **Yes**, through `_meta`. The body names neither `p#0` nor J (F1). The note on retire-branch is inaccurate here (F7). |
| 7 | Join that is itself a fan source | After fan 1, `advance-past-fan` sets `current=J` and `activity_entered=true`, and `retire-fan-envelope` nulls `worker_result`. Next iteration: J is dispatched without an advance, and its worker returns `fans:true`. `spend-entered` → false. `enter-fan` is skipped, because `worker_agent_id` is set. J commits, notes `from=J`, and advances `current=<fan2>`. The release fires. Next iteration: `enter-fan { from_activity: J, exit }`. | J is the frontier's sole entry. `openFan` is undefined (J is a join, not a branch). `enteredFan` matches `(J, exit)`. The join may be a source: only L8 (terminal) and L15 (join equal to source) are refused (`workflow-loader.ts:877-889`). | **Yes.** |
| 8 | Join dispatch with `activity_entered`, then the advance after it | Iteration F+1: `enter-activity { activity_id: J, activity_entered: true, exit_id/step_manifest/variables_changed from the null worker_result }`. dispatch-activity skips phase 2 (`dispatch-activity.md:55`), then composes and spawns. The worker calls `get_activity` (one entry in flight, J). `spend-entered-activity` clears the flag in the same iteration (AL:94-101). J's exit is then an ordinary advance: `from_activity: J`, with no barrier block. | A second advance off the retired branch would be refused (`WT:1006-1021`). It is not made. J's own retirement: `openFan` is undefined, the frontier has length 1, so `_meta.barrier` is absent. | **Yes.** |
| 9 | `take-activity` as `enter_activity` | `worker_agent_id` is never set, so `continue-batched-worker` never fires and every entry is `enter-activity`. take-activity `next_activity {…}` is the same call as dispatch (`take-activity.md:34`). On `__terminal__` it holds `workflow_complete` and ends (`:36`). With `activity_entered` it skips the advance (`:37`). Then `get_activity { session_index, context_tokens }` (`:41`). | Same as the dispatch rows. `closeLaunchedRecord` closes the parent's launch record on `__terminal__` (`WT:1552`). | **Yes** on a single walk. A second walk at one site is refused (F2). The checkpoint branch has no carrier (F4). |
| 10 | meta 03 walks a client | `client-activity-loop` binds `session_index: client_session_index` and `initial_activity: client_initial_activity`, and maps `current_activity` and `from_activity` out. The walk ends via `end-walk` (`current_activity=null`). `record-client-completion` (`when: current_activity == null`) sets `client_workflow_completed=true`. Exit `"null"` → end-workflow, whose `revise-session-metrics` gates on it. | The client session reads `completed` after the terminal advance. `dispatch_child`/`start_session` enter nothing (`E:src/tools/resource-tools.ts:711-735`). | **Yes** on the first walk. A `return` re-walk passes the stale `from_activity` (F2). A walk that stops at `maxIterations` selects no exit (F5). |
| 11 | handle-sub-workflow | Does not drive the loop. It only calls `dispatch_child`. The host activity's routine step drives it through `take-activity`: prism-audit 02 (`:89-97`), prism-evaluate 02 (`:104-112`), work-package 10 (`:207-216`). | The child starts with an empty frontier, so the first entry is valid. | **Yes.** See rows 9 and F2. |

## Binding and ordering checks

- **Bindings added by the diff resolve:**
  - `activity_entered` is a declared internal (AL:40-41). It is renamed per site, as the snapshot shows (`post_impl_review_walk_prism_child_activity_entered`).
  - `activity_entered` as an input is declared by dispatch-activity (`:15-17`) and take-activity (`:17-19`).
  - `variables_changed` as an input is declared on the workflow-engine container (`TECHNIQUE.md:28-30`) and by enter-fan (`:31-33`).
  - `exit_id` and `step_manifest` are container inputs.
- **Pre-existing undeclared names:** the body still reads `worker_result`, `worker_agent_id`, `variables`, `branch_activities`, `branch_envelopes`, `trace_tokens`, `user_selection` and `checkpoint_reply`. None of them is an input, output or internal, although `routine.schema.ts:1-7` says every such name is declared. They fall through to the host bag. That is what lets them persist across walks (F2).
- **Declared input no step binds:** `planning_folder_path` (F6).
- **Read before set:**
  - On the first iteration, `worker_result`, `fan_convergence_activity`, `checkpoint_reply` and `activity_entered` are read unset. All are falsy where they gate, and optional where they are bound.
  - `from_activity` is read unset only on a walk's first run at a site. On a later run at that site it holds the previous walk's last activity (F2).
  - Nothing else is read before it is set.
- **`activity_entered` cannot leak:**
  - It is set true only in `advance-past-fan`.
  - The next iteration always runs `enter-activity`: `worker_agent_id` was released on the source's fanning envelope, and nothing in the fan steps sets it. `worker_result` is null.
  - `spend-entered-activity` clears the flag in that iteration, after the entry.
  - The join is never `__terminal__` (L8), so the two phase-2 bullets of dispatch-activity (terminal, and entered) never both apply.
  - At the end of every walk the flag is false.
- **Correction to the fact sheet:** a one-element instance fan's body `name` is the activity's name, not "Workflow Complete", because `getActivity` resolves the base id.

## Findings

### F1 — Fan branches and join are readable only from `_meta` (Live, High)

- **Entry:** Live breakage, fan entry.
- **Where:**
  - `C:meta/techniques/fan/enter-fan.md:59`.
  - `WT:1638-1648` (where `_meta` is written).
  - `WT:1685-1691` (the body).
- **Evidence:**
  - enter-fan says: "read `{branch_activities}` from `_meta.fan` and `{barrier_destination}` from `_meta.barrier.destination`".
  - The body the handler returns is only `{ activity_id: destinationField(destination), outstanding | name, session_index }`.
  - PR #991 itself says: "The client in use does not surface `_meta`, so the barrier's `destination` is evidenced by #978's e2e test."
- **Effect:**
  - On that client, a literal orchestrator cannot produce either output of enter-fan. The join fix in #978 is unobservable there.
  - Over N ≥ 2, `outstanding` recovers the branch ids but never the join.
  - Over one element (6d), the body carries `name` and a base-id `activity_id`, and nothing names `p#0`.
  - The live walk proceeded by improvisation, not by following enter-fan.
- **Origin:** pre-existing. Base enter-fan already read `_meta.fan` and `_meta.barrier`. The diff makes the join depend on the same channel.
- **Fix:** mirror `fan` and `barrier` into the `next_activity` body, as `get_activity` mirrors `exit_destinations` into its header (`WT:1705`).

### F2 — A second walk at one routine site starts with a stale `from_activity` (Live, Medium)

- **Where:**
  - `AL:50-55`, where prime resets only `current_activity`.
  - `AL:228-237`.
  - `C:prism-audit/activities/02-execute-analysis.yaml:70-97` (the forEach `scope-iteration` over the child walk).
  - `C:prism-evaluate/activities/02-execute-analysis.yaml:85-112`.
  - meta `end-workflow.return` → `dispatch-client-workflow` (`C:meta/workflow.yaml:28-29`).
- **Evidence:**
  - `note-exiting-activity` sets the host `from_activity` to the last activity before the advance onto `__terminal__`.
  - The next walk's first entry resolves `from_activity` by name, which gives that value.
  - take-activity's note "A first entry has no prior activity to retire, so `{from_activity}` … are all unset together" (`take-activity.md:35`) describes the state rather than instructing it, and the bag holds a value.
- **Engine:** `resolveRetiringActivity` refuses with "Cannot exit '<last>': the session is not on it. In flight: (nothing)." (`WT:1007-1021`).
- **Effect:**
  - The second prism child of prism-audit and prism-evaluate never enters its first activity.
  - The meta `return` re-walk fails the same way, on a session that is already completed.
- **Origin:** pre-existing. The base loop set `from_activity` identically.
- **Fix:** have `prime-initial-activity` also set `from_activity: null` and `worker_result: null`, or make both internals.

### F3 — A walk opened on a session already standing on its activity re-advances (Live, Medium)

- **Where:**
  - `C:meta/techniques/workflow-engine/workflow-orchestrator.md:29`.
  - `C:meta/resources/bootstrap-protocol.md:26-28`.
  - `AL:37-41`.
- **Evidence:**
  - The orchestrator opens "with the activity `in_flight` names". The bootstrap's client-open path calls `next_activity { activity_id: initialActivity }` itself before the loop.
  - The loop's first entry then calls `next_activity` with no `from_activity`.
- **Engine:** "Cannot advance: '<X>' is in flight. Pass from_activity naming the activity this call is returning." (`WT:1033-1035`).
- **Why the new flag does not help:** `activity_entered` is an internal, so no caller can seed it for this case.
- **Origin:** pre-existing. It lies outside the diff but on path 1.
- **Fix:** make `activity_entered` a routine input (default false) that the orchestrator binds true when resuming from `in_flight`. Drop the bootstrap's own `next_activity`.

### F4 — `take-activity` with a checkpoint has no carrier to resume (Contract, Low)

- **Where:** `AL:202-212`, and `resume-worker.md:38,47`.
- **Evidence:**
  - `resume-yielded-worker` binds `worker_agent_id`, which take-activity never sets.
  - resume-worker continues "the agent carrying `{worker_agent_id}`", or spawns a replacement. Inside a take-activity context neither exists (`handle-sub-workflow.md:44`, depth-1).
  - prism `select-mode.confirm-mode` is the reachable gate. It is conditional on `pipeline_mode notExists`.
- **Origin:** pre-existing.
- **Fix:** resume-worker under `take-activity` continues in place. Alternatively, gate `resume-yielded-worker` on `worker_agent_id` and add an in-place resume step.

### F5 — evaluate-transition step 5 now routes "no exit selected" to `__terminal__` (Contract, Low)

- **Where:**
  - `C:meta/techniques/workflow-engine/evaluate-transition.md:58`.
  - `C:meta/activities/03-dispatch-client-workflow.yaml:41-43,49`.
- **Evidence:**
  - Step 5 reads: "Where no exit was taken — the activity declares none — set `{next_activity_id}` to `__terminal__`".
  - meta 03 declares one conditional exit (`"null"`, `when: current_activity == null`) and no default. The loader requires a default only when there are more than one exit (`workflow-loader.ts:647-652`).
  - A loop stopped at `maxIterations` selects nothing. Read literally, that ends the meta run without end-workflow, although 03's outcome promises that close-out tells an iteration-bound stop apart.
- **Origin:** diff. The consequence changed from null to `__terminal__`.
- **Fix:** restrict step 5 to an activity with no `exits[]`. Give 03 a default exit to end-workflow.

### F6 — The routine input `planning_folder_path` never reaches a technique (Contract, Medium)

- **Where:**
  - `AL:18-19`. No body step binds it.
  - The sites that bind it, `planning_folder_path: child_planning_folder_path`: prism-audit 02 `:94`, prism-evaluate 02 `:109`, work-package 10 `:212`.
- **Evidence:** substitution rewrites body strings only (`routine-resolver.ts:458-531`). dispatch-activity, enter-fan and commit-and-persist resolve `planning_folder_path` by name, so they get the host's folder.
- **Effect:** a child walk's Progress marks and commits target the parent's planning folder.
- **Origin:** pre-existing.
- **Fix:** bind `planning_folder_path: planning_folder_path` on `enter-activity`, `enter-fan`, `persist-the-fan` and `commit-activity-artifacts`.

### F7 — retire-branch's `outstanding` note is false in two cases (Hygiene, Low)

- **Where:** `C:meta/techniques/fan/retire-branch.md:33`.
- **Evidence:** the note says "The call reports what is still outstanding at `outstanding`". The retirement that empties the frontier returns `name` (`WT:1684-1689`), and so does the one retirement of a one-element fan.
- **Origin:** pre-existing.
- **Fix:** say the last retirement carries `name`, or drop the sentence. Nothing binds it.

### F8 — The completed state after the terminal advance is never committed (Contract, Low)

- **Where:** `AL:221-227`, and `C:meta/activities/04-end-workflow.yaml` (outcome "final state is durably preserved").
- **Evidence:**
  - `commit-activity-artifacts` runs before the advance onto `__terminal__`.
  - The advance rewrites `session.json` (`status: completed`).
  - No step after it commits, and end-workflow binds no commit.
- **Origin:** pre-existing for terminal graphs. The diff extends it to exitless graphs.
- **Fix:** add a commit-and-persist of the session record after `end-walk`, or in end-workflow.

## Counts

| Band | diff | pre-existing |
|---|---|---|
| Live | 0 | 3 (F1 High, F2, F3) |
| Contract | 1 (F5) | 3 (F4, F6, F8) |
| Hygiene | 0 | 1 (F7) |

Every path the PR claims (termination, batch, checkpoint, static, instance, mixed and one-element fans, a join that is a fan source, the join dispatch, take-activity, meta 03) proceeds as claimed on a single walk. #978's barrier change is correct: `enteredFan` is found by `(source, exit)`, and `met` is false on the open call.
