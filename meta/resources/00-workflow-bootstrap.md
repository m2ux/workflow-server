# Bootstrap Procedure

## Session Token Rule

`start_session` returns a `session_token`. **Every tool call after `start_session` requires `session_token` as a parameter.** Each tool response returns an updated token — always use the most recent one. There is no `workflow_id` parameter on these tools; the workflow is encoded inside the token.

## Steps

1. **discover** — Call first (no parameters). Returns the server info, available workflows, and this bootstrap procedure.
2. **list_workflows** — Match the user's goal to a workflow from the returned list. No session token needed.
3. **start_session(`workflow_id`)** — Call with the chosen `workflow_id`. Returns `{ session_token, workflow }`. Save the `session_token` — you will pass it to every subsequent call.
4. **get_skills(`session_token`)** — Pass the `session_token` from step 3. Returns behavioral protocols (session-protocol, agent-conduct) and workflow-specific skills. Save the updated `session_token` from the response.
5. **get_workflow(`session_token`, `summary=true`)** — Pass the latest `session_token`. Returns the workflow structure including `initialActivity` (which activity to load first) and the full activity list. Save the updated `session_token`.
6. **next_activity(`session_token`, `activity_id`)** — Pass the latest `session_token` and the `initialActivity` value from step 5 as `activity_id`. Loads the first activity definition and begins execution.

## Loading Skills and Resources

- **get_skill(`session_token`, `step_id`)** — Load the skill for a specific step. Returns the skill definition with `_resources` containing lightweight references (index, id, version — no content).
- **get_resource(`session_token`, `resource_index`)** — Load a resource's full content by index. Call this for each entry in `_resources` to load the content the skill requires. Supports cross-workflow refs (e.g., `meta/04`).
