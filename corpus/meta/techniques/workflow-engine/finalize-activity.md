---
metadata:
  version: 1.11.0
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

Whether this worker's context may take another activity, read from `may_continue` in the `batch:` block of the `get_activity` response for this activity (`activity-worker.batch-ends-where-the-server-says`).

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

The `next_activity_id` output of [evaluate-transition](./evaluate-transition.md), carried unread.

#### next_activity_fans

The `next_activity_fans` output of evaluate-transition.

#### activity_exit

The `activity_exit` output of evaluate-transition.

#### batch_may_continue

Whether this context may take another activity, folded from the input of the same name.

## Protocol

### 1. Fold Activity Results

- Compile the `{activity_result}` envelope by folding `{steps_completed}`, `{checkpoints_responded}`, `{artifacts_produced}` and `{batch_may_continue}` into the `activity_complete` object. Populate the envelope's `variables_changed` map with every bag key this activity mutated — declared step outputs landed per [variable-binding](../variable-binding.md) (including remapped output names), plus any checkpoint `setVariable` effects already applied. Carry `{batch_may_continue}` unchanged: every successful envelope carries it.
  > Where a checkpoint effect named an exit, include `{selected_exit}`.

### 2. Read Routing Destination

- Resolve the next activity: with the current activity definition and its `exit_destinations` both in hand from `get_activity`, and the post-activity variable bag (after `variables_changed` / checkpoint effects), apply [evaluate-transition](./evaluate-transition.md). Fold `{next_activity_id}`, `{next_activity_fans}` and `{activity_exit}` into the envelope, passing `{next_activity_id}` on unread. Every successful envelope carries `{next_activity_id}` and `{next_activity_fans}`, and `{activity_exit}` wherever an exit was taken.

### 3. Return Envelope

- Return `{activity_result}`.
## Rules

### no-readme-persist-on-worker

Planning-folder `README.md` Progress/Status sync and engineering commit/push are **not** worker duties, and are done elsewhere once the envelope is returned — do not do them here, and do not wait for them. Workers still report `{artifacts_produced}` in the envelope for activity evidence; Progress Status is written per owning activity, not per envelope artifact entry.
