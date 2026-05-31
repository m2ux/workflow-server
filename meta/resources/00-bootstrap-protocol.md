---
id: bootstrap-protocol
version: 8.4.0
---

# Bootstrap Protocol

IMPORTANT: YOU *MUST* *ALWAYS* EXECUTE ALL OF THESE STEPS

1. Fetch:
   - `workflow-server://schemas/workflow`
   - `workflow-server://schemas/skill`
   - `workflow-server://schemas/activity`

2. `start_session({ workflow_id: "meta", agent_id: "orchestrator" })`. Save the returned `session_index` (6-character base32). The server creates or rebinds `session.json` + `.session-token` (seal) under the planning folder on this call; no agent-side state writes are required.

   To identify a specific planning folder, pass `planning_folder` as an absolute path (e.g., `start_session({ planning_folder: "/abs/path/to/.engineering/artifacts/planning/<slug>", agent_id: "orchestrator" })`). Only the basename is consumed as the slug; the rest of the path is a hint and is otherwise ignored. The server resolves the slug against its OWN workspace planning root and records the canonical server-side path in `session.json#planningFolderPath`, returning it on the response as `planning_folder_path`. The agent never has to reconcile paths — pass whatever absolute path you have, read back the canonical one from the response. Bare slugs and relative paths are rejected.

   Omit `planning_folder` for the meta bootstrap when the slug isn't known yet. The server mints a transitional slug from a UUID and parks the session in `os.tmpdir()`; `dispatch_child` later supplies the real slug and promotes the session to its workspace folder.

3. `get_workflow({ session_index })`. The response carries the workflow's resolved operations bundle ahead of the workflow definition (separated by `\n\n---\n\n`). Follow the operations and rules in the bundle to drive execution.

Pass `session_index` on every subsequent authenticated tool call. The index is stable across the entire session — there is no token rotation, adoption, or recovery protocol for the agent to manage.
