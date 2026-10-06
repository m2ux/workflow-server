---
metadata:
  version: 1.42.0
---

## Capability

Advance the session onto a target activity and mint the worker identity.

## Inputs

### from_activity

*(optional)* The activity this call retires — the one `{exit_id}`, `{step_manifest}` and `{variables_changed}` belong to. Unset where the session holds nothing to retire, which is the first dispatch of a walk.

### variables_changed

*(optional)* The bag writes of the activity this call retires: `variables_changed` from the `activity_complete` envelope that activity returned. Unset where this call retires no activity, or where that activity changed nothing.

### stands_on_activity

*(optional)* True where the session already stands on `{activity_id}`, the advance that entered it having been made. False or unset where this dispatch makes that advance.

## Outputs

### worker_result

The `workflow_complete` envelope, `{ result_type: "workflow_complete" }`, when the advance is onto `__terminal__`. The session is completed. Unset when a worker is still to be opened.

### worker_agent_id

Server-side worker identity this dispatch bound — the identity the delivery ledger is keyed on. Unset on the `workflow_complete` envelope, which no worker returned.

### advance_trace_tokens

The opaque trace tokens this dispatch accumulated, one per `next_activity` call that returned `_meta.trace_token`. Empty when the server returned none.

## Protocol

### 1. Advance Session

- Call `next_activity { session_index, activity_id, from_activity, exit: exit_id, step_manifest, variables_changed }`.
  > - A dispatch whose activity ran steps carries one `step_manifest` entry per completed step; the server validates step completion against it and reports a gap when it is absent.
  > - A first dispatch has no prior worker context to attribute the manifest to, so `agent_id` is omitted here; a continuation names one ([continue-batch](./continue-batch.md)).
  > - When `{activity_id}` is `__terminal__`, this advance completes the session: return the `workflow_complete` envelope as `{worker_result}`, and end here.
  > - When `{stands_on_activity}` is true, skip this phase.
- Capture `_meta.trace_token` as `{advance_trace_tokens}` per `accumulate-trace-per-advance`.

### 2. Mint Identity

- Mint `{worker_agent_id}` for this dispatch per `delivery-keys-on-agent-context`.

## Rules

### accumulate-trace-per-advance

Every advancing call returns `_meta.trace_token`, captured as `{advance_trace_tokens}`, and the walk appends that token to the run's `trace_tokens`. A token not captured is absent from the trace close-out resolves.

### no-get-activity-from-orchestrator

Workflow orchestrators NEVER call `get_activity` on a session they delegate work on. Those activity bodies are the workers', and a context that reads one holds the work it was to delegate.

### no-pre-load-techniques

This technique does not call `get_technique`.

### delivery-keys-on-agent-context

Delivery follows the worker `agent_id`, bound at dispatch and held for that worker's batch. A first dispatch, and a new worker for the same activity, each hold no prior deliveries and take full delivery. `context_mode: "persistent"` stays off these sessions.


