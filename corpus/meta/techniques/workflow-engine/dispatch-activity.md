---
metadata:
  version: 1.38.0
---

## Capability

Advance the session onto a target activity, mint the worker identity, and announce the dispatch.

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

- Call `next_activity { session_index, activity_id, from_activity, exit: exit_id, step_manifest, variables_changed }`; capture `_meta.trace_token` as `{advance_trace_tokens}`. The walk appends that token to the run's `trace_tokens`. A token not captured is absent from the trace close-out resolves.
  > - A dispatch whose activity ran steps carries one `step_manifest` entry per completed step; the server validates step completion against it and reports a gap when it is absent.
  > - A first dispatch has no prior worker context to attribute the manifest to, so `agent_id` is omitted here; a continuation names one ([continue-batch](./continue-batch.md)).
  > - When `{activity_id}` is `__terminal__`, this advance completes the session: return the `workflow_complete` envelope as `{worker_result}`, and end here.
  > - When `{stands_on_activity}` is true, skip this phase.

### 2. Mint Identity

- Mint `{worker_agent_id}` for this dispatch per `delivery-keys-on-agent-context`.

### 3. Announce Dispatch

- Leave the user no silent minute. Before the spawn, tell them what is about to run, which gate their answer is next needed at — the first checkpoint of that activity, or that the activity runs to completion without one — and how long a comparable dispatch took where the session record carries a figure. A dispatch produces nothing the user can read while it runs, and a gate arrives whenever the worker reaches one.
  > - Where a wait falls between one activity and the next, say that they are waiting and roughly how long, without an account of the machinery imposing the wait.
  > - A cost not quoted before it is spent reads as a stall, and a gate nobody was told to expect arrives to someone who has stopped watching.
  > - What a completed activity delivered is a separate emission, per the [Run Status Guide](/meta/resources/run-status.md), made once its artifacts are on the remote.

## Rules

### no-get-activity-from-orchestrator

Workflow orchestrators NEVER call `get_activity`.

### no-pre-load-techniques

This technique does not call `get_technique`.

### delivery-keys-on-agent-context

Delivery follows the worker `agent_id`, bound at dispatch and held for that worker's batch. A first dispatch, and a new worker for the same activity, each hold no prior deliveries and take full delivery. `context_mode: "persistent"` stays off these sessions.


