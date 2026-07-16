---
metadata:
  version: 1.1.0
---

## Capability

Dispatch a fresh client workflow as a child of the meta session via `dispatch_child`. For the top-level `start_session` tool (parent/meta entry), see [start-session](./start-session.md).

## Inputs

### parent_session_index

`session_index` of the meta (parent) session — typically the `meta_session_index` variable.

### workflow_id

Target client workflow id (e.g., `work-package`).

### planning_slug

The work-package planning slug — `YYYY-MM-DD-{initiative_name}`. Names the planning folder the server materialises under its workspace `.engineering` root. Omit when no slug has been derived; the server then falls back to `YYYY-MM-DD-<workflow_id>`.

## Outputs

### session_index

The 6-character base32 `session_index` of the newly created child session

### planning_folder_path

The canonical absolute path of the planning folder, as resolved by the server under its own workspace `.engineering` root. The authoritative artifact location for the work package, bound to the workflow's `{planning_folder_path}` variable.

## Protocol

1. Call `dispatch_child { session_index: {parent_session_index}, workflow_id: {workflow_id}, agent_id: 'orchestrator', planning_slug: {client_planning_slug} }`; capture the returned `{session_index}` for use in all subsequent calls inside the child workflow, and the returned `{planning_folder_path}` (the server-resolved absolute folder under its workspace) as the single artifact location. The server appends the child under `parent.triggeredWorkflows[N].state` and embeds the full child SessionFile inline; the agent does not deal with separate child folders, and does not compose the folder path itself.
