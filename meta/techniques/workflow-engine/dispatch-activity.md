---
metadata:
  version: 1.21.0
---

## Capability

Transition the session to a target activity and spawn a worker to carry it, and the bounded run of activities behind it.

## Inputs

### session_index

`session_index` of the session whose activity is being dispatched

### activity_id

Activity ID to enter.

### agent_technique

Canonical agent technique for the worker — default workflow-engine::activity-worker.

### state

Current variable state for stub substitution (`session_index`, `workflow_id`, `activity_id`, `agent_id`, …)

### planning_folder_path

*(optional)* Path to the planning folder whose `README.md` Progress surface is updated. Unset until the folder exists.

## Outputs

### worker_result

The envelope the worker returned, passed through unchanged — one of two tagged result types: the `checkpoint_pending` envelope, or the `activity_complete` envelope.

### worker_agent_id

Server-side worker identity this dispatch bound — the identity the delivery ledger is keyed on.

### trace_tokens

The opaque HMAC-signed trace tokens this dispatch accumulated, one per `next_activity` call that returned `_meta.trace_token`. Empty when the server returned none; the close-out path resolves the list once, and individual tokens stay opaque.

## Protocol

1. **Progress in-progress:** Apply [sync-progress-status](./sync-progress-status.md) with `{planning_folder_path}` for the dispatch moment in [Progress Status call sites](../../../meta/resources/planning-readme.md#progress-status-call-sites) (`activity_id={activity_id}`; `{target_status}` from that row / [Status vocabulary](../../../meta/resources/planning-readme.md#status-vocabulary)). Transitions follow [Status transition policy](../../../meta/resources/planning-readme.md#status-transition-policy).
   > - When `{planning_folder_path}` is unset, skip this phase.
   > - Publish the mark before the worker spawns, per [dispatch-mark-reaches-the-remote](#dispatch-mark-reaches-the-remote): apply [version-control::commit-regular-files](../version-control/commit-regular-files.md) with `paths` naming the planning folder `README.md` alone, a message stating which activity is entering progress, and `branch` = current.
2. Call `next_activity { session_index, activity_id, step_manifest }`; capture `_meta.trace_token`.
   - **`step_manifest`:** a dispatch whose activity ran steps carries one manifest entry per completed step — the server validates step completion against it, and reports a gap when it is absent. A first dispatch has no prior worker context to attribute it to, so `agent_id` is omitted here; a continuation names one ([continue-batch](./continue-batch.md)).
   - **Trace accumulate (required):** when `_meta.trace_token` is present, append it to `trace_tokens[]`. Tokens stay opaque — no routine per-activity `get_trace`. Live `_meta.validation` self-correct remains; do not resolve tokens mid-run (close-out resolve is [resolve-trace-at-close-out](#resolve-trace-at-close-out)).
3. Mint `{worker_agent_id}` for this dispatch per [delivery-keys-on-agent-context](#delivery-keys-on-agent-context), then apply [compose-prompt](./compose-prompt.md) with `{agent_technique}`, `holds_prior_deliveries: false` (a minted identity holds nothing), and `{state}` as substitutions (include `session_index`, `workflow_id`, `activity_id`, and `{worker_agent_id}` as `agent_id`).
4. Apply [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-agent](../harness-compat/spawn-agent.md) with the composed prompt; await the worker's envelope and return it unchanged as `{worker_result}`.
   > - When the harness reports the worker ended without returning an envelope, dispatch a fresh worker for the same `{activity_id}`, which mints its own identity.
   > - When the harness still reports the worker live and what came back is not an accepted result ([reject-partial-worker-result](#reject-partial-worker-result)), apply [harness-compat](../harness-compat/TECHNIQUE.md)::[continue-agent](../harness-compat/continue-agent.md) under `{worker_agent_id}` with explicit instructions to finish what the result left undone and return the envelope.
5. Account for this activity, and for any replacement worker dispatched for the same `{activity_id}`, per [account-every-activity](#account-every-activity).
6. Reconcile any critical routing or path variable an orchestrator decision depends on: compare the session record against the just-completed worker's `activity_complete` envelope, and against planning-folder evidence when the two still leave it uncertain ([distrust-then-reconcile](#distrust-then-reconcile)).
7. On `activity_complete`, read `{worker_result.next_activity_id}` and `{worker_result.activity_exit}` as the authoritative next-activity routing, and pass the exit to `next_activity` — the worker resolved both against the activity's exits and the workflow graph via [finalize-activity](./finalize-activity.md).
   > - On a **blocked** signal from the worker or the harness, apply [sync-progress-status](./sync-progress-status.md) for the blocked moment in [Progress Status call sites](../../../meta/resources/planning-readme.md#progress-status-call-sites) for `{activity_id}` before surfacing or retrying.
   > - When the path **skips / cancels** an activity without running it, apply [sync-progress-status](./sync-progress-status.md) for the path-skip / cancel moment in [Progress Status call sites](../../../meta/resources/planning-readme.md#progress-status-call-sites) for that activity's rows.

## Rules

### dispatch-mark-reaches-the-remote

A Progress mark is unreadable to anyone who does not hold the working tree it was written in, and the mark for a running activity exists for a reader watching from the remote. That mark is also short-lived: [commit-and-persist](./commit-and-persist.md) writes the completion status onto the same cell once the activity finishes, so any commit made after the activity ends carries the outcome and never the dispatch. Both together fix the window: the only commit that can publish the in-progress state is one made while the activity is still in flight.

### account-every-activity

Every activity carries exactly one usage entry, recorded with `record_usage { session_index, activity, usage, agent_id: worker_agent_id }` — the first worker, each continuation, each activity of a batch, each replacement worker, and any dispatch made out of band alike. A dispatch carrying a run of activities records the delta at each activity boundary, so cost keeps a figure per activity; the bound those figures inform is the server's, not this operation's ([batch-is-bounded-by-the-server](#batch-is-bounded-by-the-server)). Cost travels on its own entry, so coverage follows the activities rather than the graph: the terminal activity's own entry and anything after the final transition carry one like any other. A worker cannot self-measure, so an activity with no entry is one whose harness reported nothing, never one that cost zero — where the harness surfaces no figure the entry is omitted rather than zeroed.

### distrust-then-reconcile

Where the session record and a just-completed worker's `activity_complete` envelope (`variables_changed` and related fields) disagree on routing or path state, the envelope governs, and the discrepancy is logged.

### resolve-trace-at-close-out

Client finalize/retrospective paths that consume execution history MUST resolve accumulated `trace_tokens[]` once via `get_trace { session_index, trace_tokens }` (optionally `inspect_session` for fetch/fidelity context). This operation owns the accumulate half of the contract; the client's close-out path owns the resolve. Skip resolve when `trace_tokens` is empty.

### say-what-a-dispatch-is-doing

Leave the user no silent minute. Before spawning, tell them what is about to run, which gate their answer is next needed at — the first checkpoint of that activity, or that it runs to completion without one — and how long a comparable dispatch took where the session record carries a figure. Where a wait falls between one activity and the next, say that they are waiting and roughly how long, without an account of the machinery imposing it.

A dispatch produces nothing the user can read while it runs, and a gate arrives whenever the worker reaches one. So a cost not quoted before it is spent reads as a stall, and a gate nobody was told to expect arrives to someone who has stopped watching. What a completed activity delivered is a separate emission, in the shape [run-status-shape](./TECHNIQUE.md#run-status-shape) declares, made once its artifacts are on the remote.

### no-get-activity-from-orchestrator

Workflow orchestrators NEVER call `get_activity`.

### no-pre-load-techniques

NEVER call `get_technique` to pre-load techniques for the worker. Step techniques load on the worker via [progressive-step-technique-load](./TECHNIQUE.md#progressive-step-technique-load).

### delivery-keys-on-agent-context

Delivery mode follows the agent context, not the session: one worker `agent_id` per worker, bound at dispatch and held for as long as that worker carries its batch, and the server scopes its ledger to that context ([agent-id-scopes-delivery](./TECHNIQUE.md#agent-id-scopes-delivery)). A first dispatch is a fresh context holding no prior deliveries, so it takes full delivery; the same context collapses what it already received, whether it is resumed on the activity it holds ([resume-worker](./resume-worker.md)) or advanced to the next activity of its batch ([continue-batch](./continue-batch.md)). The orchestrator releases the identity when the batch is spent ([workflow-orchestrator](./workflow-orchestrator.md) step 3), and a retry that spawns a NEW worker for the same activity is a new context, taking full delivery again. `context_mode: "persistent"` stays off worker-dispatched sessions.

### batch-is-bounded-by-the-server

A worker's batch is bounded at delivery, not by this operation's judgement: the server refuses the next activity once that context has taken the cap of distinct activities or accumulated more delivery than its batch budget allows, and reports where a context stands on every `get_activity`. So the orchestrator does not size a batch, hold a count, or reason about context load — it continues a worker while the `activity_complete` envelope reports [`batch_may_continue`](./finalize-activity.md#batch_may_continue) true. That answer is given when the worker takes an activity, before the lazy fetches of that activity draw down the same budget, so a batch reported as having room can still be refused at the next boundary; the refusal is an ordinary outcome, met by ending the batch and spawning a replacement ([continue-batch](./continue-batch.md)).

### reject-partial-worker-result

An accepted result is one of the two tagged envelopes — `checkpoint_pending` or `activity_complete` — carrying the fields that envelope requires. An interim status report, a progress table, a narrative of work still in flight, or prose describing an envelope without being one is not an accepted result. Neither is an envelope reporting fewer steps than the activity defines, or leaving a required checkpoint without a response.

