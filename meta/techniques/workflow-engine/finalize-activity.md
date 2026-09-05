---
metadata:
  version: 1.5.0
---

## Capability

Compile the `activity_complete` result after all steps, checkpoints, and artifacts are done.

## Inputs

### steps_completed

Array of completed step entries.

### checkpoints_responded

Array of checkpoint responses (`option_id` + effects).

### artifacts_produced

Array of artifact entries (`id`, `name`, `path`).

### batch_may_continue

Whether this worker's context may take another activity, read from `may_continue` in the `batch:` block of the `get_activity` response for this activity ([batch-ends-where-the-server-says](./activity-worker.md#batch-ends-where-the-server-says)). The envelope is the only place this answer appears again, so it is read here and carried there unchanged.

## Outputs

### activity_result

The `activity_complete` result envelope, returned as one tagged object whose `result_type` says which kind it is:

#### result_type

discriminant literal `activity_complete`; sibling envelope is `checkpoint_pending`.

#### steps_completed

array of completed step entries.

#### checkpoints_responded

array of checkpoint responses (`option_id` + effects).

#### variables_changed

state variables the activity mutated, reported by the worker — one of the two sanctioned state-mutation sources.

#### artifacts_produced

array of artifact entries (`id`, `name`, `path`).

#### selected_exit

optional — the exit id a checkpoint option named, set when a checkpoint effect carried one.

#### next_activity_id

Activity ID the worker resolved for the next dispatch (or null when the workflow is complete). Required on every successful `activity_complete`: this context holds the definition and the graph the destination was resolved from, and the envelope is the only report of the result.

#### activity_exit

The exit id this activity took, from evaluate-transition, or `workflow_complete` where it declared none. The orchestrator passes it to `next_activity` as `exit`.

#### batch_may_continue

Whether this context may take another activity, folded from the input of the same name. Required on every successful `activity_complete`: the server answered it for this context and the envelope is the only report of that answer ([batch-is-bounded-by-the-server](./dispatch-activity.md#batch-is-bounded-by-the-server)).

## Protocol

1. Compile the `{activity_result}` envelope by folding `{steps_completed}`, `{checkpoints_responded}`, `{artifacts_produced}` and `{batch_may_continue}` into the `activity_complete` object. Populate the envelope's `variables_changed` map with every bag key this activity mutated — declared step outputs landed per [variable-binding](../variable-binding.md) (including remapped output names), plus any checkpoint `setVariable` effects already applied. Include `{selected_exit}` if a checkpoint effect named an exit.
2. Resolve the next activity: with the current activity definition already in hand from `get_activity`, the workflow graph from `get_workflow`, and the post-activity variable bag (after `variables_changed` / checkpoint effects), apply [evaluate-transition](./evaluate-transition.md). Fold `{next_activity_id}` and `{activity_exit}` into the envelope. Do not omit these fields: the definition they were resolved from is held here and nowhere else, so an omission cannot be recovered later.
3. Return `{activity_result}`.

## Rules

### no-readme-persist-on-worker

Planning-folder `README.md` Progress/Status sync and engineering commit/push are **not** worker duties, and are done elsewhere once the envelope is returned — do not do them here, and do not wait for them. Workers still report `{artifacts_produced}` in the envelope for activity evidence; Progress Status writes go through [sync-progress-status](./sync-progress-status.md) by owning activity, not per envelope artifact entry.
