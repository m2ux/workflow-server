---
id: bootstrap-protocol
version: 4.0.0
---

IMPORTANT: Do NOT attempt to connect to Github/Jira to resolve issue details yet. This happens later.

## START a new workflow

1. Call `list_workflows` to get available workflows.
2. **Compare** the user's stated goal to workflow descriptions. If multiple workflows could match:
   * Present workflows with title, description, and tags and let the user select one.
   * IMPORTANT! Never skip workflow matching. If no workflow matches, **inform the user** — this is a design gap.
3. Call `start_session({ workflow_id: "<matched-workflow-id>", agent_id: "orchestrator" })`. Use the workflow_id matched in step 2 — do NOT default to "meta".
4. Save the returned `session_token` — it is required for all subsequent calls.
5. Call `get_skill(session_token: <session_token>)` to load the workflow's primary skill. This is the orchestrator skill — it tells you how to coordinate the workflow. Do NOT skip this step.
6. Follow the skill protocol to continue the bootstrap process

## RESUME an existing workflow

1. Read the `workflow-state.json` file to get the saved `sessionToken` and `workflowId`.
2. Call `start_session({ session_token: "<saved-token>", agent_id: "orchestrator" })`. The workflow is derived from the token.
3. Save the returned `session_token` — it is required for all subsequent calls.
4. Call `get_workflow(session_token: <session_token>)` to load the workflow definition and its primary skill. The primary skill is the orchestrator skill — it tells you how to coordinate the workflow. Do NOT skip this step. Do NOT call next_activity or get_activity before loading the orchestrator skill.
5. Follow the skill protocol — it handles resume state, activity dispatch, and checkpoint resolution.