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

One entry per step the activity just finished completed, taken from that activity's `activity_complete` envelope, for the server's step-completion and technique-fetch validation.

### state

Current variable state for stub substitution (`session_index`, `workflow_id`, `activity_id`, …).

## Outputs

### worker_result

The envelope the worker returned, passed through unchanged — one of two tagged result types: the `checkpoint_pending` envelope, or the `activity_complete` envelope.

### worker_agent_id

The identity the batch is still carried under, or null when this continuation could not be completed — which releases the batch so the next step spawns a fresh worker for the same activity.

## Protocol

### 1. Advance the session

- Call `next_activity { session_index, activity_id, step_manifest, agent_id: worker_agent_id }`; capture `_meta.trace_token` and accumulate it per [dispatch-activity](./dispatch-activity.md) step 2. `agent_id` names the context whose technique fetches the manifest is checked against — one identity now covers several activities, so an unattributed manifest credits any agent.
- The commit for the activity just finished has already landed, so this advance is the transition it precedes ([commit-after-activity](./commit-and-persist.md#commit-after-activity)).

### 2. Compose the continuation stub

- Apply [compose-prompt](./compose-prompt.md) with `agent_technique: workflow-engine::activity-worker` and `{state}` as substitutions, binding `activity_id` to the advanced activity and `agent_id` to `{worker_agent_id}`.

### 3. Continue the worker

- Apply [harness-compat](../harness-compat/TECHNIQUE.md)::[continue-agent](../harness-compat/continue-agent.md) with the composed prompt and `{session_index}`.

### 4. Await the envelope

- Wait until the worker yields or completes (blocking-equivalent); capture its envelope unchanged as `{worker_result}` and return `{worker_agent_id}` unchanged.
- When the harness reports the worker ended without returning an envelope, or the worker reports that the server refused the activity because its batch is spent, return `{worker_agent_id}` as null. The batch ends there and [dispatch-activity](./dispatch-activity.md) spawns a fresh worker for the same activity, which takes full delivery and re-crosses any answered gate silently ([batch-release-frees-the-activity](#batch-release-frees-the-activity)).

### 5. Account for the activity

- Account for this activity of the batch per [account-every-activity](./dispatch-activity.md#account-every-activity).

## Rules

### batch-continues-only-with-room

Continue the held worker only while its last `activity_complete` reports both `batch_may_continue: true` and a next activity. The loop's own gate carries that condition, so a spent batch cannot reach this operation — the check is the gate rather than this sentence, because a bound carried by rule text is the failure this whole mechanism replaces ([batch-is-bounded-by-the-server](./dispatch-activity.md#batch-is-bounded-by-the-server)).

`batch_may_continue` is read when the worker takes an activity, so it cannot account for what that worker then fetched lazily while running it. A batch reported as having room can still be refused at the next boundary. That refusal is expected, not exceptional, and is handled by releasing the identity rather than by predicting it more precisely.

### batch-release-frees-the-activity

A batch that ends for any reason — spent, refused, or a worker that returned nothing — releases `{worker_agent_id}`, and nothing else releases it. Holding an identity a continuation cannot use is a loop that neither continues nor dispatches: the release is what lets the next step spawn a replacement, so it happens on every exit from a batch and not only on the tidy one.

### batch-stops-at-a-human-boundary

A boundary crossed in seconds is cheap to resume across; a boundary waiting on a person is not, because a resumed context is re-written rather than read from cache and a prompt cache does not survive a wait measured in hours. Continue a batch across an activity boundary, whose gap is the orchestrator's commit. A gate answered by a user is the checkpoint path's business ([resume-worker](./resume-worker.md)), and batching across it saves nothing.
