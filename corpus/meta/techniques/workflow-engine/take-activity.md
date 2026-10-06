---
metadata:
  version: 1.12.0
---

## Capability

Advance a session this context owns onto an activity and carry that activity here, under the technique a dispatched worker would have carried it under.

## Inputs

### from_activity

*(optional)* The activity this call retires — the one `{exit_id}`, `{step_manifest}` and `{variables_changed}` belong to. Unset where the session holds nothing to retire, which is the first entry of a walk.

### variables_changed

*(optional)* The bag writes of the activity this call retires: `variables_changed` from the `activity_complete` envelope that activity returned. Unset where this call retires no activity, or where that activity changed nothing.

### stands_on_activity

*(optional)* True where the session already stands on `{activity_id}`, the advance that entered it having been made. False or unset where this entry makes that advance.

### agent_technique

Canonical agent technique this context follows for the activity — default workflow-engine::activity-worker.

## Outputs

### worker_result

The envelope this entry closes on — one of three tagged result types. The `steps_complete` or `checkpoint_pending` envelope is the one the activity produced, which this context composes because it carried the activity; the side holding the graph reads the exit destination and folds `steps_complete` into `activity_complete`. The `workflow_complete` envelope, `{ result_type: "workflow_complete" }`, is the one an advance onto `__terminal__` closes on: the session is completed, and no activity was carried.

### advance_trace_tokens

The opaque trace tokens this entry accumulated, one per `next_activity` call that returned `_meta.trace_token`. Empty when the server returned none.

## Protocol

### 1. Advance Session

- Call `next_activity { session_index, activity_id, from_activity, exit: exit_id, step_manifest, variables_changed }`.
  > - A first entry has no prior activity to retire, so `{from_activity}`, `{exit_id}`, `{step_manifest}` and `{variables_changed}` are all unset together.
  > - When `{activity_id}` is `__terminal__`, this advance completes the session: hold the `workflow_complete` envelope as `{worker_result}`, and end here.
  > - When `{stands_on_activity}` is true, or `{checkpoint_reply}` is bound, skip this phase.
- Capture `_meta.trace_token` as `{advance_trace_tokens}` per `dispatch-activity.accumulate-trace-per-advance`.

### 2. Carry Activity

- Follow `{agent_technique}` here — [activity-worker](./activity-worker.md) by default — with `{variable_bag}` supplying the bindings its steps resolve against: call `get_activity { session_index, context_tokens }`, execute the activity's steps, and hold the envelope that activity produced as `{worker_result}`
  > - Pass `{checkpoint_reply}` to `{agent_technique}` where it is bound.
  > - Delivery is scoped to this context's own identity, which one context legitimately holds for a session it owns (`agent-id-scopes-delivery`).

### 3. Record Usage Entry

- Account for `{activity_id}` per `account-worker.account-every-activity`, attributed to the identity this context holds.

## Rules

### advance-only-a-session-this-context-owns

This advance moves the pointer of the session this context opened. Nothing else can be pointed at that session.

### fetch-the-body-of-an-activity-carried-here

A context carrying an activity itself delegates nothing, so it reads that body on the session it carries it for. `dispatch-activity.no-get-activity-from-orchestrator` forbids the fetch only where the work was to be handed to someone else.

### no-session-left-running

A session nothing else can advance is one that reaches its end here or never. Take its activities until the advance onto `__terminal__`, which completes the session. A context that stops partway leaves a session recorded as running, with the results it was opened for unread.
