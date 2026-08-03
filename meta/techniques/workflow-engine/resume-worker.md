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

Server-side worker identity bound by the dispatch that spawned this worker — the identity the delivery ledger is keyed on.

### effects

Variable updates the resolved checkpoint returned, for the worker to apply to its local state.

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

### 3. Return the envelope

- Await the worker's envelope and return it unchanged as `{worker_result}`.

## Rules

### identity-outlives-the-gate

One identity spans every gate a dispatch pauses at, so the composed stub binds `{worker_agent_id}` however many times the worker is continued ([resume-preserves-delivery-scope](../harness-compat/continue-agent.md#resume-preserves-delivery-scope)).
