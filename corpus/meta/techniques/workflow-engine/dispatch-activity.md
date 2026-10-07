---
metadata:
  version: 1.32.0
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
  > - Publish the mark before the worker spawns, per `dispatch-mark-reaches-the-remote`: apply [git::commit-regular-files](/git/techniques/commit-regular-files.md) with `paths` naming the planning folder `README.md` alone and a message stating which activity is entering progress, then apply [git::push-branch](/git/techniques/push-branch.md) with `repo_path` `.`, `branch` = current, and `remote_name` `origin`.

### 2. Advance Session

- Call `next_activity { session_index, activity_id, from_activity, exit: exit_id, step_manifest, variables_changed }`; capture `_meta.trace_token` per `accumulate-trace-per-advance`.
  > - A dispatch whose activity ran steps carries one `step_manifest` entry per completed step; the server validates step completion against it and reports a gap when it is absent.
  > - A first dispatch has no prior worker context to attribute the manifest to, so `agent_id` is omitted here; a continuation names one ([continue-batch](./continue-batch.md)).
  > - When `{activity_id}` is `__terminal__`, this advance completes the session: return the `workflow_complete` envelope as `{worker_result}`, and end here.
  > - When `{stands_on_activity}` is true, skip this phase.

### 3. Compose Worker Stub

- Mint `{worker_agent_id}` for this dispatch per `delivery-keys-on-agent-context`, then apply [compose-prompt](./compose-prompt.md) with `{agent_technique}`, `holds_prior_deliveries: false` (a minted identity holds nothing), and `{variable_bag}` as substitutions (include `session_index`, `workflow_id`, `activity_id`, and `{worker_agent_id}` as `agent_id`).

### 4. Spawn And Await Worker

- Apply [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-agent](../harness-compat/spawn-agent.md) with the composed prompt; await the worker's envelope and return it unchanged as `{worker_result}`.
  > - When the harness reports the worker ended without returning an envelope, dispatch a fresh worker for the same `{activity_id}`, which mints its own identity.
  > - When the harness still reports the worker live and what came back is not an accepted result (`reject-partial-worker-result`), apply [harness-compat](../harness-compat/TECHNIQUE.md)::[continue-agent](../harness-compat/continue-agent.md) under `{worker_agent_id}` with explicit instructions to finish what the result left undone and return the envelope.

### 5. Record Activity Cost

- Account for this activity, and for any replacement worker dispatched for the same `{activity_id}`, per `account-every-activity`.

### 6. Reconcile Routing State

- Reconcile any critical routing or path variable an orchestrator decision depends on: compare the session record against the just-completed worker's `activity_complete` envelope, and against planning-folder evidence when the two still leave it uncertain (`distrust-then-reconcile`).

### 7. Read Resolved Routing

- On `activity_complete`, read `{worker_result.next_activity_id}` and `{worker_result.activity_exit}` as the authoritative next-activity routing — the worker resolved both against the activity's exits and the exit destinations its delivery carried, via [finalize-activity](./finalize-activity.md).
  > - On a **blocked** signal from the worker or the harness, apply [sync-progress-status](./sync-progress-status.md) for the blocked moment in [Progress Status call sites](/meta/resources/planning-readme.md#progress-status-call-sites) for `{activity_id}` before surfacing or retrying.
  > - When the path **skips / cancels** an activity without running it, apply [sync-progress-status](./sync-progress-status.md) for the path-skip / cancel moment in [Progress Status call sites](/meta/resources/planning-readme.md#progress-status-call-sites) for that activity's rows.
## Rules

### dispatch-mark-reaches-the-remote

A Progress mark is unreadable to anyone who does not hold the working tree it was written in, and the mark for a running activity exists for a reader watching from the remote. That mark is also short-lived: [commit-and-persist](./commit-and-persist.md) writes the completion status onto the same cell once the activity finishes, so any commit made after the activity ends carries the outcome and never the dispatch. Both together fix the window: the only commit that can publish the in-progress state is one made while the activity is still in flight.

### account-every-activity

Every activity carries exactly one usage entry, recorded with `record_usage { session_index, activity, usage, basis, agent_id: worker_agent_id }` — the first worker, each continuation, each activity of a batch, each replacement worker, and any dispatch made out of band alike. A dispatch carrying a run of activities records a figure at each activity boundary and says what that figure counts, read from the harness rather than assumed, so cost keeps a figure per activity; the bound those figures inform is the server's, not this technique's (`batch-is-bounded-by-the-server`). Cost travels on its own entry, so coverage follows the activities rather than the graph: the terminal activity's own entry and anything after the final transition carry one like any other. A worker cannot self-measure, so an activity with no entry is one whose harness reported nothing, never one that cost zero — where the harness surfaces no figure the entry is omitted rather than zeroed.

### distrust-then-reconcile

Where the session record and a just-completed worker's `activity_complete` envelope (`variables_changed` and related fields) disagree on routing or path state, the envelope governs, and the discrepancy is logged.

### accumulate-trace-per-advance

Every `next_activity` returning `_meta.trace_token` has that token in the `advance_trace_tokens` its operation returns — the first advance of a dispatch, each continuation of a batch ([continue-batch](./continue-batch.md)), the call that opens a fan, and each branch a fan retires ([retire-branch](../fan/retire-branch.md)). The walk appends each operation's tokens to the run's `trace_tokens[]`, the whole execution history close-out reads, so a token dropped at any of those call sites is history no later reader can recover.

### resolve-trace-at-close-out

The walk's close-out resolves the run's accumulated `trace_tokens[]` once via `get_trace { session_index, trace_tokens }`, optionally with `inspect_session` for fetch and fidelity context. That resolve reads the whole run where a per-activity `get_trace` reads one advance, and each token carries its own events, so the tokens hold the run across a server restart. Tokens stay opaque until that resolve. Where `trace_tokens` is empty, the resolved trace is empty.

### say-what-a-dispatch-is-doing

Leave the user no silent minute. Before spawning, tell them what is about to run, which gate their answer is next needed at — the first checkpoint of that activity, or that it runs to completion without one — and how long a comparable dispatch took where the session record carries a figure. Where a wait falls between one activity and the next, say that they are waiting and roughly how long, without an account of the machinery imposing it.

A dispatch produces nothing the user can read while it runs, and a gate arrives whenever the worker reaches one. So a cost not quoted before it is spent reads as a stall, and a gate nobody was told to expect arrives to someone who has stopped watching. What a completed activity delivered is a separate emission, per the [Run Status Guide](/meta/resources/run-status.md), made once its artifacts are on the remote.

### dispatch-topology

Client walks dispatch workers via this technique, each worker carrying a bounded run of activities and continued across each activity boundary by [continue-batch](./continue-batch.md). The bound is the server's, enforced at delivery — see `batch-is-bounded-by-the-server`. Do not set `context_mode: "persistent"` on worker-dispatched sessions — see `delivery-keys-on-agent-context`.

Where the exit taken is bound to several branches rather than one activity, the [fan](../fan/TECHNIQUE.md) group carries them instead: one call opens every branch, they run in one turn under their own identities, and the run continues from the activity they converge on. That group's width is the destination's, and it is not a batch — a branch takes one activity and is not continued.

### no-get-activity-from-orchestrator

Workflow orchestrators NEVER call `get_activity`.

### no-pre-load-techniques

NEVER call `get_technique` to pre-load techniques for the worker. Step techniques load on the worker via `activity-worker.progressive-step-technique-load`.

### delivery-keys-on-agent-context

Delivery mode follows the agent context, not the session: one worker `agent_id` per worker, bound at dispatch and held for as long as that worker carries its batch, and the server scopes its ledger to that context (`agent-id-scopes-delivery`). A first dispatch is a fresh context holding no prior deliveries, so it takes full delivery; the same context collapses what it already received, whether it is resumed on the activity it holds ([resume-worker](./resume-worker.md)) or advanced to the next activity of its batch ([continue-batch](./continue-batch.md)). The orchestrator releases the identity when the batch is spent ([workflow-orchestrator](./workflow-orchestrator.md)), and a retry that spawns a NEW worker for the same activity is a new context, taking full delivery again. `context_mode: "persistent"` stays off worker-dispatched sessions.

### batch-is-bounded-by-the-server

A worker's batch is bounded at delivery, not by this technique's judgement: the server refuses the next activity once that context has been delivered the cap of distinct activities or accumulated more delivery than its batch budget allows, and answers where a context stands against the activity an advance moves onto. So the orchestrator does not size a batch, hold a count, or reason about context load — it continues a worker while the advance that retires an activity reports room for the next one. That answer is read at the boundary, after everything the finished activity fetched has drawn down the same budget, so it is the standing the next delivery will be measured against; a context it refuses is replaced for that activity ([continue-batch](./continue-batch.md)), which is an ordinary outcome rather than a fault.

### reject-partial-worker-result

An accepted result is one of the two tagged envelopes — `checkpoint_pending` or `activity_complete` — carrying the fields that envelope requires. An interim status report, a progress table, a narrative of work still in flight, or prose describing an envelope without being one is not an accepted result. Neither is an envelope reporting fewer steps than the activity defines, or leaving a required checkpoint without a response.

