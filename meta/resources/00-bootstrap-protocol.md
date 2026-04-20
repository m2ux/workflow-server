---
id: bootstrap-protocol
version: 1.1.0
---

1. Call `list_workflows` to get available workflows.
2. **Compare** the user's stated goal to workflow descriptions. If multiple workflows could match:
   * Present workflows with title, description, and tags and let the user select one.
   * IMPORTANT! Never skip workflow matching. If no workflow matches, **inform the user** — this is a design gap.
3. Start a new session by calling: `start_session(agent_id: "meta")`.  The workflow defaults to "meta" (the bootstrap orchestration workflow).
4. Save the returned `session_token` — it is required for all subsequent calls.
5. Call `get_skill(session_token: <session_token>,"agent_id: "meta")` to load the meta workflow's primary skill
6. Follow the skill protocol to continue the bootstrap process