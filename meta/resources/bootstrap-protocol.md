---
name: bootstrap-protocol
description: The mandatory session-bootstrap sequence executed by every agent at the start of a workflow.
---

# Bootstrap Protocol

IMPORTANT: YOU *MUST* *ALWAYS* EXECUTE ALL OF THESE STEPS

1. Read this MCP resource via your client's resource-fetch mechanism (it is an MCP resource URI, *not* an argument to the `get_resource` tool):
   - `workflow-server://schemas/workflow`

   The orchestrator drives the workflow-level loop (activities, `initialActivity`, transitions) and never calls `get_activity` or `get_technique`, so it needs only the workflow schema. The activity and technique schemas are the worker's domain and are loaded there on demand.

2. `start_session { workflow_id: "meta", agent_id: "orchestrator" }`. Save the returned `session_index` (6-character base32). The server creates or rebinds `session.json` + `.session-token` (seal) under the planning folder on this call; no agent-side state writes are required.

   To target a specific planning folder, pass `planning_folder` as an absolute path (e.g. `start_session { planning_folder: "/abs/path/to/.engineering/artifacts/planning/<slug>", agent_id: "orchestrator" }`). Only the basename is consumed as the slug; the rest of the path is a hint and is otherwise ignored. The server resolves the slug against its OWN workspace planning root, records the canonical path in `session.json#planningFolderPath`, and returns it on the response as `planning_folder_path` — pass whatever absolute path you have and read the canonical one back; you never reconcile paths yourself. Bare slugs and relative paths are rejected.

   Omit `planning_folder` for the meta bootstrap when the slug isn't known yet: the server mints a transitional slug from a UUID and parks the session in `os.tmpdir()`, and `dispatch_child` later supplies the real slug and promotes the session to its workspace folder.

   `context_mode` is decided by topology at `start_session` / `dispatch_child`: **solo** (this same agent context runs every activity — no worker spawning) → pass `context_mode: "persistent"` and ONE canonical `agent_id` for the whole walk so already-delivered content collapses to unchanged-references; **dispatch** (per-activity workers) → omit or `"fresh"`.

3. `get_workflow { session_index }`. The response carries the workflow's resolved operations bundle ahead of the workflow definition (separated by `\n\n---\n\n`). Follow the operations and rules in the bundle to drive execution.

Pass `session_index` on every subsequent authenticated tool call. The index is stable across the entire session — there is no token rotation, adoption, or recovery protocol for the agent to manage.
