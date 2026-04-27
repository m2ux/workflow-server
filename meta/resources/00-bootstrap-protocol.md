---
id: bootstrap-protocol
version: 7.0.0
---

# Bootstrap Protocol

1. Fetch:
   - `workflow-server://schemas/workflow`
   - `workflow-server://schemas/skill`
   - `workflow-server://schemas/activity`

2. `start_session({ workflow_id: "meta", agent_id: "orchestrator" })`. Save the returned `session_token`.

3. `get_workflow({ session_token })`. The response carries the workflow's resolved operations bundle ahead of the workflow definition (separated by `\n\n---\n\n`). Follow the operations and rules in the bundle to drive execution.
