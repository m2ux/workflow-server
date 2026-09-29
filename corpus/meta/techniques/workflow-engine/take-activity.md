---
metadata:
  version: 1.3.0
---

## Capability

Advance a session this context owns onto an activity and carry that activity here, under the technique a dispatched worker would have carried it under.

## Inputs

### from_activity

*(optional)* The activity this call retires — the one `{exit_id}`, `{step_manifest}` and `{variables_changed}` belong to. Unset where the session holds nothing to retire, which is the first entry of a walk.

### activity_entered

*(optional)* True where the session already stands on `{activity_id}`, the advance that entered it having been made. False or unset where this entry makes that advance.

### agent_technique

Canonical agent technique this context follows for the activity — default workflow-engine::activity-worker.

## Outputs

### worker_result

The envelope this entry closes on — one of three tagged result types. The `checkpoint_pending` or `activity_complete` envelope is the one the activity produced, which this context composes because it carried the activity. The `workflow_complete` envelope, `{ result_type: "workflow_complete" }`, is the one an advance onto `__terminal__` closes on: the session is completed, and no activity was carried.

## Protocol

### 1. Advance the session

- Call `next_activity { session_index, activity_id, from_activity, exit: exit_id, step_manifest, variables_changed }`; capture `_meta.trace_token` per `dispatch-activity.accumulate-trace-per-advance`
  > - A first entry has no prior activity to retire, so `{from_activity}`, `{exit_id}`, `{step_manifest}` and `{variables_changed}` are all unset together.
  > - When `{activity_id}` is `__terminal__`, this advance completes the session: hold the `workflow_complete` envelope as `{worker_result}`, and end here.
  > - When `{activity_entered}` is true, skip this phase: the advance that entered `{activity_id}` carried the exit, step manifest and bag writes of what it retired, so this entry passes none.

### 2. Carry the activity

- Follow `{agent_technique}` here — [activity-worker](./activity-worker.md) by default — with `{variable_bag}` supplying the bindings its steps resolve against: call `get_activity { session_index, context_tokens }`, execute the activity's steps, and finalise per [finalize-activity](./finalize-activity.md); hold what that produced as `{worker_result}`
  > Delivery is scoped to this context's own identity, which one context legitimately holds for a session it owns (`agent-id-scopes-delivery`).

### 3. Account for the activity

- Account for `{activity_id}` per `dispatch-activity.account-every-activity`

## Rules

### advance-only-a-session-this-context-owns

This call moves a session pointer from inside the context that then carries the activity, which is sound for one session only: the one this context opened and nothing else can be pointed at. The session a worker was dispatched for has an orchestrator owning its pointer, and advancing that one from here is `activity-worker.worker-control-plane-ban`.

### no-session-left-running

A session nothing else can advance is one that reaches its end here or never. Take its activities until the advance onto `__terminal__`, which completes the session — a context that stops partway leaves a session recorded as running that nothing will ever reach, and the results it was opened for unread (`activity-worker.outlive-dispatched-children`).
