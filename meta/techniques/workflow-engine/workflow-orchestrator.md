---
metadata:
  version: 1.0.0
---

## Capability

Orchestrator agent for a client workflow — owns the activity loop, checkpoint bubbling, and post-activity persistence.

## Inputs

### session_index

Stable session index for every authenticated tool call.

### workflow_id

Workflow this orchestrator is driving.

### agent_id

Orchestrator agent identity for this session.

## Protocol

### 1. Load resources

- Load resources declared on bundle operations per [resource-loading-via-tool](./TECHNIQUE.md#resource-loading-via-tool)
- Use [force-full-after-summarization](./TECHNIQUE.md#force-full-after-summarization) when this context no longer holds prior deliveries

### 2. Choose and dispatch first activity

- Call `get_workflow_status { session_index }`
- Dispatch `current_activity` when set, otherwise the workflow's `initialActivity`, via [dispatch-activity](./dispatch-activity.md)
- Always dispatch a worker — never execute activity steps inline ([orchestrator-no-inline-on-resume](../agent-conduct.md#orchestrator-no-inline-on-resume), [orchestrator-no-domain-work](../agent-conduct.md#orchestrator-no-domain-work))

### 3. Drive the activity loop

- Apply [dispatch-activity](./dispatch-activity.md) from the bundle
- On `checkpoint_pending`, bubble the yield and resume the worker with resolved effects
- After each `activity_complete`, apply [commit-and-persist](./commit-and-persist.md) before the next dispatch (Applies [sync-progress-status](./sync-progress-status.md) per [Progress Status call sites](../../resources/planning-readme.md#progress-status-call-sites)). Blocked and path-skip moments stay [dispatch-activity](./dispatch-activity.md) Protocol duties.
- Route from `{worker_result.next_activity_id}` ([finalize-activity](./finalize-activity.md))

## Rules

### follow-bundled-rules

Follow the rules in the operations bundle throughout — [agent-conduct](../agent-conduct.md), [workflow-engine](./TECHNIQUE.md), and any other touched techniques include their global rules automatically.

### session-index-on-each-call

Pass `{session_index}` on every authenticated tool call ([session-index-passes-on-each-call](./TECHNIQUE.md#session-index-passes-on-each-call)). The server restores session state on attach — do not reconstruct it.

### orchestrator-worker-boundaries

Honor [no-get-activity-from-orchestrator](./dispatch-activity.md#no-get-activity-from-orchestrator), [no-pre-load-techniques](./dispatch-activity.md#no-pre-load-techniques), [workers-need-full-delivery](./dispatch-activity.md#workers-need-full-delivery), [reject-partial-worker-result](./dispatch-activity.md#reject-partial-worker-result), and [worker-bag-takes-precedence](./dispatch-activity.md#worker-bag-takes-precedence).

### resolve-trace-at-close-out

At client finalize / retrospective close-out, honor [resolve-trace-at-close-out](./dispatch-activity.md#resolve-trace-at-close-out) (mid-run accumulate via [accumulate-trace-tokens](./dispatch-activity.md#accumulate-trace-tokens)).
