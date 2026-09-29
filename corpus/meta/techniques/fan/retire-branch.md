---
metadata:
  version: 1.2.0
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

### branch_envelopes

What the branches returned, in the order the fan opened them. This call reads the one belonging to `{branch_activity}` and leaves the rest alone.

## Protocol

### 1. Retire the branch

- Take the entry of `{branch_envelopes}` belonging to `{branch_activity}` — the returns are in the order the fan opened the branches, and that order is the correspondence. Call `next_activity { session_index, activity_id: barrier_destination, from_activity: branch_activity, exit, step_manifest, variables_changed, artifacts_produced }`, taking from that entry `exit` as its `activity_exit`, omitted where unset, `step_manifest` as its `steps_completed`, and `variables_changed` and `artifacts_produced` as its fields of those names; append the `_meta.trace_token` it returns to the run's accumulated tokens per `dispatch-activity.accumulate-trace-per-advance`
  > The server checks the exit against the destination, not against the branch: an exit taken from another branch's entry passes unchecked.
  > The call reports what is still outstanding at `outstanding`, each branch as the id that addresses it. The one that empties the frontier is the one that enters the convergence activity, and only that one — see `the-barrier-is-a-reading`.

### 2. Account for the branch

- Account for `{branch_activity}` per `dispatch-activity.account-every-activity`, which names an instance where the graph runs one activity over a collection

