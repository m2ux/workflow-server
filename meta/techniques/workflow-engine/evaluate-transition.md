# evaluate-transition

Pick the next activity from the current activity's `transitions[]`.

## Inputs

### activity

Just-completed activity definition (with `transitions[]`)

### state

Current variable state

### transition_override

Optional `activity_id` from a checkpoint effect `transitionTo`

## Output

### next_activity_id

Activity ID to dispatch next, or null if the workflow is complete

## Procedure

1. If `transition_override` is set, return it.
2. Iterate `activity.transitions[]` in array order; return the first whose `condition` evaluates true.
3. If no condition matches and no `isDefault` transition exists, return null (`workflow_complete`).

## Errors

### transition_ambiguous

**Cause:** Multiple transition conditions evaluate to true at the activity boundary.

**Recovery:** Take the first matching transition in array order. Log a warning.
