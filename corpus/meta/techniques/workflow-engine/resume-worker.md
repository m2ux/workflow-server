---
metadata:
  version: 1.7.0
---

## Capability

Continue the worker that already holds an activity under the delivery identity its dispatch bound, or replace it where that context is gone.

## Inputs

### worker_agent_id

Server-side worker identity the worker's dispatch bound — the identity the delivery ledger is keyed on.

### checkpoint_reply

*(optional)* The reply the server returned on clearing the checkpoint the worker yielded. Present only on a continuation past that gate.

## Outputs

### worker_result

The envelope the worker returned, passed through unchanged — one of two tagged result types: the `checkpoint_pending` envelope, or the `activity_complete` envelope.

### worker_agent_id

The identity now holding the activity: the one the worker was continued under when the continuation succeeded, or a freshly minted one when it did not and a replacement was spawned in its place.

## Protocol

### 1. Compose the continuation stub

- Apply [compose-prompt](./compose-prompt.md) with `agent_technique: workflow-engine::activity-worker`, `holds_prior_deliveries: true`, and `{variable_bag}` as substitutions, binding `agent_id` to `{worker_agent_id}` and carrying `{checkpoint_reply}`.

### 2. Continue the worker

- Apply [harness-compat](../harness-compat/TECHNIQUE.md)::[continue-agent](../harness-compat/continue-agent.md) with `agent_id` the harness identifier of the agent carrying `{worker_agent_id}`, the composed prompt as `composed_prompt`, and `{session_index}`.

### 3. Await the envelope

- Wait until the worker yields or completes (blocking-equivalent); capture its envelope unchanged as `{worker_result}` and return `{worker_agent_id}` unchanged.
  > A continuation returning no accepted envelope — the harness reports the worker ended, or what came back is not one of the two tagged results (`dispatch-activity.reject-partial-worker-result`) — is a context that is gone, with nothing further to arrive from it. Replace it below.

### 4. Replace a context that is gone

- Mint a new `{worker_agent_id}` per `dispatch-activity.delivery-keys-on-agent-context`, apply [compose-prompt](./compose-prompt.md) with `agent_technique: workflow-engine::activity-worker`, `holds_prior_deliveries: false`, no `checkpoint_reply`, and `{variable_bag}` as substitutions with `agent_id` bound to the identity just minted, then [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-agent](../harness-compat/spawn-agent.md) for the SAME `{activity_id}`; return `{worker_agent_id}` and the replacement's envelope as `{worker_result}`
  > - Bind `agent_id` to the minted identity rather than the one that is gone — the ledger keyed on the dead context credits the replacement with deliveries it never received.
  > - A replacement re-crossing an answered gate takes the answer already given, whichever context crosses it, so the user is not asked twice. The steps before that gate run a second time, side effects and all.

### 5. Account for the continuation

- Account for this continuation of `{activity_id}` per `dispatch-activity.account-every-activity`.
