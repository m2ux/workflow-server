---
metadata:
  version: 1.1.1
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

## Protocol

1. Compile the `{activity_result}` envelope by folding `{steps_completed}`, `{checkpoints_responded}`, and `{artifacts_produced}` into the `activity_complete` object. Populate the envelope's `variables_changed` map with every bag key this activity mutated — declared step outputs landed per [variable-binding](../variable-binding.md) (including remapped output names), plus any checkpoint `setVariable` effects already applied. Include `{transition_override}` if a checkpoint effect specified `transitionTo`.
2. Resolve the next activity: with the current activity definition already in hand from `get_activity` and the post-activity variable bag (after `variables_changed` / checkpoint effects), apply [evaluate-transition](./evaluate-transition.md). Fold `{next_activity_id}` and `{evaluated_condition}` into the envelope. Do not omit these fields — orchestrators under `no-get-activity-from-orchestrator` route solely from this report.
3. Return `{activity_result}`.

## Rules

### no-readme-persist-on-worker

Planning-folder `README.md` Progress/Status sync and engineering commit/push are **not** worker duties. The orchestrator applies [commit-and-persist](./commit-and-persist.md) after `activity_complete`. Workers still report `{artifacts_produced}` in the envelope for activity evidence; Progress Status writes go through [sync-progress-status](./sync-progress-status.md) by activity-prefix field, not per envelope artifact entry.
