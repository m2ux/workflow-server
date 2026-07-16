---
metadata:
  version: 1.0.0
---

## Capability

Transition the session to a target activity and execute it in the **current agent context** (solo topology). No worker spawn.

## Inputs

### session_index

`session_index` of the session whose activity is being executed

### activity_id

Activity ID to enter.

### state

Current variable state (for local working context; not used to spawn a prompt)

## Outputs

### worker_result

The same envelope shape as [dispatch-activity](./dispatch-activity.md): `checkpoint_pending` from [yield-checkpoint](./yield-checkpoint.md), or `activity_complete` from [finalize-activity](./finalize-activity.md). Append `_meta.trace-token` from `next_activity` to `trace_tokens` as a side effect (same as dispatch-activity).

## Protocol

1. Call `next_activity { session_index, activity_id, step_manifest, usage? }`; capture `_meta.trace-token` and append it to `trace_tokens`.
   - **`usage` (optional):** same relay rules as [dispatch-activity](./dispatch-activity.md).
2. In **this** agent context (do **not** apply `harness-compat::spawn-agent`):
   1. Call `get_activity { session_index, context_tokens }` and verify the returned activity `id` equals `{activity_id}`.
   2. Execute the activity per the worker bootstrap in [activity-worker-prompt](../../resources/activity-worker-prompt.md) (steps 2–end): reuse any `resources` map on the ops bundle; progressive `get_technique` only for steps absent from `step_techniques`; yield checkpoints with `yield_checkpoint`.
3. On `yield_checkpoint` → `status: "yielded"`: return the `checkpoint_pending` envelope (the outer loop presents/responds, then re-enters this operation or continues the worker protocol after `resume_checkpoint`).
4. On activity completion: return the `activity_complete` envelope (variable changes, step coverage) as `{worker_result}`.

## Rules

### solo-same-context

Solo topology means one agent context runs every activity for this session. Do not spawn a disposable worker. The session MUST have been started or created with `context_mode: "persistent"` and one canonical `agent_id` (see [create-session](./create-session.md) and `workflow-engine.solo-canonical-agent-id`).

### get-activity-allowed-under-solo

Under solo topology the executing agent **does** call `get_activity` / `get_technique` / `get_resource` — the dispatch-topology rule `dispatch-activity.no-get-activity-from-orchestrator` does not apply here.

### step-manifest-required

Same as [dispatch-activity](./dispatch-activity.md)::step-manifest-required.

### relay-harness-usage

Same as [dispatch-activity](./dispatch-activity.md)::relay-harness-usage when the harness surfaces usage for the activity just finished.
