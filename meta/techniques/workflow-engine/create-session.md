---
metadata:
  version: 1.3.0
---

## Capability

Fresh client workflow session as a child of the meta session. Top-level entry is start-session.

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

1. Call `dispatch_child { session_index: {parent_session_index}, workflow_id: {workflow_id}, agent_id: 'orchestrator', planning_slug: {client_planning_slug} }`; capture `{session_index}` and `{planning_folder_path}` (server-resolved; do not compose the path). Child session embed under the parent follows the `dispatch_child` response / [handle-sub-workflow](./handle-sub-workflow.md).

   Omit `context_mode` (or `"fresh"`) per [dispatch-topology](./TECHNIQUE.md#dispatch-topology) / [workers-need-full-delivery](./dispatch-activity.md#workers-need-full-delivery).
