# Bootstrap Procedure

## Session Token Rule

`start_session` returns a `session_token`. **Every tool call after `start_session` requires `session_token` as a parameter.** Each tool response returns an updated token — always use the most recent one. There is no `workflow_id` parameter on these tools; the workflow is encoded inside the token.

## Starting a Session

1. **discover** — Call first (no parameters). Returns the server info, available workflows, and this bootstrap procedure.
2. **list_workflows** — Match the user's goal to a workflow from the returned list. No session token needed.
3. **Session discovery (resume only)** — If the user explicitly requests to resume a workflow (e.g., "resume", "continue", "pick up where I left off"), search for a saved session **before** calling `start_session`:
   - Extract a ticket identifier from the user request (GitHub issue `#N`, Jira key `PROJ-123`, branch name, or work package name).
   - Search `.engineering/artifacts/planning/` for directories containing a `workflow-state.json`.
   - Read matching state files to find one whose saved `issue_number`, `branch_name`, or directory name matches the identifier.
   - If found: extract the saved `session_token` and `planning_folder_path` from the file. Proceed to step 4 with this token.
   - If not found: inform the user no previous session was found. Proceed to step 4 without a token (fresh session).
4. **start_session(`workflow_id`, `session_token?`)** — If step 3 found a saved token, pass it to inherit the previous session position. Otherwise call with only `workflow_id` for a fresh session. Save the returned `session_token`.
5. **get_skills(`session_token`)** — Load behavioral protocols and workflow-specific skills.
6. **get_workflow(`session_token`, `summary=true`)** — Load the workflow structure including `initialActivity` and the activity list.
7. **next_activity(`session_token`, `activity_id`)** — For fresh sessions, use `initialActivity` from step 6. For resumed sessions, use the restored `currentActivity` from the state file. If resuming, also restore variables from the state file.

## Worker Dispatch (Token Inheritance)

When the orchestrator dispatches a worker, the worker should call `start_session` with the orchestrator's token to inherit the session state:

- **start_session(`workflow_id`, `session_token`, `agent_id`)** — The returned token inherits `sid`, `act`, `pcp`, `pcpt`, and all state from the parent. The `agent_id` is stamped into the signed `aid` field (e.g., `"worker-1"`). The worker shares the same session and is subject to the same checkpoint gate.

This ensures the worker cannot bypass checkpoint obligations — pending checkpoints from `next_activity` carry over into the inherited token.

## Checkpoint Resolution

When `next_activity` loads an activity with required checkpoints, those checkpoint IDs are embedded in the session token. **You cannot call `next_activity` for a different activity until all checkpoints are resolved.** Attempting to do so produces a hard error listing the pending checkpoints and how to resolve each one.

- **respond_checkpoint(`session_token`, `checkpoint_id`, ...)** — Resolve a pending checkpoint. Exactly one of:
  - `option_id` — the user's selected option (present the checkpoint to the user first)
  - `auto_advance: true` — use the checkpoint's default option (only for non-blocking checkpoints after the `autoAdvanceMs` timer elapses)
  - `condition_not_met: true` — dismiss a conditional checkpoint whose condition was not met

The response includes any effects from the selected option and the updated session token with the checkpoint removed from the pending list.

## Loading Skills and Resources

- **get_skill(`session_token`, `step_id`)** — Load the skill for a specific step. Returns the skill definition with `_resources` containing lightweight references (index, id, version — no content).
- **get_resource(`session_token`, `resource_index`)** — Load a resource's full content by index. Call this for each entry in `_resources` to load the content the skill requires. Supports cross-workflow refs (e.g., `meta/04`).
