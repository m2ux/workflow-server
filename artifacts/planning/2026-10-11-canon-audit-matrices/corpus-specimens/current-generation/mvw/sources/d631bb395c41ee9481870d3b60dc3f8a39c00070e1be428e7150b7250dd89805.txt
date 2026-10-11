---
metadata:
  version: 3.0.0
---

## Capability

Launch a workflow as a child of the current session, and report where it opens and where it writes.

## Inputs

### parent_session_index

The current session's `session_index` — parent for `dispatch_child`.

### workflow_id

Child workflow ID.

## Outputs

### child_session_index

The 6-character base32 `session_index` of the newly created child session.

### child_planning_folder_path

The canonical absolute path of the child's planning folder, as resolved by the server. Artifacts the child writes land here, and this is where its results are read back from — the launch record the server keeps carries the child's completion, not its results.

### child_initial_activity

The child workflow's `initialActivity`, and the only route into it: a session that has entered no activity reports none and refuses to serve one.

## Protocol

### 1. Open the child session

- Call `dispatch_child { session_index: {parent_session_index}, workflow_id: {workflow_id}, agent_id: 'workflow-orchestrator' }`; capture `{child_session_index}`, `{child_planning_folder_path}` (server-resolved; do not compose the path), and `workflow.initialActivity` as `{child_initial_activity}`. Same child-session shape as [create-session](./create-session.md) (server embeds under the parent; no separate child folder)

## Rules

### solo-walk-the-child

The context that launches a workflow walks it, in that same context: it holds the child's identity and nothing else can be pointed at the child. A spawned agent has no dispatch primitive (`spawn-agent.depth-1-only`), so there is no orchestrator/worker split available inside a launch — the walk is one context taking every activity of the child, each through [take-activity](./take-activity.md).
