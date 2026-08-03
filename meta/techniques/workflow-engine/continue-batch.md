---
metadata:
  version: 1.0.0
---

## Capability

Advance the session to the next activity and continue the worker already carrying the batch, under the delivery identity its dispatch bound.

## Inputs

### session_index

`session_index` of the session being advanced.

### activity_id

Next activity for the worker to walk — the target of this advance.

### worker_agent_id

Server-side worker identity the batch is carried under — the identity the delivery ledger is keyed on.

### step_manifest

One entry per step the just-finished activity completed, for the server's step-completion validation.

### state

Current variable state for stub substitution (`session_index`, `workflow_id`, `activity_id`, …).

## Outputs

### worker_result

The envelope the worker returned, passed through unchanged — one of two tagged result types: the `checkpoint_pending` envelope, or the `activity_complete` envelope.

## Protocol

### 1. Advance the session

- Call `next_activity { session_index, activity_id, step_manifest }`; capture `_meta.trace_token` and accumulate it per [dispatch-activity](./dispatch-activity.md) step 2.
- The commit for the activity just finished has already landed, so this advance is the transition it precedes ([commit-after-activity](./commit-and-persist.md#commit-after-activity)).

### 2. Compose the continuation stub

- Apply [compose-prompt](./compose-prompt.md) with `agent_technique: workflow-engine::activity-worker` and `{state}` as substitutions, binding `activity_id` to the advanced activity and `agent_id` to `{worker_agent_id}`.

### 3. Continue the worker

- Apply [harness-compat](../harness-compat/TECHNIQUE.md)::[continue-agent](../harness-compat/continue-agent.md) with the composed prompt and `{session_index}`.

### 4. Await the envelope

- Wait until the worker yields or completes (blocking-equivalent); capture its envelope unchanged as `{worker_result}`.

### 5. Account for the activity

- Account for this activity of the batch per [account-every-activity](./dispatch-activity.md#account-every-activity).

## Rules

### batch-continues-only-with-room

Continue the held worker only when its last `activity_complete` reported `batch_may_continue: true`. The server bounds a batch at delivery and refuses an activity past the bound with nothing delivered, so continuing a worker the server will refuse costs a round trip and ends with a fresh dispatch anyway. A worker whose batch is spent is released and the next activity takes [dispatch-activity](./dispatch-activity.md).

### batch-stops-at-a-human-boundary

A boundary crossed in seconds is cheap to resume across; a boundary waiting on a person is not, because a resumed context is re-written rather than read from cache and a prompt cache does not survive a wait measured in hours. Continue a batch across an activity boundary, whose gap is the orchestrator's commit. A gate answered by a user is the checkpoint path's business ([resume-worker](./resume-worker.md)), and batching across it saves nothing.
