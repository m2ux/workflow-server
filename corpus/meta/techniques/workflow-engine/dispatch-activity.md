---
metadata:
  version: 1.34.0
---

## Capability

Transition the session to a target activity and spawn a worker to carry it, and the bounded run of activities behind it.

## Inputs

### from_activity

*(optional)* The activity this call retires — the one `{exit_id}`, `{step_manifest}` and `{variables_changed}` belong to. Unset where the session holds nothing to retire, which is the first dispatch of a walk.

### variables_changed

*(optional)* The bag writes of the activity this call retires: `variables_changed` from the `activity_complete` envelope that activity returned. Unset where this call retires no activity, or where that activity changed nothing.

### stands_on_activity

*(optional)* True where the session already stands on `{activity_id}`, the advance that entered it having been made. False or unset where this dispatch makes that advance.

### agent_technique

Canonical agent technique for the worker — default workflow-engine::activity-worker.

### planning_folder_path

*(optional)* Path to the planning folder whose `README.md` Progress surface is updated. Unset until the folder exists.

## Outputs

### worker_result

The envelope this entry closes on — one of three tagged result types. The `checkpoint_pending` envelope or the `activity_complete` envelope is the one the worker returned, passed through unchanged. The `workflow_complete` envelope, `{ result_type: "workflow_complete" }`, is the one an advance onto `__terminal__` closes on: the session is completed, and no worker ran.

### worker_agent_id

Server-side worker identity this dispatch bound — the identity the delivery ledger is keyed on. Unset on the `workflow_complete` envelope, which no worker returned.

### advance_trace_tokens

The opaque trace tokens this dispatch accumulated, one per `next_activity` call that returned `_meta.trace_token`. Empty when the server returned none.

## Protocol

### 1. Mark Activity Entering

- Apply [sync-progress-status](./sync-progress-status.md) with `{planning_folder_path}` for the dispatch moment in [Progress Status call sites](/meta/resources/planning-readme.md#progress-status-call-sites) (`activity_id={activity_id}`; `{target_status}` from that row / [Status vocabulary](/meta/resources/planning-readme.md#status-vocabulary)). Transitions follow [Status transition policy](/meta/resources/planning-readme.md#status-transition-policy).
  > - When `{planning_folder_path}` is unset, or `{activity_id}` is `__terminal__`, skip this phase.
  > - Publish the mark before the worker spawns: apply [git::commit-regular-files](/git/techniques/commit-regular-files.md) with `paths` naming the planning folder `README.md` alone and a message stating which activity is entering progress, then apply [git::push-branch](/git/techniques/push-branch.md) with `repo_path` `.`, `branch` = current, and `remote_name` `origin`.

### 2. Advance Session

- Call `next_activity { session_index, activity_id, from_activity, exit: exit_id, step_manifest, variables_changed }`; capture `_meta.trace_token` as `{advance_trace_tokens}`. The walk appends that token to the run's `trace_tokens`. A token not captured is absent from the trace close-out resolves.
  > - A dispatch whose activity ran steps carries one `step_manifest` entry per completed step; the server validates step completion against it and reports a gap when it is absent.
  > - A first dispatch has no prior worker context to attribute the manifest to, so `agent_id` is omitted here; a continuation names one ([continue-batch](./continue-batch.md)).
  > - When `{activity_id}` is `__terminal__`, this advance completes the session: return the `workflow_complete` envelope as `{worker_result}`, and end here.
  > - When `{stands_on_activity}` is true, skip this phase.

### 3. Compose Worker Stub

- Mint `{worker_agent_id}` for this dispatch per `delivery-keys-on-agent-context`, then apply [compose-prompt](./compose-prompt.md) with `{agent_technique}`, `holds_prior_deliveries: false` (a minted identity holds nothing), and `{variable_bag}` as substitutions (include `session_index`, `workflow_id`, `activity_id`, and `{worker_agent_id}` as `agent_id`).

### 4. Announce the Dispatch

- Leave the user no silent minute. Before the spawn, tell them what is about to run, which gate their answer is next needed at — the first checkpoint of that activity, or that the activity runs to completion without one — and how long a comparable dispatch took where the session record carries a figure. A dispatch produces nothing the user can read while it runs, and a gate arrives whenever the worker reaches one.
  > - Where a wait falls between one activity and the next, say that they are waiting and roughly how long, without an account of the machinery imposing the wait.
  > - A cost not quoted before it is spent reads as a stall, and a gate nobody was told to expect arrives to someone who has stopped watching.
  > - What a completed activity delivered is a separate emission, per the [Run Status Guide](/meta/resources/run-status.md), made once its artifacts are on the remote.

### 5. Spawn And Await Worker

- Apply [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-agent](../harness-compat/spawn-agent.md) with the composed prompt; await the worker's envelope and return it unchanged as `{worker_result}`.
  > - When the harness reports the worker ended without returning an envelope, dispatch a fresh worker for the same `{activity_id}`, which mints its own identity.
  > - When the harness still reports the worker live and what came back is not an accepted result (`reject-partial-worker-result`), apply [harness-compat](../harness-compat/TECHNIQUE.md)::[continue-agent](../harness-compat/continue-agent.md) under `{worker_agent_id}` with explicit instructions to finish what the result left undone and return the envelope.

### 6. Record Activity Cost

- Record one usage entry for this activity — the first worker, and a dispatch made out of band — and one for any replacement worker dispatched for the same `{activity_id}`: `record_usage { session_index, activity: activity_id, usage, basis, agent_id: worker_agent_id }`. `usage` and `basis` are read from the harness, and the entry says what the figure counts. Coverage follows the activities.
  > - A dispatch that carries a run of activities records a figure at each activity boundary, including the terminal activity and anything after the final transition. Each continuation and each activity of a batch records its own entry ([continue-batch](./continue-batch.md)).
  > - A worker does not record its own usage. When the harness reports no figure, omit the entry.

### 7. Reconcile Routing State

- Reconcile any critical routing or path variable an orchestrator decision depends on: compare the session record against the just-completed worker's `activity_complete` envelope, and against planning-folder evidence when the two still leave it uncertain (`distrust-then-reconcile`).

### 8. Read Resolved Routing

- On `activity_complete`, read `{worker_result.next_activity_id}` and `{worker_result.activity_exit}` as the authoritative next-activity routing — the worker resolved both against the activity's exits and the exit destinations its delivery carried, via [finalize-activity](./finalize-activity.md).
  > - On a **blocked** signal from the worker or the harness, apply [sync-progress-status](./sync-progress-status.md) for the blocked moment in [Progress Status call sites](/meta/resources/planning-readme.md#progress-status-call-sites) for `{activity_id}` before surfacing or retrying.
  > - When the path **skips / cancels** an activity without running it, apply [sync-progress-status](./sync-progress-status.md) for the path-skip / cancel moment in [Progress Status call sites](/meta/resources/planning-readme.md#progress-status-call-sites) for that activity's rows.
## Rules

### dispatch-mark-reaches-the-remote

A Progress mark is unreadable to anyone who does not hold the working tree it was written in, and the mark for a running activity exists for a reader watching from the remote. The commit that publishes the in-progress state is made while the activity is still in flight.

### account-every-activity

One usage entry per activity. The entry is omitted when the harness reports no figure, and is never recorded as zero.

### distrust-then-reconcile

Where the session record and a just-completed worker's `activity_complete` envelope (`variables_changed` and related fields) disagree on routing or path state, the envelope governs, and the discrepancy is logged.

### no-get-activity-from-orchestrator

Workflow orchestrators NEVER call `get_activity`.

### no-pre-load-techniques

This technique does not call `get_technique`.

### delivery-keys-on-agent-context

Delivery follows the worker `agent_id`, bound at dispatch and held for that worker's batch. A first dispatch, and a new worker for the same activity, each hold no prior deliveries and take full delivery. `context_mode: "persistent"` stays off these sessions.

### batch-is-bounded-by-the-server

A worker's batch is bounded at delivery. The server refuses the next activity once that context has been delivered the cap of distinct activities or accumulated more delivery than its batch budget allows, and reports where a context stands on every `get_activity`. This technique does not size a batch, hold a count, or reason about context load.

### reject-partial-worker-result

An accepted result is one of the two tagged envelopes — `checkpoint_pending` or `activity_complete` — carrying the fields that envelope requires. An interim status report, a progress table, a narrative of work still in flight, or prose describing an envelope without being one is not an accepted result. Neither is an envelope reporting fewer steps than the activity defines, or leaving a required checkpoint without a response.

