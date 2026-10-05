---
metadata:
  version: 1.4.0
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

## Outputs

### advance_trace_tokens

The opaque trace token the retiring `next_activity` call returned in `_meta.trace_token`, as a one-entry list. Empty when the server returned none.

## Protocol

### 1. Retire the branch

- Take the entry of `{branch_envelopes}` belonging to `{branch_activity}` — the returns are in the order the fan opened the branches, and that order is the correspondence. Call `next_activity { session_index, activity_id: barrier_destination, from_activity: branch_activity, exit, step_manifest, variables_changed, artifacts_produced }`, taking from that entry `exit` as its `activity_exit`, `step_manifest` as its `steps_completed`, and `variables_changed` and `artifacts_produced` as its fields of those names; capture the `_meta.trace_token` it returns as `{advance_trace_tokens}`. The walk appends that token to the run's `trace_tokens`. A token not captured is absent from the trace close-out resolves.
  > - Omit `exit` where the entry's `activity_exit` is unset.
  > - The server checks the exit against the destination, not against the branch: an exit taken from another branch's entry passes unchecked.
  > - A retirement that leaves branches in flight reports them at `outstanding`, each as the id that addresses it. The one that empties the frontier is the one that enters the convergence activity, and only that one: it reports that activity's `name` and `barrier.met` true — see `the-barrier-is-a-reading`.

### 2. Account for the branch

- Record one usage entry for `{branch_activity}`: `record_usage { session_index, activity: branch_activity, usage, basis, agent_id: worker_agent_id }`. Where the graph runs one activity over a collection, the activity names that instance. `usage` and `basis` are read from the harness, and the entry says what the figure counts. When the harness reports no figure, omit the entry.

