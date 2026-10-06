---
metadata:
  version: 1.11.0
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

What the branches returned, in the order the fan opened them.

### worker_agent_id

The identity the branch ran under, as `spawn-branches` minted it for this branch.

## Outputs

### advance_trace_tokens

The opaque trace token the retiring `next_activity` call returned in `_meta.trace_token`, as a one-entry list. Empty when the server returned none.

## Protocol

### 1. Take Branch Entry

- Take the entry of `{branch_envelopes}` belonging to `{branch_activity}`. The returns are in the order the fan opened the branches, and that order is the correspondence.
- From that entry, `exit` is `activity_exit`.
  > - Omit `exit` where the entry's `activity_exit` is unset.
  > - The server checks the exit against the destination, not against the branch: an exit taken from another branch's entry passes unchecked.
- From that entry, `step_manifest` is `steps_completed`.
- From that entry, `variables_changed` is the field of that name.
- From that entry, `artifacts_produced` is the field of that name.

### 2. Retire Branch

- Call `next_activity { session_index, activity_id: barrier_destination, from_activity: branch_activity, exit, step_manifest, variables_changed, artifacts_produced }`.

### 3. Read Retirement

- Capture `_meta.trace_token` as `{advance_trace_tokens}` per `dispatch-activity.accumulate-trace-per-advance`.
- A retirement that leaves branches in flight reports them at `outstanding`, each as the id that addresses it.
  > The one that empties the frontier is the one that enters the convergence activity, and only that one: it reports that activity's `name` and `barrier.met` true — see `the-barrier-is-a-reading`.

### 4. Account for the Branch

- Account for `{branch_activity}` per `account-worker.account-every-activity`, attributed to `{worker_agent_id}`.
  > Where the graph runs one activity over a collection, the activity names that instance.

