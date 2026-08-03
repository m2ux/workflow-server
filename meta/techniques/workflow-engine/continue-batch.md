---
metadata:
  version: 1.1.0
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

The identity now holding the advanced activity: the one the batch was carried under when the continuation succeeded, or a freshly minted one when it did not and a replacement was spawned in its place.

## Protocol

### 1. Advance the session

- Call `next_activity { session_index, activity_id, step_manifest, agent_id: worker_agent_id }`; capture `_meta.trace_token` and accumulate it per [dispatch-activity](./dispatch-activity.md) step 2. `agent_id` names the context whose technique fetches the manifest is checked against — one identity now covers several activities, so an unattributed manifest credits any agent.
- The commit for the activity just finished has already landed, so this advance is the transition it precedes ([commit-after-activity](./commit-and-persist.md#commit-after-activity)).

### 2. Compose the continuation stub

- Apply [compose-prompt](./compose-prompt.md) with `agent_technique: workflow-engine::activity-worker`, `holds_prior_deliveries: true`, and `{state}` as substitutions, binding `activity_id` to the advanced activity and `agent_id` to `{worker_agent_id}`.

### 3. Continue the worker

- Apply [harness-compat](../harness-compat/TECHNIQUE.md)::[continue-agent](../harness-compat/continue-agent.md) with the composed prompt and `{session_index}`.

### 4. Await the envelope

- Wait until the worker yields or completes (blocking-equivalent); capture its envelope unchanged as `{worker_result}` and return `{worker_agent_id}` unchanged.
- When the continuation returns no accepted envelope — the harness reports the worker ended, or what came back is not one of the two tagged results ([reject-partial-worker-result](./dispatch-activity.md#reject-partial-worker-result)), which is also how a server refusal of the advanced activity surfaces — the batch ends here. Mint a new `{worker_agent_id}` per [delivery-keys-on-agent-context](./dispatch-activity.md#delivery-keys-on-agent-context), apply [compose-prompt](./compose-prompt.md) with `holds_prior_deliveries: false` and [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-agent](../harness-compat/spawn-agent.md) for the SAME advanced `{activity_id}`, and return that identity with the replacement's envelope. The replacement takes full delivery and re-crosses any answered gate silently.

### 5. Account for the activity

- Account for this activity of the batch per [account-every-activity](./dispatch-activity.md#account-every-activity).

## Rules

### batch-continues-only-with-room

Continue the held worker only while its last `activity_complete` reports both `batch_may_continue: true` and a next activity. The loop's own gate carries that condition, so a spent batch cannot reach this operation — the check is the gate rather than this sentence, because a bound carried by rule text is the failure this whole mechanism replaces ([batch-is-bounded-by-the-server](./dispatch-activity.md#batch-is-bounded-by-the-server)).

`batch_may_continue` is read when the worker takes an activity, so it cannot account for what that worker then fetched lazily while running it. A batch reported as having room can still be refused at the next boundary. That refusal is expected rather than exceptional, and is met by ending the batch here and spawning the replacement — not by predicting it more precisely.

### one-advance-per-activity

This operation advances the session pointer, so it owns getting a worker onto the activity it advanced to — the held one, or a replacement it spawns itself. It does not hand that job back to [dispatch-activity](./dispatch-activity.md), which advances the pointer of its own accord: a second advance onto an activity already current records that activity as exited and complete before a worker has walked a step of it, and every later reader of the session — resume, status, activity-manifest validation — believes it.

So a batch that cannot continue ends inside this operation, and the only paths that reach `dispatch-activity` are the ones where no advance has happened yet: the first activity of a walk, and the activity after a spent batch was released.

### batch-stops-at-a-human-boundary

A boundary crossed in seconds is cheap to resume across; a boundary waiting on a person is not, because a resumed context is re-written rather than read from cache and a prompt cache does not survive a wait measured in hours. Continue a batch across an activity boundary, whose gap is the orchestrator's commit. A gate answered by a user is the checkpoint path's business ([resume-worker](./resume-worker.md)), and batching across it saves nothing.
