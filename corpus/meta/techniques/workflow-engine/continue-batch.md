---
metadata:
  version: 1.10.0
---

## Capability

Advance the session to the next activity and, where that advance leaves the held context room, continue the worker already carrying the batch under the delivery identity its dispatch bound.

## Inputs

### from_activity

The activity this advance retires — the one `{exit_id}`, `{step_manifest}` and `{variables_changed}` belong to.

### variables_changed

*(optional)* The bag writes of the activity this call retires: `variables_changed` from the `activity_complete` envelope that activity returned. Unset where this call retires no activity, or where that activity changed nothing.

### worker_agent_id

Server-side worker identity the batch is carried under — the identity the delivery ledger is keyed on.

### context_tokens

The declared window of the context the batch is carried under, in tokens — the same figure that context declares on its own delivery calls, and what its bound is measured against.

## Outputs

### worker_result

The envelope the continued worker returned, passed through unchanged — one of two tagged result types: the `checkpoint_pending` envelope, or the `activity_complete` envelope. Unset where the advance refused the held context or the continuation returned no accepted envelope.

### worker_agent_id

The identity the batch is carried under, returned unchanged. A refusal or a continuation that returned nothing leaves it held so the caller can release it before dispatching.

### continuation_held

Whether the held identity is the one now carrying the advanced activity. True where it continued and returned an accepted envelope. False where the advance refused that context or the continuation returned none.

### advance_trace_tokens

The opaque trace token the advancing `next_activity` call returned in `_meta.trace_token`, as a one-entry list. Empty when the server returned none.

## Protocol

### 1. Advance the session

- Call `next_activity { session_index, activity_id, from_activity, exit: exit_id, step_manifest, variables_changed, agent_id: worker_agent_id, context_tokens }`; capture `_meta.trace_token` per `dispatch-activity.accumulate-trace-per-advance`, and hold the `may_continue` its batch reading returns as `{$batch_has_room}` — this context's standing against `{activity_id}`, the activity just advanced onto.
  > This call is the transition a commit has to precede (`commit-and-persist.commit-after-activity`). Where the finished activity has not landed, commit it first.

### 2. Stop when the reading refuses

- Where `{batch_has_room}` is false, return `{continuation_held}` false, `{worker_agent_id}` unchanged, `{advance_trace_tokens}` as captured, and leave `{worker_result}` unset. End the technique here.
  > The pointer stands on the activity just entered. Nothing is composed for the held context, and this technique mints no identity. The caller releases `{worker_agent_id}` and dispatches for that activity with the session already standing on it.

### 3. Compose the continuation stub

- Apply [compose-prompt](./compose-prompt.md) with `agent_technique: workflow-engine::activity-worker`, `holds_prior_deliveries: true`, and `{variable_bag}` as substitutions, binding `activity_id` to the advanced activity and `agent_id` to `{worker_agent_id}`.

### 4. Continue the worker

- Apply [harness-compat](../harness-compat/TECHNIQUE.md)::[continue-agent](../harness-compat/continue-agent.md) with `agent_id` the harness identifier of the agent carrying `{worker_agent_id}`, the composed prompt as `composed_prompt`, and `{session_index}`.

### 5. Await the envelope

- Wait until the worker yields or completes (blocking-equivalent). Where the envelope is one of the two tagged results (`dispatch-activity.reject-partial-worker-result`), capture it unchanged as `{worker_result}`, return `{worker_agent_id}` unchanged, and return `{continuation_held}` true.
  > A continuation returning no accepted envelope — the harness reports the worker ended, or what came back is not one of those two results — returns `{continuation_held}` false, `{worker_agent_id}` unchanged, `{advance_trace_tokens}` as captured, and leaves `{worker_result}` unset. End the technique here. The caller releases the identity and dispatches for the activity the advance entered.

### 6. Account for the activity

- Account for `{activity_id}` — this activity of the batch — per `dispatch-activity.account-every-activity`.

## Rules

### advances-and-continues

This technique advances the session pointer and continues the identity the batch is carried under. It mints no identity. Where the reading refuses the activity just entered, or the continuation returns no accepted envelope, that identity stays held and the pointer stays on the activity: the caller releases the identity and dispatches for it, with the session already standing on it, so the dispatch makes no further advance.
