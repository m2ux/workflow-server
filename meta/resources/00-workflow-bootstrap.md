# Bootstrap Procedure

## Session Token Rule

`start_session` returns a `session_token`. **Every tool call after `start_session` requires `session_token` as a parameter.** Each tool response returns an updated token — always use the most recent one. There is no `workflow_id` parameter on these tools; the workflow is encoded inside the token.

## Starting a Session

1. **discover** — Call first (no parameters). Returns the server info, available workflows, and this bootstrap procedure.
2. **list_workflows** — Match the user's goal to a workflow from the returned list. No session token needed.
3. **start_session(`workflow_id: "meta"`)** — Start a meta session. This provides a token for the session discovery activity.
4. **get_skills(`session_token`)** — Load behavioral protocols.
5. **next_activity(`session_token`, `activity_id: "discover-session"`)** — Run the session discovery activity. This searches `.engineering/artifacts/planning/` for saved workflow sessions matching the user's request (ticket ID, branch name, etc.). If a match is found, a checkpoint asks the user whether to resume. The activity resolves with a saved `session_token` (if resuming) or signals a fresh start.
6. **start_session(`workflow_id`, `session_token?`)** — Start the target workflow session. If discover-session found a saved token, pass it to inherit the previous session position. Otherwise call with only `workflow_id` for a fresh session.
7. **get_workflow(`session_token`, `summary=true`)** — Load the target workflow structure including `initialActivity` and the activity list.
8. **next_activity(`session_token`, `activity_id`)** — For fresh sessions, use `initialActivity` from step 7. For resumed sessions, use the restored `currentActivity` from the state file. If resuming, also restore variables from the state file.

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
