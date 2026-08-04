# Session reattach — investigation record

Supports [#429](https://github.com/m2ux/workflow-server/issues/429). The attempt described here landed on the batched-dispatch branch and was taken back out; this is what two review rounds established, so the next attempt does not rediscover it.

## The defect

`dispatch_child` has no branch for a folder that already holds a session. On a resume, `start_session` opens a new transient meta parent, `ensurePlanningFolder` returns the *existing* folder for the slug, and `writeSessionFile` writes the new parent over it with a freshly built child inside.

A child's `session_index` is derived from the folder plus the JSON path to its slot (`computeEmbeddedSessionIndex(folder, ['triggeredWorkflows', 0, 'state'])`). Both runs place their child at slot 0, so both derive the same index. The caller receives an index that resolves, and every later call succeeds against an empty session.

Measured on a real work-package, run 1 then run 2 with the same slug:

| | before | after |
|---|---|---|
| `currentActivity` | `second-activity` | `""` |
| `completedActivities` | `["child-activity"]` | `[]` |
| history events | 5 | 2 |
| `session_index` | `DLCMYV` | `DLCMYV` |

Confirmed identical at `origin/main` and on the branch after the revert, so the behaviour is pre-existing and the revert restored it rather than inventing a third state. The only difference between the two revisions is the added `workflow.initialActivity` response field.

## Constraints the next attempt has to satisfy

Each was found by review, in the order they became visible — every one was hidden behind the previous fix.

**An unreadable session is not an absent one.** The first attempt caught every read failure and treated it as "no children", then wrote over the folder. That is a second route to the same destruction. The likeliest cause is a rotated server key: `getOrCreateServerKey` mints a new one when `state/secret` is gone, and the seal is an HMAC under it, so the content is intact and only the signature fails. Refusing costs one call; continuing costs the run. A schema-invalid file takes the same path without entering a catch at all.

**Completion is not recorded where the reference says.** `EmbeddedSessionRef.status` is only flipped to `completed` by the `next_activity` branch that notifies a persistent parent, and `dispatch_child` never sets `parentSession` on a child it creates — so for dispatched children that flip never happens and the reference reads `running` for ever. Observed on the real corpus: after work-package reaches `complete`, `state.status` is `completed` while `entry.status` is still `running`. Resuming on the reference walks a finished workflow onto its close-out activity and runs it again, recording `workflow_completed` twice. The child's own `state.status` is authoritative.

**A cursor can name somewhere that cannot be entered.** `TERMINAL_SENTINEL` (`__terminal__`) is a real stored cursor in `prism-evaluate/04-deliver-results`, `workflow-authoring/01` and `/09`, and `prism-update`. `next_activity` special-cases it and re-emits completion, but no activity is declared under it, so the worker's `get_activity` is refused. The pointer only moves on a worker envelope, so the loop can neither advance nor exit. An activity the workflow no longer declares fails at `getActivity` before the transition check runs, and its error names the id it could not find rather than the one to use.

**The index is stored twice and only one copy resolves.** `findSessionsInEngineeringRoot` matches `entry.state.sessionIndex`, not `entry.sessionIndex`. Refreshing only the reference — which is what the first attempt did — hands back an index resolving to nothing while the stale one still works. Reproduced with the folder moved: reference `6LZ3SL`, state `3NNEA4`, caller given `6LZ3SL`, `get_workflow_status` reporting no such session.

**A run abandoned at a checkpoint is the likeliest thing to resume and the hardest.** `activeCheckpoint` survives, and then `next_activity`, `get_activity` and `get_technique` all refuse until it is answered. Every loop step that could answer one is gated on `worker_result.result_type == "checkpoint_pending"`, and `worker_result` is unset on the first iteration, so nothing in the corpus clears it.

**Slot order is load-bearing.** Because the index derives from the slot, carrying children forward has to keep each at its original array position. Moving one changes the index its worker authenticates with.

**Smaller, but real.** A resume that adopts the saved child whole ignores the caller's `repo`, `context_mode` and `agent_id` without warning, and keeps the recorded `workflowVersion`, so a version bump surfaces as drift on a later call rather than at the dispatch. `bindSessionRepo` refuses a conflicting rebind on the parent; the child has no equivalent check. And the previous meta parent's own `history`, `variables` and `startedAt` are lost even when the child's are preserved — the first attempt reused `workflow_returned`, whose existing meaning is *the child finished*, to mean *the parent reattached*.

## What the corpus side needs

Priming has to distinguish a resumed cursor from a first activity, and the two gates must be exact complements or the loop is primed twice or not at all. The first attempt used `client_resumed_activity` and `!client_resumed_activity`, verified against `evaluateWhenExpression` for unset, `''`, `'none'`, `'false'`, `false`, `true`, `null`, `0` and a normal id — exactly one fired in all eleven cases.

Taking the cursor from the dispatch response rather than asking `get_workflow_status` avoids a sentinel: that tool reports an empty cursor as the **string** `'none'`, and priming from it would be the same fault as the bare `initialActivity` this branch started with — a literal that reads like a name.

## What is not in scope

Resuming through a persistent parent. That path appends a second child rather than continuing the first; it overwrites nothing, so it loses no work, and the meta bootstrap does not take it. Two running children of one workflow are only reachable that way.

## Where the attempt lives

Branch `feat/batched-dispatch`: reattach added in `323f0f5f`, cursor reported in `eea3a732`, corpus priming in `86b8abe3`, the review fixes in `e3fb9a47`, and the removals in `2d43bd5f` and `636e7b15`. The removal messages state each fault and why the direction was wrong.
