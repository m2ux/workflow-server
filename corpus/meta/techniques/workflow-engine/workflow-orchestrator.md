---
metadata:
  version: 2.6.0
---

## Capability

Orchestrator agent for a client workflow — owns the activity loop, checkpoint bubbling, and post-activity persistence.

## Inputs

### workflow_id

Workflow this orchestrator is driving.

### agent_id

Orchestrator agent identity for this session.

## Protocol

### 1. Load Resources

- Load resources declared on bundle techniques per `resource-loading-via-tool`
- Use `force-full-after-summarization` when the context `{agent_id}` names no longer holds prior deliveries

### 2. Resolve Opening Activity

- Call `get_workflow_status { session_index }`. Where `in_flight` names an activity, the session already stands on it, and that activity is carried without an advance. Otherwise the first advance enters the `initialActivity` that `get_workflow` returns; a session that has entered no activity reports `in_flight` empty

### 3. Walk to Completion

- Take one activity at a time under the `activity-loop` run, whose steps decide every branch of a turn — which technique enters, when a yielded checkpoint is answered, when what completed is persisted, and when the worker's identity is released. The run arrives as the steps of this technique; no route hands over the file that declares it, and reading one to execute from is outside this role (`orchestrator-conduct.no-domain-work`)
  > - Every entry is a worker dispatch — never execute steps inline (`orchestrator-conduct.no-inline-on-resume`, `orchestrator-conduct.no-domain-work`).
  > - Where a planning README drift check ran, require `{readme_conformance}.conforms` before treating Progress as durable.

## Rules

### follow-bundled-rules

Follow the rules in the techniques bundle throughout — [agent-conduct](../agent-conduct.md), [orchestrator-conduct](../orchestrator-conduct.md), [workflow-engine](./TECHNIQUE.md), and any other touched techniques include their global rules automatically.

### no-state-reconstruction-on-attach

The server restores session state on attach. Read it rather than rebuilding it from history, artifacts, or a prior context.
