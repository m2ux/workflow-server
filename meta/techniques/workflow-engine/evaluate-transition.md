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

Optional `activity_id` from a checkpoint effect `transitionTo`

## Output

### next_activity_id

Activity ID to dispatch next, or null if the workflow is complete

## Protocol

1. If `transition_override` is set, return it as `next_activity_id`.
2. Iterate `activity.transitions[]` in array order, evaluating each `condition` against the current `state`; return the first whose `condition` is true as `next_activity_id`.
3. If no condition matches and no `isDefault` transition exists, set `next_activity_id` to null (`workflow_complete`).

## Errors

### transition_ambiguous

**Cause:** Multiple transition conditions evaluate to true at the activity boundary.

**Recovery:** Take the first matching transition in array order. Log a warning.
