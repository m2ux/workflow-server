---
metadata:
  version: 2.1.0
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

- Load resources declared on bundle techniques per `resource-loading-via-tool`
- Use `force-full-after-summarization` when the context `{agent_id}` names no longer holds prior deliveries

### 2. Resolve the activity to open with

- Call `get_workflow_status { session_index }`; take the activity `in_flight` names when it holds one, otherwise the `initialActivity` that `get_workflow` returns. A session that has not entered an activity reports `in_flight` empty, so the workflow's own first activity is the only id to reach for; a session part-way through names the cursor to resume on

### 3. Walk the workflow to its end

- Open with that activity and take one at a time under the `activity-loop` run, whose steps decide every branch of a turn — which technique enters, when a yielded checkpoint is answered, when what completed is persisted, and when the worker's identity is released. The run arrives as the steps of this technique; no route hands over the file that declares it, and reading one to execute from is outside this role (`orchestrator-conduct.no-domain-work`)
  > - Every entry is a worker dispatch — never execute steps inline (`orchestrator-conduct.no-inline-on-resume`, `orchestrator-conduct.no-domain-work`).
  > - Where a planning README drift check ran, require `{readme_conformance}.conforms` before treating Progress as durable.

## Rules

### follow-bundled-rules

Follow the rules in the techniques bundle throughout — [agent-conduct](../agent-conduct.md), [orchestrator-conduct](../orchestrator-conduct.md), [workflow-engine](./TECHNIQUE.md), and any other touched techniques include their global rules automatically.

### no-state-reconstruction-on-attach

The server restores session state on attach. Read it rather than rebuilding it from history, artifacts, or a prior context.

### orchestrator-worker-boundaries

Honor `dispatch-activity.no-get-activity-from-orchestrator`, `dispatch-activity.no-pre-load-techniques`, `dispatch-activity.delivery-keys-on-agent-context`, `dispatch-activity.batch-is-bounded-by-the-server`, `continue-agent.resume-preserves-delivery-scope`, `dispatch-activity.reject-partial-worker-result`, and `dispatch-activity.distrust-then-reconcile`.

### resolve-trace-at-close-out

At client finalize / retrospective close-out, honor `dispatch-activity.resolve-trace-at-close-out`.
