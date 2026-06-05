---
metadata:
  version: 1.0.0
---

## Capability

Transition the session to a target activity and spawn a worker for it.

## Inputs

### activity_id

Activity ID to enter

### prompt_template

Resource ref for the worker prompt (e.g., [activity-worker-prompt](../../resources/activity-worker-prompt.md))

### state

Current variable state for prompt substitution

## Output

### worker_result

The envelope the worker returned, passed through unchanged — one of two tagged result types: the `checkpoint_pending` envelope from [yield-checkpoint](./yield-checkpoint.md), or the `activity_complete` envelope from [finalize-activity](./finalize-activity.md).

### trace_token

Trace token captured from `next_activity` response, appended to `trace_tokens`

## Protocol

1. Call `next_activity { session_index, activity_id, step_manifest }`; capture `_meta.trace_token`.
2. Apply [compose-prompt](./compose-prompt.md) with `prompt_template` substituting `state` values.
3. Apply [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-agent](../harness-compat/spawn-agent.md) with the composed prompt; await the worker's envelope and return it unchanged as `worker_result`.

## Errors

### worker_timeout

**Cause:** Worker sub-agent did not return within the expected time.

**Recovery:** Apply [harness-compat](../harness-compat/TECHNIQUE.md)::[continue-agent](../harness-compat/continue-agent.md) if still running; otherwise dispatch a fresh worker for the same `activity_id`.

### worker_incomplete

**Cause:** Worker reports fewer steps than the activity defines, or required checkpoints have no response.

**Recovery:** Resume the worker with explicit instructions to complete the missing items. Do NOT accept the partial result.

### state_desync

**Cause:** Worker reports variable changes conflicting with orchestrator state.

**Recovery:** Worker values take precedence (the worker has ground truth from user interaction).

## Rules

### step-manifest-required

When calling `next_activity`, include a `step_manifest` array. Each entry is an object with two string fields: `step_id` (the literal step id from the activity definition's `steps[]`) and `output` (a short summary of what was produced). Omit `step_manifest` entirely if no steps were executed; do not pass an empty array or empty string.

### reject-empty-checkpoints

If an activity defines required checkpoints and the worker returns `checkpoints_responded` as empty, REJECT the result and resume the worker.

### no-get-activity-from-orchestrator

Workflow orchestrators NEVER call `get_activity`. The activity definition is the worker's domain. Orchestrators need only the `activity_id` (from `initialActivity` or `transitions`) to call `next_activity` and compose the worker prompt.

### no-pre-load-techniques

NEVER call `get_technique` to pre-load techniques. The worker self-bootstraps via `get_activity`, which bundles the operations the activity needs.

### variable-mutation-source

Variables mutate from two sources only: checkpoint option effects (`setVariable`) and worker `activity_complete` results (`variables_changed`). Never mutate state through ad-hoc reasoning.
