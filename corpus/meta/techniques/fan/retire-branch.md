---
metadata:
  version: 1.0.0
---

## Capability

Retire one branch of an open fan against the activity the branches converge on, and account for the activity it carried.

## Inputs

### session_index

`session_index` of the session whose fan is open.

### barrier_destination

The activity the branches converge on, as the barrier reported it when the fan opened.

### branch_activity

The branch this call retires, instance-qualified where the graph runs one activity once per element of a collection.

### branch_envelope

What that branch returned — the `activity_complete` envelope carrying its exit, its step manifest, the variables it changed and the artifacts it produced.

## Protocol

### 1. Retire the branch

- Call `next_activity { session_index, activity_id: barrier_destination, from_activity: branch_activity, exit, step_manifest, variables_changed, artifacts_produced }`, taking every field after the destination from `{branch_envelope}`; append the `_meta.trace_token` it returns to the run's accumulated tokens per `dispatch-activity.accumulate-trace-per-advance`
  > The call reports what is still outstanding. The one that empties the frontier is the one that enters the convergence activity, and only that one — see `the-barrier-is-a-reading`.

### 2. Account for the branch

- Account for `{branch_activity}` per `dispatch-activity.account-every-activity`, which names an instance where the graph runs one activity over a collection

