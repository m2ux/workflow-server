---
metadata:
  version: 1.3.0
---

## Capability

Advance the session to the next activity and continue the worker already carrying the batch, under the delivery identity its dispatch bound. Reached only across an activity boundary; a gate answered by a user takes `resume-worker` instead.

## Inputs

### session_index

`session_index` of the session being advanced.

### activity_id

Next activity for the worker to walk — the target of this advance.

### worker_agent_id

Server-side worker identity the batch is carried under — the identity the delivery ledger is keyed on.

### step_manifest

One entry per step of the activity the worker just finished — `steps_completed` from the `activity_complete` envelope the preceding dispatch or continuation returned. Feeds the server's step-completion and technique-fetch validation.

### substitution_state

Current variable state for stub substitution (`session_index`, `workflow_id`, `activity_id`, …).

## Outputs

### worker_result

The envelope the worker returned, passed through unchanged — one of two tagged result types: the `checkpoint_pending` envelope, or the `activity_complete` envelope.

### worker_agent_id

The identity now holding the advanced activity: the one the batch was carried under when the continuation succeeded, or a freshly minted one when it did not and a replacement was spawned in its place.

## Protocol

### 1. Advance the session

- Call `next_activity { session_index, activity_id, step_manifest, agent_id: worker_agent_id }`; capture `_meta.trace_token` and accumulate it per [dispatch-activity](./dispatch-activity.md) step 2. `agent_id` names the context whose technique fetches the manifest is checked against; one identity covers several activities, and an unattributed manifest credits any agent.
- Advance only where the finished activity is already committed: this call is the transition that commit has to precede ([commit-after-activity](./commit-and-persist.md#commit-after-activity)). Where it has not landed, commit it first.

### 2. Compose the continuation stub

- Apply [compose-prompt](./compose-prompt.md) with `agent_technique: workflow-engine::activity-worker`, `holds_prior_deliveries: true`, and `{substitution_state}` as substitutions, binding `activity_id` to the advanced activity and `agent_id` to `{worker_agent_id}`.

### 3. Continue the worker

- Apply [harness-compat](../harness-compat/TECHNIQUE.md)::[continue-agent](../harness-compat/continue-agent.md) with the composed prompt and `{session_index}`.

### 4. Await the envelope

- Wait until the worker yields or completes (blocking-equivalent); capture its envelope unchanged as `{worker_result}` and return `{worker_agent_id}` unchanged.
- When the continuation returns no accepted envelope — the harness reports the worker ended, or what came back is not one of the two tagged results ([reject-partial-worker-result](./dispatch-activity.md#reject-partial-worker-result)), which is also how a server refusal of the advanced activity surfaces — the batch ends here. Mint a new `{worker_agent_id}` per [delivery-keys-on-agent-context](./dispatch-activity.md#delivery-keys-on-agent-context), apply [compose-prompt](./compose-prompt.md) with `holds_prior_deliveries: false` and [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-agent](../harness-compat/spawn-agent.md) for the SAME advanced `{activity_id}`, and return that identity with the replacement's envelope. The replacement holds no prior deliveries, so it takes the advanced activity in full.

### 5. Account for the activity

- Account for `{activity_id}` — this activity of the batch — per [account-every-activity](./dispatch-activity.md#account-every-activity).

## Rules

### one-advance-per-activity

This operation advances the session pointer, so it owns getting a worker onto the activity it advanced to — the held one, or a replacement it spawns itself. It does not hand that job back to [dispatch-activity](./dispatch-activity.md), which advances the pointer of its own accord: a second advance onto an activity already current records that activity as exited and complete before a worker has walked a step of it, and every later reader of the session — resume, status, activity-manifest validation — believes it.

So a batch that cannot continue ends inside this operation, and the only paths that reach `dispatch-activity` are the ones where no advance has happened yet: the first activity of a walk, and the activity after the orchestrator released a spent batch's identity ([delivery-keys-on-agent-context](./dispatch-activity.md#delivery-keys-on-agent-context)).
