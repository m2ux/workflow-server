---
name: bootstrap-protocol
description: The mandatory session-bootstrap sequence executed by every agent at the start of a workflow.
---

# Bootstrap Protocol

IMPORTANT: YOU *MUST* *ALWAYS* EXECUTE ALL OF THESE STEPS

1. Read this MCP resource via your client's resource-fetch mechanism (it is an MCP resource URI, *not* an argument to the `get_resource` tool):
   - `workflow-server://schemas/workflow`

   Orchestrators need only the workflow schema. Activity and technique schemas are worker-side and load on demand.

2. Resolve the target repository when the server is on an **install multi-root** (`session_scope: multi` on `discover` / `health_check`, or the tool descriptions mention install multi-root):

   - Read the workspace `AGENTS.md` (or `CLAUDE.md`) for an `owner/repo` line, or take `owner/repo` from the user.
   - Pass that value as `repo` on the next step. Without it, a transient meta session cannot be promoted at `dispatch_child`.
   - Single-root servers do not need `repo`.

3. `start_session { workflow_id: "meta", agent_id: "orchestrator", repo? }`. Save the returned `session_index` (6-character base32). The server creates or rebinds `session.json` + `.session-token` under the planning folder; no agent-side state writes are required.

   - On install multi-root, include `repo: "owner/repo"` (from step 2). The response echoes `repo` when bound.
   - Target a planning folder: pass `planning_folder` as an **absolute** path (basename = slug); bare/relative paths are rejected. Read `planning_folder_path` from the response. A path under `engineering/<owner>/<repo>/…` can also supply the repo binding.
   - Omit `planning_folder` when the slug is unknown (transient session until `dispatch_child` promotes it). Do **not** invent a planning path under engineering for a slug that does not exist yet.
   - Omit `context_mode` (or pass `"fresh"`). Client walks use per-activity disposable workers.
   - If the response includes `promotion_requires_repo: true`, re-call `start_session` with `repo` before the first `dispatch_child`.

4. `get_workflow { session_index }`. The response carries the workflow's resolved operations bundle ahead of the workflow definition (separated by `\n\n---\n\n`). Follow the operations and rules in the bundle — ongoing delivery policy (worker-fresh, resource `#section` vs whole file, force-full escapes) lives there.

Pass `session_index` on every subsequent authenticated tool call. The index is stable across the entire session — there is no token rotation, adoption, or recovery protocol for the agent to manage.
