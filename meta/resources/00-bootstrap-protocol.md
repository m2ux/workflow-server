---
id: bootstrap-protocol
version: 1.1.0
---

1. Call `list_workflows` to get available workflows.
2. **Compare** the user's stated goal to workflow descriptions. If multiple workflows could match:
   * Use AskQuestion to ask the user to clarify.
   * IMPORTANT! Never skip workflow matching. If no workflow matches, **inform the user** — this is a design gap.
3. Present workflows with title, description, and tags and let the user select one.
4. Start a new session by calling: `start_session(workflow_id: "meta","agent_id: "meta")`.  
5. Save the returned `session_token` — it is required for all subsequent calls.
6. Call `get_skill(session_token: <session_token>,"agent_id: "meta")` to load the meta workflow's primary skill
7. Follow the skill protocol to continue the bootstrap process