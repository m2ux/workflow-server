---
id: bootstrap-protocol
version: 2.0.0
---

1. Call `list_workflows` to get available workflows.
2. **Compare** the user's stated goal to workflow descriptions. If multiple workflows could match:
   * Present workflows with title, description, and tags and let the user select one.
   * IMPORTANT! Never skip workflow matching. If no workflow matches, **inform the user** — this is a design gap.
3. Start a new session by calling: `start_session({ workflow_id: "<matched-workflow-id>", agent_id: "orchestrator" })`. Use the workflow_id matched in step 2 — do NOT default to "meta".
4. Save the returned `session_token` — it is required for all subsequent calls.
5. Call `get_skill(session_token: <session_token>)` to load the workflow's primary skill
6. Follow the skill protocol to continue the bootstrap process