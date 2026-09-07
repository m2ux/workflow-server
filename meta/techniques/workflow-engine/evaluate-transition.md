---
metadata:
  version: 3.0.0
---

## Capability

Name the outcome the just-completed activity reached, and read where the workflow sends it.

## Inputs

### current_activity

Just-completed activity definition (with `exits[]`)

### exit_destinations

The activity each of the just-completed activity's exits leads to, keyed by exit id. `__terminal__` names a destination that ends the run. An exit absent from the map has no destination bound.

### state

Current variable state

### selected_exit

Optional exit id a checkpoint option named, from its effect.

## Outputs

### next_activity_id

Activity ID to dispatch next, `__terminal__` where the exit ends the run, or null if the activity declares no exit to take.

### activity_exit

The exit id taken, passed to `next_activity` as `exit` — or `workflow_complete` where the activity declared no exit to take.

## Protocol

1. If `{selected_exit}` is set, that is the exit taken: the user's choice at a checkpoint decides the outcome, and no predicate overrides it.
2. Otherwise iterate `current_activity.exits[]` in array order, evaluating each `when` against the current `{state}`, and take the first whose `when` is true. Where more than one holds at the activity boundary, take the first in array order and log a warning. An exit with no `when` is not selected here — it is either the default or one only a checkpoint option names.
3. Where nothing above selected an exit, take the exit marked `isDefault`. This is also what a checkpoint dismissed on an unmet condition resolves to, and what an activity with a single unconditional exit takes.
4. Set `{activity_exit}` to the exit taken and read `{next_activity_id}` from `{exit_destinations}` under that exit id. A destination of `__terminal__` ends the run.
5. Where no exit was taken — the activity declares none — set `{next_activity_id}` to null and `{activity_exit}` to `workflow_complete`.
