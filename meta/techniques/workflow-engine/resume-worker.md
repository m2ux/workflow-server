---
metadata:
  version: 1.4.0
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
- When the continuation returns no accepted envelope — the harness reports the worker ended, or what came back is not one of the two tagged results ([reject-partial-worker-result](./dispatch-activity.md#reject-partial-worker-result)) — that context is gone and nothing further will arrive from it. Mint a new `{worker_agent_id}` per [delivery-keys-on-agent-context](./dispatch-activity.md#delivery-keys-on-agent-context), apply [compose-prompt](./compose-prompt.md) with `agent_technique: workflow-engine::activity-worker`, `holds_prior_deliveries: false`, no `effects`, and `{state}` as substitutions with `agent_id` bound to the identity just minted — not the dead one, or the ledger credits the replacement to a context that never received it — then [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-agent](../harness-compat/spawn-agent.md) for the SAME `{activity_id}`; return that identity with the replacement's envelope. The replacement takes the activity in full and re-crosses the answered gate without asking again — a checkpoint response is keyed by activity and checkpoint with no agent component, so the server replays the answer already given and the user is not asked twice. It does re-execute the steps before that gate, so their side effects run a second time; that is the price of the recovery, and it is why the branch is for a context that is gone rather than one that answered badly.

### 4. Account for the continuation

- Account for this continuation of `{activity_id}` per [account-every-activity](./dispatch-activity.md#account-every-activity).
