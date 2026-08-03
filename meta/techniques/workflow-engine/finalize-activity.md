---
metadata:
  version: 1.3.0
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

Whether this worker's context may take another activity, read from `_meta.batch.may_continue` on its last `get_activity` ([batch-ends-where-the-server-says](./activity-worker.md#batch-ends-where-the-server-says)). The orchestrator holds no batch state, so this is the channel that carries the server's answer out to it.

## Outputs

### activity_result

The `activity_complete` result envelope, returned as one tagged object (the orchestrator switches on `result_type`):

#### result_type

discriminant literal `activity_complete`; sibling envelope is `checkpoint_pending`.

#### steps_completed

array of completed step entries.

#### checkpoints_responded

array of checkpoint responses (`option_id` + effects).

#### variables_changed

state variables the activity mutated, reported by the worker — one of the two sanctioned state-mutation sources (see [dispatch-activity](./dispatch-activity.md)).

#### artifacts_produced

array of artifact entries (`id`, `name`, `path`).


#### transition_override

optional — the transition target to take instead of the default, set when a checkpoint effect specified `transitionTo` (see Protocol step 2).

#### next_activity_id

Activity ID the worker resolved for the next dispatch (or null when the workflow is complete). Required on every successful `activity_complete` so definition-blind orchestrators need not call `get_activity` or re-walk `transitions[]`.

#### evaluated_condition

One-line summary from evaluate-transition of which transition matched (`transition_override:…`, `condition:…`, `isDefault:…`, or `workflow_complete`).

#### batch_may_continue

Whether this context may take another activity, folded from the input of the same name. Required on every successful `activity_complete`: the orchestrator holds no batch state of its own, and this is what tells it whether to continue this worker onto the next activity or release it and dispatch a fresh one ([batch-continues-only-with-room](./continue-batch.md#batch-continues-only-with-room)).

## Protocol

1. Compile the `{activity_result}` envelope by folding `{steps_completed}`, `{checkpoints_responded}`, `{artifacts_produced}` and `{batch_may_continue}` into the `activity_complete` object. Populate the envelope's `variables_changed` map with every bag key this activity mutated — declared step outputs landed per [variable-binding](../variable-binding.md) (including remapped output names), plus any checkpoint `setVariable` effects already applied. Include `{transition_override}` if a checkpoint effect specified `transitionTo`.
2. Resolve the next activity: with the current activity definition already in hand from `get_activity` and the post-activity variable bag (after `variables_changed` / checkpoint effects), apply [evaluate-transition](./evaluate-transition.md). Fold `{next_activity_id}` and `{evaluated_condition}` into the envelope. Do not omit these fields — orchestrators under `no-get-activity-from-orchestrator` route solely from this report.
3. Return `{activity_result}`.

## Rules

### no-readme-persist-on-worker

Planning-folder `README.md` Progress/Status sync and engineering commit/push are **not** worker duties. The orchestrator applies [commit-and-persist](./commit-and-persist.md) after `activity_complete`. Workers still report `{artifacts_produced}` in the envelope for activity evidence; Progress Status writes go through [sync-progress-status](./sync-progress-status.md) by owning activity, not per envelope artifact entry.
