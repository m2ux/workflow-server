---
metadata:
  version: 1.1.1
---

## Capability

Pick the next activity from the current activity's `transitions[]`.

## Inputs

### current_activity

Just-completed activity definition (with `transitions[]`)

### state

Current variable state

### transition_override

Optional `activity-id` from a checkpoint effect `transitionTo`.

## Outputs

### next_activity_id

Activity ID to dispatch next, or null if the workflow is complete.

### evaluated_condition

One-line summary of which transition matched — `transition_override:<id>`, `condition:<expression or path>`, `isDefault:<id>`, or `workflow_complete`.

## Protocol

1. If `{transition_override}` is set, return it as `{next_activity_id}` and set `{evaluated_condition}` to `transition_override:{transition_override}`.
2. Iterate `current_activity.transitions[]` in array order, evaluating each `condition` against the current `{state}`; return the first whose `condition` is true as `{next_activity_id}` and set `{evaluated_condition}` to a short label for that match (`condition:…` or `isDefault:<id>`). If more than one condition evaluates to true at the activity boundary, take the first matching transition in array order and log a warning.
3. If no condition matches and no `isDefault` transition exists, set `{next_activity_id}` to null and `{evaluated_condition}` to `workflow_complete`.
