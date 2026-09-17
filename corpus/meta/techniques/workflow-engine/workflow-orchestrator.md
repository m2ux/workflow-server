---
metadata:
  version: 2.0.0
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
- Use [force-full-after-summarization](./TECHNIQUE.md#force-full-after-summarization) when the context `{agent_id}` names no longer holds prior deliveries

### 2. Resolve the activity to open with

- Call `get_workflow_status { session_index }`; take `current_activity` when set, otherwise the `initialActivity` that `get_workflow` returns. A session that has not entered an activity reports none, so the workflow's own first activity is the only id to reach for; a session part-way through reports the cursor to resume on

### 3. Walk the workflow to its end

- Open with that activity and take one at a time under the `activity-loop` run at [`meta/routines/activity-loop.yaml`](/meta/routines/activity-loop.yaml), whose steps decide every branch of a turn — which operation enters, when a yielded checkpoint is answered, when what completed is persisted, and when the worker's identity is released
  > - Every entry is a worker dispatch — never execute steps inline ([no-inline-on-resume](../orchestrator-conduct.md#no-inline-on-resume), [no-domain-work](../orchestrator-conduct.md#no-domain-work)).
  > - Where a planning README drift check ran, require `{readme_conformance}.conforms` before treating Progress as durable.

## Rules

### follow-bundled-rules

Follow the rules in the operations bundle throughout — [agent-conduct](../agent-conduct.md), [orchestrator-conduct](../orchestrator-conduct.md), [workflow-engine](./TECHNIQUE.md), and any other touched techniques include their global rules automatically.

### no-state-reconstruction-on-attach

The server restores session state on attach. Read it rather than rebuilding it from history, artifacts, or a prior context.

### orchestrator-worker-boundaries

Honor [no-get-activity-from-orchestrator](./dispatch-activity.md#no-get-activity-from-orchestrator), [no-pre-load-techniques](./dispatch-activity.md#no-pre-load-techniques), [delivery-keys-on-agent-context](./dispatch-activity.md#delivery-keys-on-agent-context), [batch-is-bounded-by-the-server](./dispatch-activity.md#batch-is-bounded-by-the-server), [resume-preserves-delivery-scope](../harness-compat/continue-agent.md#resume-preserves-delivery-scope), [reject-partial-worker-result](./dispatch-activity.md#reject-partial-worker-result), and [distrust-then-reconcile](./dispatch-activity.md#distrust-then-reconcile).

### resolve-trace-at-close-out

At client finalize / retrospective close-out, honor [resolve-trace-at-close-out](./dispatch-activity.md#resolve-trace-at-close-out).
