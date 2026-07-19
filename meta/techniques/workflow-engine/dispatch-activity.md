---
metadata:
  version: 1.3.0
---

## Capability

Transition the session to a target activity and spawn a disposable worker for it.

## Inputs

### session_index

`session_index` of the session whose activity is being dispatched

### activity_id

Activity ID to enter.

### prompt_template

Resource ref for the worker prompt (e.g., [activity-worker-prompt](../../resources/activity-worker-prompt.md)).

### state

Current variable state for prompt substitution

## Outputs

### worker_result

The envelope the worker returned, passed through unchanged — one of two tagged result types: the `checkpoint_pending` envelope from [yield-checkpoint](./yield-checkpoint.md), or the `activity_complete` envelope from [finalize-activity](./finalize-activity.md).

### trace_token

Opaque HMAC-signed trace token from the `next_activity` response `_meta.trace_token`. **Required protocol output:** append each token to the orchestrator/session `trace_tokens[]` collection in handoff order. Do not decode mid-flight.

## Protocol

1. Call `next_activity { session_index, activity_id, step_manifest, usage? }`; capture `_meta.trace_token`.
   - **`usage` (optional):** relay the harness-reported token usage for the activity the worker just completed — the figure the orchestrator reads from the worker's completion result (e.g. subagent token counts and cache/model fields when the harness surfaces them). Pass it on this transition call, keyed to the activity being exited. When the harness does not surface per-sub-agent usage, omit the param entirely — the run still completes and nothing is fabricated.
   - **Trace accumulate (required):** when `_meta.trace_token` is present, append it to `trace_tokens[]`. Tokens stay opaque — no routine per-activity `get_trace`.
2. Apply [compose-prompt](./compose-prompt.md) with `{prompt_template}` substituting `{state}` values.
3. Apply [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-agent](../harness-compat/spawn-agent.md) with the composed prompt; await the worker's envelope and return it unchanged as `{worker_result}`.
   - If the worker does not return within the expected time, apply [harness-compat](../harness-compat/TECHNIQUE.md)::[continue-agent](../harness-compat/continue-agent.md) if it is still running; otherwise dispatch a fresh worker for the same `{activity_id}`.
   - If the worker reports fewer steps than the activity defines, or required checkpoints have no response, do NOT accept the partial result — resume the worker with explicit instructions to complete the missing items.
   - If the worker reports variable changes that conflict with orchestrator state, the worker values take precedence (the worker has ground truth from user interaction).

## Rules

### step-manifest-required

When calling `next_activity`, include a `step_manifest` array. Each entry is an object with two string fields: `step_id` (the literal step id from the activity definition's `steps[]`) and `output` (a short summary of what was produced). Omit `step_manifest` entirely if no steps were executed; do not pass an empty array or empty string.

### relay-harness-usage

When the harness surfaces per-sub-agent token usage on the worker's completion result, relay it as the optional `usage` object on the subsequent `next_activity` call — the transition off the activity the worker just finished. The worker cannot self-measure; this populate step is orchestrator-only. Omit `usage` when the figure is unavailable.

### accumulate-trace-tokens

Every successful `next_activity` handoff that returns `_meta.trace_token` MUST append that opaque string to `trace_tokens[]`. Accumulation is an engine protocol duty of this operation — not an optional aside. Live `_meta.validation` self-correct remains; do not resolve tokens mid-run.

### resolve-trace-at-close-out

Client finalize/retrospective paths that consume execution history MUST resolve accumulated `trace_tokens[]` once via `get_trace { session_index, trace_tokens }` (optionally `inspect_session` for fetch/fidelity context). This operation owns the accumulate half of the contract; the client's close-out path owns the resolve call and any planning artifacts. Skip resolve when `trace_tokens` is empty.

### no-get-activity-from-orchestrator

Workflow orchestrators NEVER call `get_activity`. The activity definition is the worker's domain. Orchestrators need only the `{activity_id}` (from `initialActivity` or `transitions`) to call `next_activity` and compose the worker prompt.

### no-pre-load-techniques

NEVER call `get_technique` to pre-load techniques for the worker. `get_activity` bundles only the activity's cross-cutting operations (strategy and core-worker techniques); the worker then loads each step's bound operation on demand via `get_technique { session_index, step_id }` — progressively, one per step as it reaches it. Pre-fetching step techniques from the orchestrator duplicates that work and defeats the progressive disclosure that step-level binding exists to provide.

### workers-need-full-delivery

Dispatched workers are fresh contexts with no prior deliveries. Leave a worker-dispatched session in its default (`fresh`) delivery mode — never set `context_mode: "persistent"` on it, and never instruct a worker to pass `bundle: "reference"`: an unchanged-reference points at content the new worker has never received.
