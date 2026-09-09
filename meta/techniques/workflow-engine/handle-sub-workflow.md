---
metadata:
  version: 2.0.0
---

## Capability

Launch a workflow under the current session and walk it to its end.

## Inputs

### parent_session_index

The current session's `session_index` — parent for `dispatch_child`.

### workflow_id

Child workflow ID.

## Outputs

### child_session_index

The 6-character base32 `session_index` of the newly created child session.

### child_planning_folder_path

The canonical absolute path of the child's planning folder, as resolved by the server. Artifacts the child writes land here, and this is where its results are read back from.

## Protocol

1. Call `dispatch_child { session_index: {parent_session_index}, workflow_id: {workflow_id}, agent_id: 'workflow-orchestrator' }`; capture `{child_session_index}`, `{child_planning_folder_path}` (server-resolved; do not compose the path), and `workflow.initialActivity` as the activity the walk below opens with. A session that has entered no activity reports none and refuses to serve one, so that id is the only route into the child. Same child-session shape as [create-session](./create-session.md) (server embeds under the parent; no separate child folder).
2. Walk the child from its opening activity to its end, under [solo-walk-the-child](#solo-walk-the-child): call `next_activity { session_index: {child_session_index}, activity_id }`, then `get_activity { session_index: {child_session_index} }`, execute the activity's steps, and route from its exits to the next `next_activity` — until the child reports `workflow_complete`.
3. Read what the child produced from `{child_planning_folder_path}` — the artifacts it declared there. The launch record the server keeps carries the child's completion, not its results.

## Rules

### solo-walk-the-child

The context that launches a workflow walks it, in that same context: it holds the child's identity and nothing else can be pointed at the child. A spawned agent has no dispatch primitive ([spawn-agent](../harness-compat/spawn-agent.md)::[depth-1-only](../harness-compat/spawn-agent.md#depth-1-only)), so there is no orchestrator/worker split available inside a launch — the walk is one context taking every activity of the child.

This is the one place a context advances a session other than its own. [activity-worker](./activity-worker.md)::[worker-control-plane-ban](./activity-worker.md#worker-control-plane-ban) governs the session a worker was dispatched for, which an orchestrator owns; a session this context created has no other owner.

### finish-the-child-before-reporting

The launching step is not finished while the child is mid-walk. Report the step complete only once the child has reported `workflow_complete` — a context that ends earlier leaves a session recorded as running that nothing will ever advance, and the results it was launched for unread ([activity-worker](./activity-worker.md)::[outlive-dispatched-children](./activity-worker.md#outlive-dispatched-children)).
