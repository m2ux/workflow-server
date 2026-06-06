---
metadata:
  version: 1.0.0
---

## Capability

Compile the `activity_complete` result after all steps, checkpoints, and artifacts are done.

## Inputs

### steps-completed

Array of completed step entries.

### checkpoints-responded

Array of checkpoint responses (`option_id` + effects).

### artifacts-produced

Array of artifact entries (`id`, `name`, `path`).

## Output

### result

The `activity_complete` result envelope, returned as one tagged object (the orchestrator switches on `result-type`):

#### result-type

discriminant literal `activity_complete`; sibling envelope is `checkpoint_pending`.

#### steps-completed

array of completed step entries.

#### checkpoints-responded

array of checkpoint responses (`option_id` + effects).

#### variables-changed

state variables the activity mutated, reported by the worker — one of the two sanctioned state-mutation sources (see [dispatch-activity](./dispatch-activity.md)).

#### artifacts-produced

array of artifact entries (`id`, `name`, `path`).

#### transition-override

optional — the transition target to take instead of the default, set when a checkpoint effect specified `transitionTo` (see Protocol step 2).

## Protocol

1. Update the planning folder's `README.md` Progress table with one row per entry in `artifacts-produced`, then refresh the footer status.
2. Compile the `result` envelope by folding `steps-completed`, `checkpoints-responded`, and `artifacts-produced` into the `activity_complete` object; include `transition-override` if a checkpoint effect specified `transitionTo`. Return `result`.
