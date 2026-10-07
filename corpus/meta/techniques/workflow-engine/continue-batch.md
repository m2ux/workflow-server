---
metadata:
  version: 1.15.0
---

## Capability

Advance the session onto the next activity of a batch the worker already carries.

## Inputs

### from_activity

The activity this advance retires — the one `{exit_id}`, `{step_manifest}` and `{variables_changed}` belong to.

### variables_changed

*(optional)* The bag writes of the activity this call retires: `variables_changed` from the `activity_complete` envelope that activity returned. Unset where this call retires no activity, or where that activity changed nothing.

### worker_agent_id

Server-side worker identity the batch is carried under — the identity the delivery ledger is keyed on.

## Outputs

### advance_trace_tokens

The opaque trace token the advancing `next_activity` call returned in `_meta.trace_token`, as a one-entry list. Empty when the server returned none.

## Protocol

### 1. Advance Session

- Call `next_activity { session_index, activity_id, from_activity, exit: exit_id, step_manifest, variables_changed, agent_id: worker_agent_id }`.
- Capture `_meta.trace_token` as `{advance_trace_tokens}` per `dispatch-activity.accumulate-trace-per-advance`.

## Rules

### batch-is-bounded-by-the-server

A worker's batch is bounded at delivery. The server refuses the next activity once that context has been delivered the cap of distinct activities or accumulated more delivery than its batch budget allows, and reports where a context stands on every `get_activity`. This advance does not size a batch, hold a count, or reason about context load.

### one-advance-per-activity

This technique advances the session pointer once. A second advance onto an activity already current records that activity as exited and complete before a worker has walked a step of it.
