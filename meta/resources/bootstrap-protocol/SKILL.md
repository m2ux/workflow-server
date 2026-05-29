---
name: bootstrap-protocol
description: The mandatory session-bootstrap sequence executed by every agent at the start of a workflow.
---

# Bootstrap Protocol

IMPORTANT: YOU *MUST* *ALWAYS* EXECUTE ALL OF THESE STEPS

1. Fetch:
   - `workflow-server://schemas/workflow`
   - `workflow-server://schemas/skill`
   - `workflow-server://schemas/activity`

2. `start_session { workflow_id: "meta", agent_id: "orchestrator" }`. Save the returned `session_index` (6-character base32). The server creates or rebinds `session.json` + `.session-token` (seal) under the planning folder on this call; no agent-side state writes are required.

3. `get_workflow { session_index }`. The response carries the workflow's resolved operations bundle ahead of the workflow definition (separated by `\n\n---\n\n`). Follow the operations and rules in the bundle to drive execution.

Pass `session_index` on every subsequent authenticated tool call. The index is stable across the entire session — there is no token rotation, adoption, or recovery protocol for the agent to manage.
