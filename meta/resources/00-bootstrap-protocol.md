---
id: bootstrap-protocol
version: 6.1.0
---

# Bootstrap Protocol

1. Fetch:
   - `workflow-server://schemas/workflow`
   - `workflow-server://schemas/skill`

2. `start_session({ workflow_id: "meta", agent_id: "orchestrator" })`. Save the returned `session_token`.

3. `get_workflow({ session_token })`. Follow the primary skill returned in the response.
