---
name: bootstrap-protocol
description: The mandatory session-bootstrap sequence executed by every agent at the start of a workflow.
---

# Bootstrap Protocol

IMPORTANT: YOU *MUST* *ALWAYS* EXECUTE ALL OF THESE STEPS

1. Read this MCP resource via your client's resource-fetch mechanism (it is an MCP resource URI, *not* an argument to the `get_resource` tool): `workflow-server://schemas/workflow`

   - Orchestrators need only the workflow schema. Activity and technique schemas are worker-side and load on demand.

2. Derive the target repository as `owner/repo` by applying [resolve-host-repo](../techniques/version-control/resolve-host-repo.md) from the workspace directory: ascend to the outermost repository that claims the workspace checkout as a submodule, and read `owner/repo` from that host's origin remote.

   - The derivation runs here, before step 3, because `repo` is required on the `start_session` call and a step inside a meta activity cannot inform the meta session's own binding. `00-discover-session` applies the same technique again so the derived facts also reach the client session it dispatches.
   - Fall back to the workspace `AGENTS.md` or `CLAUDE.md`, or to the user, only when the workspace is not a git repo or its host has no origin remote.
   - When the derived host's directory basename disagrees with the repository segment of `owner/repo`, do not pick one silently: the server maps a repository onto a filesystem root by basename alone, so carry the divergence to the `host-binding-mismatch` gate in `00-discover-session`.

3. `start_session { workflow_id: "meta", agent_id: "orchestrator", repo, user_request }` per [start-session](../techniques/workflow-engine/start-session.md). Save the returned `session_index` (6-character base32) as bag `{meta_session_index}`. Record `{repo}` as bag `{target_repo}` (response echo when present, otherwise the value passed). The server creates or rebinds `session.json` + `.session-token` under the planning folder; no agent-side state writes are required.

   - Planning-folder targeting (`planning_folder` absolute-or-omit, response `planning_folder_path`) and `context_mode` topology follow [start-session](../techniques/workflow-engine/start-session.md) (and [dispatch-topology](../techniques/workflow-engine/TECHNIQUE.md#dispatch-topology) for disposable workers).

4. `get_workflow { session_index }`. The response carries the workflow's resolved operations bundle ahead of the workflow definition (separated by `\n\n---\n\n`). Follow the operations and rules in the bundle — ongoing delivery policy lives there ([workflow-engine](../techniques/workflow-engine/TECHNIQUE.md)).

   - Pass `session_index` on every subsequent authenticated tool call ([session-index-passes-on-each-call](../techniques/workflow-engine/TECHNIQUE.md#session-index-passes-on-each-call)).
