# Bootstrap Procedure

## Session Token Rule

`start_session` returns a `session_token`. **Every tool call after `start_session` requires `session_token` as a parameter.** Each tool response returns an updated token — always use the most recent one. There is no `workflow_id` parameter on these tools; the workflow is encoded inside the token.

## Starting a New Session

1. **discover** — Call first (no parameters). Returns the server info, available workflows, and this bootstrap procedure.
2. **list_workflows** — Match the user's goal to a workflow from the returned list. No session token needed.
3. **start_session(`workflow_id`)** — Call with the chosen `workflow_id`. Returns `{ session_token, workflow }`. Save the `session_token` — you will pass it to every subsequent call.
4. **get_skills(`session_token`)** — Pass the `session_token` from step 3. Returns behavioral protocols (session-protocol, agent-conduct) and workflow-specific skills. Save the updated `session_token` from the response.
5. **get_workflow(`session_token`, `summary=true`)** — Pass the latest `session_token`. Returns the workflow structure including `initialActivity` (which activity to load first) and the full activity list. Save the updated `session_token`.
6. **next_activity(`session_token`, `activity_id`)** — Pass the latest `session_token` and the `initialActivity` value from step 5 as `activity_id`. Loads the first activity definition and begins execution.

## Worker Dispatch (Token Inheritance)

When the orchestrator dispatches a worker, the worker should call `start_session` with the orchestrator's token to inherit the session state:

- **start_session(`workflow_id`, `session_token`, `agent_id`)** — The returned token inherits `sid`, `act`, `pcp`, `pcpt`, and all state from the parent. The `agent_id` is stamped into the signed `aid` field (e.g., `"worker-1"`). The worker shares the same session and is subject to the same checkpoint gate.

This ensures the worker cannot bypass checkpoint obligations — pending checkpoints from `next_activity` carry over into the inherited token.

## Resume from Saved Token

To resume a workflow from a previous session, pass the saved token to `start_session`:

- **start_session(`workflow_id`, `session_token`)** — Inherits the saved position (`act`), checkpoint state, and session identity. The agent restores its variables from its own state file.

## Mid-Session Calls

If the user already has an active session — indicated by a `session_token`, explicit bootstrap instructions, or a direct request to call a tool like `next_activity` — **do not call `start_session` again** without the existing token. Calling `start_session` without `session_token` creates a brand-new session and discards all prior session state.

Instead, use the provided `session_token` and call the requested tool directly (e.g., `next_activity`, `get_workflow`, `get_skill`). Continue passing the latest token from each response as usual.

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
