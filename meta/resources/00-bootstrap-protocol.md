---
id: bootstrap-protocol
version: 6.0.0
---

# Bootstrap Protocol

1. Fetch the schemas needed to interpret the next response:
   - `workflow-server://schemas/workflow` — workflow definitions
   - `workflow-server://schemas/skill` — skill definitions

2. `start_session({ workflow_id: "meta", agent_id: "orchestrator" })` — save the returned `session_token`. Every subsequent tool call passes the most recent token.

3. `get_workflow({ session_token })` — returns the meta workflow's primary skill (raw TOON) followed by the workflow definition. Follow the primary skill's instructions from here.

Additional schemas (`activity`, `condition`, `state`) are fetched later when their content first appears.
