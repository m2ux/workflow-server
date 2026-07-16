---
name: bootstrap-protocol
description: The mandatory session-bootstrap sequence executed by every agent at the start of a workflow.
---

# Bootstrap Protocol

IMPORTANT: YOU *MUST* *ALWAYS* EXECUTE ALL OF THESE STEPS

1. Read this MCP resource via your client's resource-fetch mechanism (it is an MCP resource URI, *not* an argument to the `get_resource` tool):
   - `workflow-server://schemas/workflow`

   Orchestrators need only the workflow schema. Activity and technique schemas are worker-side and load on demand.

2. `start_session { workflow_id: "meta", agent_id: "orchestrator" }`. Save the returned `session_index` (6-character base32). The server creates or rebinds `session.json` + `.session-token` under the planning folder; no agent-side state writes are required.

   - Target a planning folder: pass `planning_folder` as an **absolute** path (basename = slug); bare/relative paths are rejected. Read `planning_folder_path` from the response.
   - Omit `planning_folder` when the slug is unknown (transient session until `dispatch_child` promotes it).
   - Omit `context_mode` (or pass `"fresh"`). Client walks use per-activity disposable workers.

3. `get_workflow { session_index }`. The response carries the workflow's resolved operations bundle ahead of the workflow definition (separated by `\n\n---\n\n`). Follow the operations and rules in the bundle — ongoing delivery policy (worker-fresh, resource `#section` vs whole file, force-full escapes) lives there.

Pass `session_index` on every subsequent authenticated tool call. The index is stable across the entire session — there is no token rotation, adoption, or recovery protocol for the agent to manage.
