---
metadata:
  version: 1.8.0
---

## Capability

Advance the session to the next activity and continue the worker already carrying the batch, under the delivery identity its dispatch bound.

## Inputs

### from_activity

The activity this advance retires — the one `{exit_id}`, `{step_manifest}` and `{variables_changed}` belong to.

### variables_changed

*(optional)* The bag writes of the activity this call retires: `variables_changed` from the `activity_complete` envelope that activity returned. Unset where this call retires no activity, or where that activity changed nothing.

### worker_agent_id

Server-side worker identity the batch is carried under — the identity the delivery ledger is keyed on.

## Outputs

### worker_result

The envelope the worker returned, passed through unchanged — one of two tagged result types: the `checkpoint_pending` envelope, or the `activity_complete` envelope.

### worker_agent_id

The identity now holding the advanced activity: the one the batch was carried under when the continuation succeeded, or a freshly minted one when it did not and a replacement was spawned in its place.

### advance_trace_tokens

The opaque trace token the advancing `next_activity` call returned in `_meta.trace_token`, as a one-entry list. Empty when the server returned none.

## Protocol

### 1. Advance the session

- Call `next_activity { session_index, activity_id, from_activity, exit: exit_id, step_manifest, variables_changed, agent_id: worker_agent_id }`; capture `_meta.trace_token` per `dispatch-activity.accumulate-trace-per-advance`.
  > This call is the transition a commit has to precede (`commit-and-persist.commit-after-activity`). Where the finished activity has not landed, commit it first.

### 2. Compose the continuation stub

- Apply [compose-prompt](./compose-prompt.md) with `agent_technique: workflow-engine::activity-worker`, `holds_prior_deliveries: true`, and `{variable_bag}` as substitutions, binding `activity_id` to the advanced activity and `agent_id` to `{worker_agent_id}`.

### 3. Continue the worker

- Apply [harness-compat](../harness-compat/TECHNIQUE.md)::[continue-agent](../harness-compat/continue-agent.md) with `agent_id` the harness identifier of the agent carrying `{worker_agent_id}`, the composed prompt as `composed_prompt`, and `{session_index}`.

### 4. Await the envelope

- Wait until the worker yields or completes (blocking-equivalent); capture its envelope unchanged as `{worker_result}` and return `{worker_agent_id}` unchanged.
  > A continuation returning no accepted envelope — the harness reports the worker ended, or what came back is not one of the two tagged results (`dispatch-activity.reject-partial-worker-result`), which is also how a server refusal of the advanced activity surfaces — ends the batch here. Replace the context below.

### 5. Replace a spent context

- Mint a new `{worker_agent_id}` per `dispatch-activity.delivery-keys-on-agent-context`, apply [compose-prompt](./compose-prompt.md) with `agent_technique: workflow-engine::activity-worker`, `holds_prior_deliveries: false`, and `{variable_bag}` as substitutions with `activity_id` bound to the advanced activity and `agent_id` to the identity just minted, then [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-agent](../harness-compat/spawn-agent.md) for the SAME advanced `{activity_id}`, and return `{worker_agent_id}` and the replacement's envelope as `{worker_result}`. Holding no prior deliveries, the replacement takes the advanced activity in full

### 6. Account for the activity

- Account for `{activity_id}` — this activity of the batch — per `dispatch-activity.account-every-activity`.

## Rules

### one-advance-per-activity

This technique advances the session pointer, so it owns getting a worker onto the activity it advanced to — the held one, or a replacement it spawns itself. It does not hand that job back to [dispatch-activity](./dispatch-activity.md), which advances the pointer of its own accord: a second advance onto an activity already current records that activity as exited and complete before a worker has walked a step of it.

So a batch that cannot continue ends inside this technique.
