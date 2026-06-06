---
metadata:
  version: 1.0.0
---

## Capability

Transition the session to a target activity and spawn a worker for it.

## Inputs

### activity-id

Activity ID to enter.

### prompt-template

Resource ref for the worker prompt (e.g., [activity-worker-prompt](../../resources/activity-worker-prompt.md)).

### state

Current variable state for prompt substitution

## Output

### worker-result

The envelope the worker returned, passed through unchanged — one of two tagged result types: the `checkpoint_pending` envelope from [yield-checkpoint](./yield-checkpoint.md), or the `activity_complete` envelope from [finalize-activity](./finalize-activity.md).

### trace-token

Trace token captured from `next_activity` response, appended to `trace_tokens`.

## Protocol

1. Call `next_activity { session-index, activity-id, step_manifest }`; capture `_meta.trace-token`.
2. Apply [compose-prompt](./compose-prompt.md) with `prompt-template` substituting `state` values.
3. Apply [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-agent](../harness-compat/spawn-agent.md) with the composed prompt; await the worker's envelope and return it unchanged as `worker-result`.
   - If the worker does not return within the expected time, apply [harness-compat](../harness-compat/TECHNIQUE.md)::[continue-agent](../harness-compat/continue-agent.md) if it is still running; otherwise dispatch a fresh worker for the same `activity-id`.
   - If the worker reports fewer steps than the activity defines, or required checkpoints have no response, do NOT accept the partial result — resume the worker with explicit instructions to complete the missing items.
   - If the worker reports variable changes that conflict with orchestrator state, the worker values take precedence (the worker has ground truth from user interaction).

## Rules

### step-manifest-required

When calling `next_activity`, include a `step_manifest` array. Each entry is an object with two string fields: `step_id` (the literal step id from the activity definition's `steps[]`) and `output` (a short summary of what was produced). Omit `step_manifest` entirely if no steps were executed; do not pass an empty array or empty string.

### no-get-activity-from-orchestrator

Workflow orchestrators NEVER call `get_activity`. The activity definition is the worker's domain. Orchestrators need only the `activity-id` (from `initialActivity` or `transitions`) to call `next_activity` and compose the worker prompt.

### no-pre-load-techniques

NEVER call `get_technique` to pre-load techniques. The worker self-bootstraps via `get_activity`, which bundles the operations the activity needs.
