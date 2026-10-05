---
metadata:
  version: 1.15.0
---

## Capability

Compile the activity's `activity_complete` result.

## Inputs

### steps_completed

Array of completed step entries.

### checkpoints_responded

Array of checkpoint responses (`option_id` + effects).

### artifacts_produced

Array of artifact entries (`id`, `name`, `path`).

### selected_exit

*(optional)* The exit a checkpoint answer in this activity selected.

### batch_may_continue

Whether this worker's context may take another activity, read from `may_continue` in the `batch:` block of the `get_activity` response for this activity.

### next_activity_id

Where the run goes next, as [evaluate-transition](./evaluate-transition.md) read it. Passed through unread.

### next_activity_fans

Whether that destination opens several branches rather than one activity.

### activity_exit

The exit id this activity took. Unset where it declares none.

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

state variables the activity mutated, reported by the worker — one of the sanctioned sources `variable-mutation-source` names.

#### artifacts_produced

array of artifact entries (`id`, `name`, `path`).

#### selected_exit

optional — the exit id a checkpoint option named, set when a checkpoint effect carried one.

#### next_activity_id

Where the run goes next, as the graph names the destination of the exit taken: an activity id, a list of members, or one activity together with the collection it runs over; or `__terminal__`.

#### next_activity_fans

Whether that destination opens several branches rather than one activity.

#### activity_exit

The exit id this activity took; unset where it declares none.

#### batch_may_continue

Whether this context may take another activity, folded from the input of the same name.

## Protocol

### 1. Fold Activity Results

- Compile the `{activity_result}` envelope by folding `{steps_completed}`, `{checkpoints_responded}`, `{artifacts_produced}` and `{batch_may_continue}` into the `activity_complete` object. Populate the envelope's `variables_changed` map with every bag key this activity mutated — declared step outputs landed per [variable-binding](../variable-binding.md) (including remapped output names), plus any checkpoint `setVariable` effects already applied. Carry `{batch_may_continue}` unchanged: every successful envelope carries it.
  > Where a checkpoint effect named an exit, include `{selected_exit}`.

### 2. Fold Routing Fields

- Fold `{next_activity_id}`, `{next_activity_fans}` and `{activity_exit}` into the envelope, passing `{next_activity_id}` on unread, and return `{activity_result}`. Every successful envelope carries `{next_activity_id}` and `{next_activity_fans}`, and `{activity_exit}` wherever an exit was taken.

## Rules

### no-readme-persist-on-worker

This technique does not sync the planning-folder README, does not commit or push engineering artifacts, and does not wait for that work.
