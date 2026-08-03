---
metadata:
  version: 1.0.0
---

## Capability

Continue the worker that already holds an activity, under the delivery identity its dispatch bound.

## Inputs

### session_index

`session_index` of the session whose worker is being continued.

### activity_id

Activity the worker holds.

### worker_agent_id

Server-side worker identity the worker's dispatch bound — the identity the delivery ledger is keyed on.

### effects

Variable updates carried by the resolved checkpoint.

### state

Current variable state for stub substitution (`session_index`, `workflow_id`, `activity_id`, …).

## Outputs

### worker_result

The envelope the worker returned, passed through unchanged — one of two tagged result types: the `checkpoint_pending` envelope, or the `activity_complete` envelope.

## Protocol

### 1. Compose the continuation stub

- Apply [compose-prompt](./compose-prompt.md) with `agent_technique: workflow-engine::resume-from-checkpoint` and `{state}` as substitutions, binding `agent_id` to `{worker_agent_id}` and carrying `{effects}`.

### 2. Continue the worker

- Apply [harness-compat](../harness-compat/TECHNIQUE.md)::[continue-agent](../harness-compat/continue-agent.md) with the composed prompt.

### 3. Await the envelope

- Wait until the worker yields or completes (blocking-equivalent); capture its envelope unchanged as `{worker_result}`.

### 4. Account for the continuation

- Account for this continuation per [account-every-dispatch](./dispatch-activity.md#account-every-dispatch).
