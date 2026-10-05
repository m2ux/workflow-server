---
metadata:
  version: 1.9.0
---

## Capability

Open every branch a graph destination fans with one call, and report the branches and the activity they converge on.

## Inputs

### session_index

`session_index` of the session whose exit fans.

### fan_destination

The destination exactly as the graph names it — a list of members, or one activity together with the collection to run it over.

### from_activity

The activity this call retires — the one its exit and step manifest belong to, and whose exit the graph fans. Instance-qualified where the graph runs that activity once per element of a collection.

### exit_id

The exit that activity took.

### step_manifest

*(optional)* One entry per step of the activity this call retires: `steps_completed` from the `activity_complete` envelope that activity returned.

### variables_changed

*(optional)* The bag writes of the activity this call retires: `variables_changed` from the `activity_complete` envelope that activity returned. Unset where this call retires no activity, or where that activity changed nothing.

## Outputs

### branch_activities

Every branch the destination opened, each as the id that addresses it, in the order the server gave them.

### barrier_destination

The activity the branches converge on.

### advance_trace_tokens

The opaque trace token the fan-opening `next_activity` call returned in `_meta.trace_token`, as a one-entry list. Empty when the server returned none.

## Protocol

### 1. Open Every Branch

- Call `next_activity { session_index, activity_id: fan_destination, from_activity, exit: exit_id, step_manifest, variables_changed }`; capture `_meta.trace_token` as `{advance_trace_tokens}`. The walk appends that token to the run's `trace_tokens`. A token not captured is absent from the trace close-out resolves. Read from the response body `{branch_activities}`, the `branches` of every `fan` entry concatenated in the order the entries come, and `{barrier_destination}`, the `barrier`'s `destination`. The call retires the exiting activity and opens every branch

