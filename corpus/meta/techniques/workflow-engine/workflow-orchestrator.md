---
metadata:
  version: 1.10.0
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

### 2. Choose and dispatch first activity

- Call `get_workflow_status { session_index }`
- Dispatch `current_activity` when set, otherwise the `initialActivity` that `get_workflow` returns, via [dispatch-activity](./dispatch-activity.md). A session that has not entered an activity reports none, so the workflow's own first activity is the only id to reach for; a session part-way through reports the cursor to resume on
- Always dispatch a worker — never execute activity steps inline ([no-inline-on-resume](../orchestrator-conduct.md#no-inline-on-resume), [no-domain-work](../orchestrator-conduct.md#no-domain-work))

### 3. Run the activity

- Apply [dispatch-activity](./dispatch-activity.md) from the bundle and hold the envelope it returns
  > On `checkpoint_pending`, bubble the yield, then apply [resume-worker](./resume-worker.md) with the resolved effects and hold the envelope that comes back.

### 4. Persist the completed activity

- On `activity_complete`, apply [commit-and-persist](./commit-and-persist.md) before the pointer advances onto the routed activity — a continuation, a fresh dispatch, or a fan
  > - A source whose exit fans is a completed activity like any other. The persist the fan makes at convergence names the branches, not this source.
  > - Where a planning README drift check ran, require `{readme_conformance}.conforms` before treating Progress as durable.

### 5. Route the exit

- Read the destination from `{worker_result.next_activity_id}` ([finalize-activity](./finalize-activity.md)). `{worker_result.next_activity_fans}` is true when that destination is not a string — a list of members, or one activity together with the collection it runs over

### 6. Enter the destination

- On `{worker_result.next_activity_fans}`, release the worker's identity ([delivery-keys-on-agent-context](./dispatch-activity.md#delivery-keys-on-agent-context)) and enter the destination via [dispatch-fan](./dispatch-fan.md)
- On `{worker_result.batch_may_continue}` with a non-null `{worker_result.next_activity_id}` that is a single activity, apply [continue-batch](./continue-batch.md) to advance that same worker onto the routed activity
- Otherwise release the worker's identity and enter the routed activity via [dispatch-activity](./dispatch-activity.md)
  > - A fan is not a batch: each branch takes one activity under its own identity, and this worker is not continued onto it ([dispatch-topology](./dispatch-activity.md#dispatch-topology)).
  > - Entering a destination opens the next turn of the loop — run it, persist it, route it, enter what it routes to — until the session reports no activity following.

## Rules

### follow-bundled-rules

Follow the rules in the operations bundle throughout — [agent-conduct](../agent-conduct.md), [orchestrator-conduct](../orchestrator-conduct.md), [workflow-engine](./TECHNIQUE.md), and any other touched techniques include their global rules automatically.

### no-state-reconstruction-on-attach

The server restores session state on attach. Read it rather than rebuilding it from history, artifacts, or a prior context.

### orchestrator-worker-boundaries

Honor [no-get-activity-from-orchestrator](./dispatch-activity.md#no-get-activity-from-orchestrator), [no-pre-load-techniques](./dispatch-activity.md#no-pre-load-techniques), [delivery-keys-on-agent-context](./dispatch-activity.md#delivery-keys-on-agent-context), [batch-is-bounded-by-the-server](./dispatch-activity.md#batch-is-bounded-by-the-server), [resume-preserves-delivery-scope](../harness-compat/continue-agent.md#resume-preserves-delivery-scope), and [distrust-then-reconcile](./dispatch-activity.md#distrust-then-reconcile).

### resolve-trace-at-close-out

At client finalize / retrospective close-out, honor [resolve-trace-at-close-out](./dispatch-activity.md#resolve-trace-at-close-out).
