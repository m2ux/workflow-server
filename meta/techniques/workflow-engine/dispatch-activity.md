---
metadata:
  version: 1.10.0
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

### trace_token

Opaque HMAC-signed trace token from the `next_activity` response `_meta.trace_token`.

## Protocol

1. **Progress in-progress:** When `{planning_folder_path}` is set, apply [sync-progress-status](./sync-progress-status.md) for the dispatch moment in [Progress Status call sites](../../resources/planning-readme.md#progress-status-call-sites) (`activity_id={activity_id}`; `{target_status}` from that row / [Status vocabulary](../../resources/planning-readme.md#status-vocabulary)). Transitions follow [Status transition policy](../../resources/planning-readme.md#status-transition-policy). Skip when no planning folder exists yet.
2. Call `next_activity { session_index, activity_id, step_manifest }`; capture `_meta.trace_token`.
   - **`step_manifest`:** a dispatch whose activity ran steps carries one manifest entry per completed step — the server validates step completion against it, and reports a gap when it is absent.
   - **Trace accumulate (required):** when `_meta.trace_token` is present, append it to `trace_tokens[]`. Tokens stay opaque — no routine per-activity `get_trace`. Live `_meta.validation` self-correct remains; do not resolve tokens mid-run (close-out resolve is [resolve-trace-at-close-out](#resolve-trace-at-close-out)).
3. Apply [compose-prompt](./compose-prompt.md) with `{agent_technique}` and `{state}` as substitutions (include `session_index`, `workflow_id`, `activity_id`, and worker `agent_id`).
4. Apply [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-agent](../harness-compat/spawn-agent.md) with the composed prompt; await the worker's envelope and return it unchanged as `{worker_result}`.
   - If the worker does not return within the expected time, apply [harness-compat](../harness-compat/TECHNIQUE.md)::[continue-agent](../harness-compat/continue-agent.md) if it is still running; otherwise dispatch a fresh worker for the same `{activity_id}`.
5. On `activity_complete`, read `{worker_result.next_activity_id}` (and optionally `{worker_result.evaluated_condition}`) as the authoritative next-activity routing — the worker evaluated transitions via [finalize-activity](./finalize-activity.md).
   - Before an orchestrator decision depends on a critical routing or path variable, apply [distrust-then-reconcile](#distrust-then-reconcile).
   - When the orchestrator observes **blocked** (worker/harness signal), apply [sync-progress-status](./sync-progress-status.md) for the blocked moment in [Progress Status call sites](../../resources/planning-readme.md#progress-status-call-sites) for `{activity_id}` before surfacing or retrying.
   - When the path **skips / cancels** an activity without running it, apply [sync-progress-status](./sync-progress-status.md) for the path-skip / cancel moment in [Progress Status call sites](../../resources/planning-readme.md#progress-status-call-sites) for that activity's rows.

## Rules

### account-every-dispatch

Every dispatch's harness-reported usage is recorded as it completes, with
`record_usage { session_index, activity, usage }` — one call per dispatch. That
covers the first worker, each `continue-agent`, each fresh worker dispatched after
a timeout, each resume after a checkpoint yield, and any dispatch made out of band.

Cost travels on its own call, so coverage follows the dispatches rather than the
graph: the terminal activity's own dispatches and anything after the final
transition are recorded like any other.

When the harness surfaces no figure, omit the call. A worker cannot self-measure,
so a missing entry must stay distinguishable from a measured zero; the client's
close-out cost path reconciles the entry count against the run's actual dispatch
count and reports any shortfall rather than hiding it.

### distrust-then-reconcile

Critical routing/path state read from `inspect_session` is cross-checked against the worker's own `activity_complete` envelope (`variables_changed` and related fields) and, when still uncertain, planning-folder evidence, before an orchestrator decision depends on it. On disagreement the envelope governs — the worker holds ground truth from its own user interaction — and the discrepancy is logged.

### resolve-trace-at-close-out

Client finalize/retrospective paths that consume execution history MUST resolve accumulated `trace_tokens[]` once via `get_trace { session_index, trace_tokens }` (optionally `inspect_session` for fetch/fidelity context). This operation owns the accumulate half of the contract; the client's close-out path owns the resolve call and any planning artifacts. Skip resolve when `trace_tokens` is empty.

### no-get-activity-from-orchestrator

Workflow orchestrators NEVER call `get_activity`. The activity definition is the worker's domain. Orchestrators need only the `{activity_id}` (from `initialActivity`, `get_workflow_status.current_activity`, or `{worker_result.next_activity_id}`) to call `next_activity` and compose the worker prompt.

### no-pre-load-techniques

NEVER call `get_technique` to pre-load techniques for the worker. Step techniques load on the worker via [progressive-step-technique-load](./TECHNIQUE.md#progressive-step-technique-load). Pre-fetching from the orchestrator duplicates that work and defeats progressive disclosure.

### workers-need-full-delivery

Dispatched workers are fresh contexts with no prior deliveries. Leave a worker-dispatched session in its default (`fresh`) delivery mode — never set `context_mode: "persistent"` on it, and never instruct a worker to pass `bundle: "reference"`: an unchanged-reference points at content the new worker has never received.

### reject-partial-worker-result

If the worker reports fewer steps than the activity defines, or required checkpoints have no response, do NOT accept the partial result — resume the worker with explicit instructions to complete the missing items.

