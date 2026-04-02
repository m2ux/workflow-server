# Bootstrap Procedure

## Steps

1. **discover** — Call first to learn the server, available workflows, and this bootstrap procedure.
2. **list_workflows** — Match the user's goal to a workflow from the returned list.
3. **start_session** — Call with the chosen `workflow_id`. Returns a session token for all subsequent calls.
4. **get_skills** — Call with `workflow_id` and the session token. Returns behavioral protocols (session-protocol, agent-conduct) and workflow-specific skills.
5. **get_workflow** — Call with `workflow_id` and `summary=true`. Returns the workflow structure including `initialActivity` (which activity to load first) and the full activity list.
6. **next_activity** — Call with the `initialActivity` value to load the first activity definition and begin execution.

## Loading Skills and Resources

- **get_step_skill** — Load the skill for a specific step (by `step_id`). Returns the skill definition with `_resources` containing lightweight references (index, id, version — no content).
- **get_resource** — Load a resource's full content by index. Call this for each entry in `_resources` to load the content the skill requires. Supports cross-workflow refs (e.g., `meta/04`).
