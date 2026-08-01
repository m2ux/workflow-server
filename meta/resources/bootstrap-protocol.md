---
name: bootstrap-protocol
description: The mandatory session-bootstrap sequence executed by every agent at the start of a workflow.
---

# Bootstrap Protocol

IMPORTANT: YOU *MUST* *ALWAYS* EXECUTE ALL OF THESE STEPS

1. Read this MCP resource via your client's resource-fetch mechanism (it is an MCP resource URI, *not* an argument to the `get_resource` tool): `workflow-server://schemas/workflow`

   - Orchestrators need only the workflow schema. Activity and technique schemas are worker-side and load on demand.

2. Derive the target repository as `owner/repo` by applying [resolve-host-repo](../techniques/version-control/resolve-host-repo.md) from the workspace directory: ascend to the outermost repository that claims the workspace checkout as a submodule, and read `owner/repo` from that host's origin remote. Accept both the SSH form (`git@host:owner/repo.git`) and the HTTPS form (`https://host/owner/repo.git`), dropping any trailing `.git`.

   - The derivation runs here, before step 3, because `repo` is required on the `start_session` call and a step inside a meta activity cannot inform the meta session's own binding. `00-discover-session` applies the same technique again so the derived facts also reach the client session it dispatches.
   - Prose sources are fallback only — resolve-host-repo.prose-sources-are-fallback-only.
   - When the derived host's directory basename disagrees with the repository segment of `owner/repo`, do not pick one silently: the server maps a repository onto a filesystem root by basename alone, so carry the divergence to the `host-binding-mismatch` gate in `00-discover-session`.

3. `start_session { workflow_id: "meta", agent_id: "orchestrator", repo, user_request }` per [start-session](../techniques/workflow-engine/start-session.md). Save the returned `session_index` (6-character base32) as bag `{meta_session_index}`. Record `{repo}` as bag `{target_repo}` (response echo when present, otherwise the value passed). The server creates or rebinds `session.json` + `.session-token` under the planning folder; no agent-side state writes are required.

   - The call returns more than an index: the running workflow's id, version, title and description (the version later drift detection compares against), the `planning_slug` the session is keyed on, the canonical `planning_folder_path` once a durable one resolves, the echoed `repo` binding, and `context_mode` / `migrated` when either applies.
   - `repo_unbound: true` comes back when a transient session booted with no repository bound. That is the signal the derivation above yielded nothing and a fallback source must supply `repo` before any durable path resolves — treat it as the fallback branch, not as a successful boot.
   - Planning-folder targeting (`planning_folder` absolute-or-omit, response `planning_folder_path`) and `context_mode` topology follow [start-session](../techniques/workflow-engine/start-session.md) (and [dispatch-topology](../techniques/workflow-engine/TECHNIQUE.md#dispatch-topology) for disposable workers).

4. `get_workflow { session_index }`. The response carries the workflow's resolved operations bundle ahead of the workflow's metadata and activity roster (separated by `\n\n---\n\n`). Follow the operations and rules in the bundle — ongoing delivery policy lives there ([workflow-engine](../techniques/workflow-engine/TECHNIQUE.md)).

   - Pass `session_index` on every subsequent authenticated tool call ([session-index-passes-on-each-call](../techniques/workflow-engine/TECHNIQUE.md#session-index-passes-on-each-call)).
   - Every worker spawn from here on is blocking-equivalent under [foreground-always](../techniques/harness-compat/TECHNIQUE.md#foreground-always): on Cursor set `run_in_background=false` explicitly and await the worker envelope before the next orchestrator step ([cursor](../techniques/harness-compat/cursor.md)).
