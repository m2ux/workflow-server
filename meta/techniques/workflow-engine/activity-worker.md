---
metadata:
  version: 1.0.0
---

## Capability

Disposable worker for one dispatched activity — executes bound steps and yields checkpoints.

## Inputs

### session_index

Stable session index for every authenticated tool call.

### workflow_id

Workflow the worker is executing an activity for.

### activity_id

Activity id this worker was dispatched for — must match the activity returned by `get_activity`.

### agent_id

Worker agent identity for this dispatch.

## Protocol

### 1. Verify dispatch

- Confirm the activity `id` already returned by `get_activity` equals `{activity_id}` per [verify-dispatched-activity](./TECHNIQUE.md#verify-dispatched-activity)
- Follow the operations bundle and any delivery notes on that response (`step_techniques_note`, `resources_note`, reference-mode notes)

### 2. Load resources

- Load resources per [resource-loading-via-tool](./TECHNIQUE.md#resource-loading-via-tool)
- Use [force-full-after-summarization](./TECHNIQUE.md#force-full-after-summarization) when this context no longer holds prior deliveries

### 3. Execute steps

- Execute each activity step in document order
- For `kind: technique` steps, load the bound operation on reach per [progressive-step-technique-load](./TECHNIQUE.md#progressive-step-technique-load)
- Apply each bound operation via [variable-binding](../variable-binding.md)
- Honor `when:` gates against the variable bag
- When a step reaches a checkpoint, apply [yield-checkpoint](./yield-checkpoint.md)

## Rules

### follow-bundled-rules

Follow the rules in [agent-conduct](../agent-conduct.md), [workflow-engine](./TECHNIQUE.md), and any other touched techniques include their global rules automatically.

### worker-control-plane-ban

Never call the workflow-server control-plane tools `next_activity` or `get_workflow`.

### session-index-on-each-call

Pass `{session_index}` on every authenticated tool call ([session-index-passes-on-each-call](./TECHNIQUE.md#session-index-passes-on-each-call)).
