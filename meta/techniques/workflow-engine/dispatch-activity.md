---
metadata:
  version: 1.13.0
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

## Outputs

### worker_result

The envelope the worker returned, passed through unchanged — one of two tagged result types: the `checkpoint_pending` envelope, or the `activity_complete` envelope.

### worker_agent_id

Server-side worker identity this dispatch bound — the identity the delivery ledger is keyed on, held by the worker until it reports the activity complete.

### trace_token

Opaque HMAC-signed trace token from the `next_activity` response `_meta.trace_token`.

## Protocol

1. **Progress in-progress:** Apply [sync-progress-status](./sync-progress-status.md) for the dispatch moment in [Progress Status call sites](../../resources/planning-readme.md#progress-status-call-sites) (`activity_id={activity_id}`; `{target_status}` from that row / [Status vocabulary](../../resources/planning-readme.md#status-vocabulary)). Transitions follow [Status transition policy](../../resources/planning-readme.md#status-transition-policy).
   > When `{planning_folder_path}` is unset, no planning folder exists yet and this phase is skipped.
2. Call `next_activity { session_index, activity_id, step_manifest }`; capture `_meta.trace_token`.
   - **`step_manifest`:** a dispatch whose activity ran steps carries one manifest entry per completed step — the server validates step completion against it, and reports a gap when it is absent.
   - **Trace accumulate (required):** when `_meta.trace_token` is present, append it to `trace_tokens[]`. Tokens stay opaque — no routine per-activity `get_trace`. Live `_meta.validation` self-correct remains; do not resolve tokens mid-run (close-out resolve is [resolve-trace-at-close-out](#resolve-trace-at-close-out)).
3. Mint `{worker_agent_id}` for this dispatch per [delivery-keys-on-agent-context](#delivery-keys-on-agent-context), then apply [compose-prompt](./compose-prompt.md) with `{agent_technique}` and `{state}` as substitutions (include `session_index`, `workflow_id`, `activity_id`, and `{worker_agent_id}` as `agent_id`).
4. Apply [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-agent](../harness-compat/spawn-agent.md) with the composed prompt; await the worker's envelope and return it unchanged as `{worker_result}`.
   > When the worker does not return within the expected time and is still running, apply [harness-compat](../harness-compat/TECHNIQUE.md)::[continue-agent](../harness-compat/continue-agent.md) under `{worker_agent_id}`; otherwise dispatch a fresh worker for the same `{activity_id}`, which mints its own.
   > When the envelope reports fewer steps than the activity defines, or leaves a required checkpoint without a response, continue the worker under `{worker_agent_id}` with explicit instructions to complete the missing items ([reject-partial-worker-result](#reject-partial-worker-result)).
5. Record this dispatch's harness-reported usage with `record_usage { session_index, activity, usage }` — one call for this dispatch, and one more for each fresh worker dispatched after a timeout.
   > When the harness surfaces no figure, omit the call.
6. On `activity_complete`, read `{worker_result.next_activity_id}` (and optionally `{worker_result.evaluated_condition}`) as the authoritative next-activity routing — the worker evaluated transitions via [finalize-activity](./finalize-activity.md).
   > Before an orchestrator decision depends on a critical routing or path variable, cross-check it against the just-completed worker's `activity_complete` envelope, and against planning-folder evidence when the two still leave it uncertain.
   > When the orchestrator observes **blocked** (worker/harness signal), apply [sync-progress-status](./sync-progress-status.md) for the blocked moment in [Progress Status call sites](../../resources/planning-readme.md#progress-status-call-sites) for `{activity_id}` before surfacing or retrying.
   > When the path **skips / cancels** an activity without running it, apply [sync-progress-status](./sync-progress-status.md) for the path-skip / cancel moment in [Progress Status call sites](../../resources/planning-readme.md#progress-status-call-sites) for that activity's rows.

## Rules

### account-every-dispatch

Every dispatch carries exactly one usage entry — the first worker, each continuation, each fresh worker dispatched after a timeout, and any dispatch made out of band alike. Cost travels on its own entry, so coverage follows the dispatches rather than the graph: the terminal activity's own dispatches and anything after the final transition carry one like any other. A worker cannot self-measure, so a dispatch with no entry is one whose harness reported nothing, never one that cost zero.

### distrust-then-reconcile

Where the session record and a just-completed worker's `activity_complete` envelope (`variables_changed` and related fields) disagree on routing or path state, the envelope governs — the worker holds ground truth from its own user interaction — and the discrepancy is logged.

### resolve-trace-at-close-out

Client finalize/retrospective paths that consume execution history MUST resolve accumulated `trace_tokens[]` once via `get_trace { session_index, trace_tokens }` (optionally `inspect_session` for fetch/fidelity context). This operation owns the accumulate half of the contract; the client's close-out path owns the resolve call and any planning artifacts. Skip resolve when `trace_tokens` is empty.

### no-get-activity-from-orchestrator

Workflow orchestrators NEVER call `get_activity`.

### no-pre-load-techniques

NEVER call `get_technique` to pre-load techniques for the worker. Step techniques load on the worker via [progressive-step-technique-load](./TECHNIQUE.md#progressive-step-technique-load).

### delivery-keys-on-agent-context

Delivery mode follows the agent context, not the session: one worker `agent_id` per worker, bound at dispatch and held until that worker reports the activity complete, and the server scopes its ledger to that context ([agent-id-scopes-delivery](./TECHNIQUE.md#agent-id-scopes-delivery)). A first dispatch is a fresh context holding no prior deliveries, so it takes full delivery; the resumed worker is the same context and collapses what it already received ([resume-worker](./resume-worker.md)). A retry that spawns a NEW worker for the same activity is a new context, and takes full delivery again. `context_mode: "persistent"` stays off worker-dispatched sessions — it is a session-wide declaration, and one session serves many worker contexts.

### reject-partial-worker-result

A worker result reporting fewer steps than the activity defines, or leaving a required checkpoint without a response, is not an accepted result.

