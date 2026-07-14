---
metadata:
  version: 1.0.0
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

## Protocol

1. Update the planning folder's `README.md` Progress table with one row per entry in `{artifacts_produced}`, then refresh the header Status line (status is stated once, in the header — no footer; see the [planning-readme](../../resources/planning-readme.md) guide).
2. Compile the `{activity_result}` envelope by folding `{steps_completed}`, `{checkpoints_responded}`, and `{artifacts_produced}` into the `activity_complete` object; include `{transition_override}` if a checkpoint effect specified `transitionTo`. Return `{activity_result}`.
