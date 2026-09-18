---
metadata:
  version: 1.0.0
---

## Capability

Publish the in-progress mark for every branch a graph destination fans, then open them all with one call and report the branches and the activity they converge on.

## Inputs

### session_index

`session_index` of the session whose exit fans.

### fan_destination

The destination exactly as the graph names it — a list of members, or one activity together with the collection to run it over. Passed through unread: the server expands it, so this operation never learns which construct produced the branches and never computes a width.

### from_activity

The activity this call retires — the one its exit and step manifest belong to, and whose exit the graph fans. Instance-qualified where the graph runs that activity once per element of a collection.

### exit_id

The exit that activity took. Required: an exit the graph fans has to say which destination it takes.

### planning_folder_path

*(optional)* Path to the planning folder whose `README.md` Progress surface is updated. Unset until the folder exists.

## Outputs

### branch_list

The branches the destination opened, in the order the server gave them. The order every later pass over them follows.

### barrier_destination

The activity the branches converge on, as the barrier reported it — what the run continues from once every branch has been retired.

## Protocol

### 1. Publish one in-progress mark for every branch

- Apply [sync-progress-status](./sync-progress-status.md) with `{planning_folder_path}` for the dispatch moment in [Progress Status call sites](/meta/resources/planning-readme.md#progress-status-call-sites), for each branch's rows. Then apply [git::commit-regular-files](/git/techniques/commit-regular-files.md) ONCE, with `paths` naming the planning folder `README.md` alone and a message stating which activities are entering progress — see `one-commit-before-the-spawn`
  > When `{planning_folder_path}` is unset, skip this phase.

### 2. Open every branch with one call

- Call `next_activity { session_index, activity_id: fan_destination, from_activity, exit: exit_id, step_manifest }`; capture `_meta.trace_token` per `dispatch-activity.accumulate-trace-per-advance`, and read `_meta.fan` as `{branch_list}` and `_meta.barrier.destination` as `{barrier_destination}`. One call retires the exiting activity and opens every branch, so entering a fan cannot half-happen

