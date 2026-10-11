---
metadata:
  version: 1.0.0
---

## Capability

Advance a session this context owns onto an activity and carry that activity here, under the technique a dispatched worker would have carried it under.

## Inputs

### session_index

`session_index` of the session being advanced — one this context opened, which no other context holds.

### activity_id

Activity ID to enter.

### from_activity

*(optional)* The activity this call retires — the one `{exit_id}` and `{step_manifest}` belong to. Unset where the session holds nothing to retire, which is the first entry of a walk.

### exit_id

*(optional)* The exit that activity took, which the server checks against the destination this call enters. Unset alongside `{from_activity}`.

### step_manifest

*(optional)* One entry per step of the activity just finished — `steps_completed` from the envelope the preceding entry returned. Unset alongside `{from_activity}`.

### agent_technique

Canonical agent technique this context follows for the activity — default workflow-engine::activity-worker.

### state

Current variable state the activity's steps resolve their references against (`session_index`, `workflow_id`, `activity_id`, …).

## Outputs

### worker_result

The envelope the activity produced — one of two tagged result types: the `checkpoint_pending` envelope, or the `activity_complete` envelope. This context carried the activity, so it composes that envelope rather than receiving one.

## Protocol

### 1. Advance the session

- Call `next_activity { session_index, activity_id, from_activity, exit: exit_id, step_manifest }`; capture `_meta.trace_token` per `dispatch-activity.accumulate-trace-per-advance`
  > A first entry has no prior activity to retire, so `from_activity`, `exit_id` and `step_manifest` are all unset together.

### 2. Carry the activity

- Follow `{agent_technique}` here — [activity-worker](./activity-worker.md) by default — with `{state}` supplying the bindings its steps resolve against: call `get_activity { session_index, context_tokens }`, execute the activity's steps, and finalise per [finalize-activity](./finalize-activity.md); hold what that produced as `{worker_result}`
  > Delivery is scoped to this context's own identity, which one context legitimately holds for a session it owns (`agent-id-scopes-delivery`).

### 3. Account for the activity

- Account for `{activity_id}` per `dispatch-activity.account-every-activity`

## Rules

### advance-only-a-session-this-context-owns

This call moves a session pointer from inside the context that then carries the activity, which is sound for one session only: the one this context opened and nothing else can be pointed at. The session a worker was dispatched for has an orchestrator owning its pointer, and advancing that one from here is `activity-worker.worker-control-plane-ban`.

### no-session-left-running

A session nothing else can advance is one that reaches its end here or never. Take its activities until the session reports `workflow_complete` — a context that stops partway leaves a session recorded as running that nothing will ever reach, and the results it was opened for unread (`activity-worker.outlive-dispatched-children`).
