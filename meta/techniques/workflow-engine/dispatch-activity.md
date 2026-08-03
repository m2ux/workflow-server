---
metadata:
  version: 1.15.0
---

## Capability

Transition the session to a target activity and spawn a disposable worker for it.

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

### trace_token

Opaque HMAC-signed trace token from the `next_activity` response `_meta.trace_token`.

## Protocol

1. **Progress in-progress:** Apply [sync-progress-status](./sync-progress-status.md) with `{planning_folder_path}` for the dispatch moment in [Progress Status call sites](../../resources/planning-readme.md#progress-status-call-sites) (`activity_id={activity_id}`; `{target_status}` from that row / [Status vocabulary](../../resources/planning-readme.md#status-vocabulary)). Transitions follow [Status transition policy](../../resources/planning-readme.md#status-transition-policy).
   > When `{planning_folder_path}` is unset, skip this phase.
2. Call `next_activity { session_index, activity_id, step_manifest }`; capture `_meta.trace_token`.
   - **`step_manifest`:** a dispatch whose activity ran steps carries one manifest entry per completed step — the server validates step completion against it, and reports a gap when it is absent.
   - **Trace accumulate (required):** when `_meta.trace_token` is present, append it to `trace_tokens[]`. Tokens stay opaque — no routine per-activity `get_trace`. Live `_meta.validation` self-correct remains; do not resolve tokens mid-run (close-out resolve is [resolve-trace-at-close-out](#resolve-trace-at-close-out)).
3. Mint `{worker_agent_id}` for this dispatch per [delivery-keys-on-agent-context](#delivery-keys-on-agent-context), then apply [compose-prompt](./compose-prompt.md) with `{agent_technique}` and `{state}` as substitutions (include `session_index`, `workflow_id`, `activity_id`, and `{worker_agent_id}` as `agent_id`).
4. Apply [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-agent](../harness-compat/spawn-agent.md) with the composed prompt; await the worker's envelope and return it unchanged as `{worker_result}`.
   > When the harness reports the worker ended without returning an envelope, dispatch a fresh worker for the same `{activity_id}`, which mints its own identity.
   > When the envelope reports fewer steps than the activity defines, or leaves a required checkpoint without a response, apply [harness-compat](../harness-compat/TECHNIQUE.md)::[continue-agent](../harness-compat/continue-agent.md) under `{worker_agent_id}` with explicit instructions to complete the missing items ([reject-partial-worker-result](#reject-partial-worker-result)).
5. Account for this dispatch, and for any replacement worker dispatched for the same `{activity_id}`, per [account-every-dispatch](#account-every-dispatch).
6. Reconcile any critical routing or path variable an orchestrator decision depends on: compare the session record against the just-completed worker's `activity_complete` envelope, and against planning-folder evidence when the two still leave it uncertain ([distrust-then-reconcile](#distrust-then-reconcile)).
7. On `activity_complete`, read `{worker_result.next_activity_id}` (and optionally `{worker_result.evaluated_condition}`) as the authoritative next-activity routing — the worker evaluated transitions via [finalize-activity](./finalize-activity.md).
   > When the orchestrator observes **blocked** (worker/harness signal), apply [sync-progress-status](./sync-progress-status.md) for the blocked moment in [Progress Status call sites](../../resources/planning-readme.md#progress-status-call-sites) for `{activity_id}` before surfacing or retrying.
   > When the path **skips / cancels** an activity without running it, apply [sync-progress-status](./sync-progress-status.md) for the path-skip / cancel moment in [Progress Status call sites](../../resources/planning-readme.md#progress-status-call-sites) for that activity's rows.

## Rules

### account-every-dispatch

Every dispatch carries exactly one usage entry, recorded with `record_usage { session_index, activity, usage }` — the first worker, each continuation, each replacement worker, and any dispatch made out of band alike. Cost travels on its own entry, so coverage follows the dispatches rather than the graph: the terminal activity's own dispatches and anything after the final transition carry one like any other. A worker cannot self-measure, so a dispatch with no entry is one whose harness reported nothing, never one that cost zero — where the harness surfaces no figure the entry is omitted rather than zeroed.

### distrust-then-reconcile

Where the session record and a just-completed worker's `activity_complete` envelope (`variables_changed` and related fields) disagree on routing or path state, the envelope governs, and the discrepancy is logged.

### resolve-trace-at-close-out

Client finalize/retrospective paths that consume execution history MUST resolve accumulated `trace_tokens[]` once via `get_trace { session_index, trace_tokens }` (optionally `inspect_session` for fetch/fidelity context). This operation owns the accumulate half of the contract; the client's close-out path owns the resolve. Skip resolve when `trace_tokens` is empty.

### no-get-activity-from-orchestrator

Workflow orchestrators NEVER call `get_activity`.

### no-pre-load-techniques

NEVER call `get_technique` to pre-load techniques for the worker. Step techniques load on the worker via [progressive-step-technique-load](./TECHNIQUE.md#progressive-step-technique-load).

### delivery-keys-on-agent-context

Delivery mode follows the agent context, not the session: one worker `agent_id` per worker, bound at dispatch and held until that worker reports the activity complete, and the server scopes its ledger to that context ([agent-id-scopes-delivery](./TECHNIQUE.md#agent-id-scopes-delivery)). A first dispatch is a fresh context holding no prior deliveries, so it takes full delivery; the resumed worker is the same context and collapses what it already received ([resume-worker](./resume-worker.md)). A retry that spawns a NEW worker for the same activity is a new context, and takes full delivery again. `context_mode: "persistent"` stays off worker-dispatched sessions.

### reject-partial-worker-result

A worker result reporting fewer steps than the activity defines, or leaving a required checkpoint without a response, is not an accepted result.

