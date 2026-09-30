---
metadata:
  version: 1.3.0
---

## Capability

Publish the in-progress mark for every branch a graph destination fans, then open them all with one call and report the branches and the activity they converge on.

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

### planning_folder_path

*(optional)* Path to the planning folder whose `README.md` Progress surface is updated. Unset until the folder exists.

## Outputs

### branch_activities

Every branch the destination opened, each as the id that addresses it, in the order the server gave them.

### barrier_destination

The activity the branches converge on.

### trace_tokens

The opaque HMAC-signed trace token the fan-opening `next_activity` call returned in `_meta.trace_token`, as a one-entry list. Empty when the server returned none.

## Protocol

### 1. Publish one in-progress mark for every branch

- Apply [sync-progress-status](../workflow-engine/sync-progress-status.md) with `{planning_folder_path}` for the dispatch moment in [Progress Status call sites](/meta/resources/planning-readme.md#progress-status-call-sites), for each branch's rows. Then apply [git::commit-regular-files](/git/techniques/commit-regular-files.md) ONCE, with `paths` naming the planning folder `README.md` alone and a message stating which activities are entering progress — see `one-commit-before-the-spawn`
  > When `{planning_folder_path}` is unset, skip this phase.

### 2. Open every branch with one call

- Call `next_activity { session_index, activity_id: fan_destination, from_activity, exit: exit_id, step_manifest, variables_changed }`; capture `_meta.trace_token` per `dispatch-activity.accumulate-trace-per-advance`, and read from the response body `{branch_activities}`, the `branches` of every `fan` entry concatenated in the order the entries come, and `{barrier_destination}`, the `barrier`'s `destination`. The call retires the exiting activity and opens every branch

