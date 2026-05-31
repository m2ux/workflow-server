---
id: bootstrap-protocol
version: 8.3.0
---

# Bootstrap Protocol

IMPORTANT: YOU *MUST* *ALWAYS* EXECUTE ALL OF THESE STEPS

1. Fetch:
   - `workflow-server://schemas/workflow`
   - `workflow-server://schemas/skill`
   - `workflow-server://schemas/activity`

2. `start_session({ workflow_id: "meta", agent_id: "orchestrator" })`. Save the returned `session_index` (6-character base32). The server creates or rebinds `session.json` + `.session-token` (seal) under the planning folder on this call; no agent-side state writes are required.

   The optional `planning_folder` argument identifies a known planning folder by its **absolute path** (e.g., `start_session({ planning_folder: "/abs/path/to/.engineering/artifacts/planning/<slug>", agent_id: "orchestrator" })`). The server derives the slug from `basename(path)`, validates the path is under its workspace planning root, and records the canonical path in `session.json#planningFolderPath`. On resume, if the supplied path differs from the recorded value (folder was moved or renamed within the planning root), the server silently overwrites the stored value with the new location — no checkpoint, no error. Bare slugs and relative paths are rejected; only absolute paths are accepted.

   Omit `planning_folder` for the meta bootstrap when the slug isn't known yet. The server mints a transitional slug from a UUID and parks the session in `os.tmpdir()`; `dispatch_child` later supplies the real slug and promotes the session to its workspace folder.

3. `get_workflow({ session_index })`. The response carries the workflow's resolved operations bundle ahead of the workflow definition (separated by `\n\n---\n\n`). Follow the operations and rules in the bundle to drive execution.

Pass `session_index` on every subsequent authenticated tool call. The index is stable across the entire session — there is no token rotation, adoption, or recovery protocol for the agent to manage.
