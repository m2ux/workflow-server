---
metadata:
  version: 1.0.0
---

## Capability

Pick the next activity from the current activity's `transitions[]`.

## Inputs

### activity

Just-completed activity definition (with `transitions[]`)

### state

Current variable state

### transition_override

Optional `activity-id` from a checkpoint effect `transitionTo`.

## Output

### next_activity_id

Activity ID to dispatch next, or null if the workflow is complete.

## Protocol

1. If `transition-override` is set, return it as `next-activity-id`.
2. Iterate `activity.transitions[]` in array order, evaluating each `condition` against the current `state`; return the first whose `condition` is true as `next-activity-id`. If more than one condition evaluates to true at the activity boundary, take the first matching transition in array order and log a warning.
3. If no condition matches and no `isDefault` transition exists, set `next-activity-id` to null (`workflow_complete`).
