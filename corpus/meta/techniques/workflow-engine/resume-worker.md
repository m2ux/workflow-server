---
metadata:
  version: 1.7.0
---

## Capability

Continue the worker that already holds an activity under the delivery identity its dispatch bound, or replace it where that context is gone.

## Inputs

### session_index

`session_index` of the worker being continued.

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

### worker_agent_id

The identity now holding the activity: the one the worker was continued under when the continuation succeeded, or a freshly minted one when it did not and a replacement was spawned in its place.

## Protocol

### 1. Compose the continuation stub

- Apply [compose-prompt](./compose-prompt.md) with `agent_technique: workflow-engine::activity-worker`, `holds_prior_deliveries: true`, and `{state}` as substitutions, binding `agent_id` to `{worker_agent_id}` and carrying `{effects}`. The worker role is what carries the duty to return an envelope, and `{effects}` is what makes the stub clear the gate first.

### 2. Continue the worker

- Apply [harness-compat](../harness-compat/TECHNIQUE.md)::[continue-agent](../harness-compat/continue-agent.md) with the composed prompt and `{session_index}`.

### 3. Await the envelope

- Wait until the worker yields or completes (blocking-equivalent); capture its envelope unchanged as `{worker_result}` and return `{worker_agent_id}` unchanged.
  > A continuation returning no accepted envelope — the harness reports the worker ended, or what came back is not one of the two tagged results (reject-partial-worker-result) — is a context that is gone, with nothing further to arrive from it. Replace it below.

### 4. Replace a context that is gone

- Mint a new `{worker_agent_id}` per [delivery-keys-on-agent-context](./dispatch-activity.md#delivery-keys-on-agent-context), apply [compose-prompt](./compose-prompt.md) with `agent_technique: workflow-engine::activity-worker`, `holds_prior_deliveries: false`, no `effects`, and `{state}` as substitutions with `agent_id` bound to the identity just minted, then [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-agent](../harness-compat/spawn-agent.md) for the SAME `{activity_id}`; return that identity with the replacement's envelope
  > Bind `agent_id` to the minted identity rather than the one that is gone — the ledger keyed on the dead context credits the replacement with deliveries it never received.

### 5. Record the continuation's cost

- Account for this continuation of `{activity_id}` per [account-every-activity](./dispatch-activity.md#account-every-activity).

## Rules

### a-replacement-repeats-the-work-not-the-question

A checkpoint response is keyed by activity and checkpoint with no agent component, so a replacement worker re-crossing an answered gate takes the stored answer and the user is not asked twice. The steps before that gate do run a second time, side effects and all, which is the price this recovery pays and the reason it is reached for a context that is gone rather than one that answered badly.
