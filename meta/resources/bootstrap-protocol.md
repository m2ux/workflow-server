---
name: bootstrap-protocol
description: The mandatory session-bootstrap sequence executed by every agent at the start of a workflow.
---

# Bootstrap Protocol

IMPORTANT: YOU *MUST* *ALWAYS* EXECUTE ALL OF THESE STEPS

1. Read this MCP resource via your client's resource-fetch mechanism (it is an MCP resource URI, *not* an argument to the `get_resource` tool): `workflow-server://schemas/workflow`

   - Orchestrators need only the workflow schema. Activity and technique schemas are worker-side and load on demand.

2. Resolve the target repository as `owner/repo` from the workspace `AGENTS.md` or `CLAUDE.md`, or from the user. Use only a repository the user or workspace identifies.

3. `start_session { workflow_id: "meta", agent_id: "orchestrator", repo }` per [start-session](../techniques/workflow-engine/start-session.md). Save the returned `session_index` (6-character base32) as bag `{meta_session_index}`. Record `{repo}` as bag `{target_repo}` (response echo when present, otherwise the value passed). The server creates or rebinds `session.json` + `.session-token` under the planning folder; no agent-side state writes are required.

   - Planning-folder targeting (`planning_folder` absolute-or-omit, response `planning_folder_path`) and `context_mode` topology follow [start-session](../techniques/workflow-engine/start-session.md) (and [dispatch-topology](../techniques/workflow-engine/TECHNIQUE.md#dispatch-topology) for disposable workers).

4. `get_workflow { session_index }`. The response carries the workflow's resolved operations bundle ahead of the workflow definition (separated by `\n\n---\n\n`). Follow the operations and rules in the bundle — ongoing delivery policy lives there ([workflow-engine](../techniques/workflow-engine/TECHNIQUE.md)).

   - Pass `session_index` on every subsequent authenticated tool call ([session-index-passes-on-each-call](../techniques/workflow-engine/TECHNIQUE.md#session-index-passes-on-each-call)).
