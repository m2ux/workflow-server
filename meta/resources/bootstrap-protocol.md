---
name: bootstrap-protocol
description: The mandatory session-bootstrap sequence executed by every agent at the start of a workflow.
---

# Bootstrap Protocol

IMPORTANT: YOU *MUST* *ALWAYS* EXECUTE ALL OF THESE STEPS

1. Read this MCP resource via your client's resource-fetch mechanism (it is an MCP resource URI, *not* an argument to the `get_resource` tool):
   - `workflow-server://schemas/workflow`

   Orchestrators need only the workflow schema. Activity and technique schemas are worker-side and load on demand.

2. Resolve the target repository:

   - Read the workspace `AGENTS.md` (or `CLAUDE.md`) for an `owner/repo` line, or take `owner/repo` from the user.
   - Always pass that value as `repo` on the next step. The server writes it to `session.json#repo` — the durable binding for the session. Do not invent owner/repo pairs. Do not branch on how the server is installed.

3. `start_session { workflow_id: "meta", agent_id: "orchestrator", repo }`. Save the returned `session_index` (6-character base32). The server creates or rebinds `session.json` + `.session-token` under the planning folder; no agent-side state writes are required.

   - Always include `repo: "owner/repo"` (from step 2). The response echoes `repo` when written to `session.json`.
   - Target a planning folder: pass `planning_folder` as an **absolute** path (basename = slug); bare/relative paths are rejected. Read `planning_folder_path` from the response. A path under `…/<owner>/<repo>/…` can also supply the repo binding.
   - Omit `planning_folder` when the slug is unknown (transient session until `dispatch_child` promotes it). Do **not** invent a planning path for a slug that does not exist yet.
   - Omit `context_mode` (or pass `"fresh"`). Client walks use per-activity disposable workers.
   - If `session.repo` is still unbound after start (response has no `repo`), pass `repo` on the first `dispatch_child` (bind-if-missing onto the parent session).

4. `get_workflow { session_index }`. The response carries the workflow's resolved operations bundle ahead of the workflow definition (separated by `\n\n---\n\n`). Follow the operations and rules in the bundle — ongoing delivery policy (worker-fresh, resource `#section` vs whole file, force-full escapes) lives there.

Pass `session_index` on every subsequent authenticated tool call. The index is stable across the entire session — there is no token rotation, adoption, or recovery protocol for the agent to manage.
