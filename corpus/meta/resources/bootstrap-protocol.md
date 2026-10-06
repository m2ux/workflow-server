---
name: bootstrap-protocol
description: The mandatory session-bootstrap sequence executed by every agent at the start of a workflow.
---

# Bootstrap Protocol

IMPORTANT: YOU *MUST* *ALWAYS* EXECUTE ALL OF THESE STEPS

1. Call `start_session { workflow_id: "meta", agent_id: "orchestrator", working_directory, user_request }`.
   `working_directory` is the absolute path of the checkout under work. The server derives
   `owner/repo` from that checkout's origin remote. `repo` is optional and must equal the derived
   origin when present. Origin binds even when the checkout folder is named for a branch.

   When the response names a `decision` and has no `session_index`, present the `recommendation`
   and `candidates` and wait for the user. Retry the same call after they settle it:

   - `unbound-repo`: pass `repo` as `owner/repo`.
   - `binding-mismatch`: pass `repo` matching the checkout, or a different `working_directory`.
   - `component-choice`: name a component in the request or pass that component's `working_directory`.
   - `unmapped-root`: pass a `working_directory` under a checkout this server serves.
   - `workflow-selection`: pass `target_workflow_id` set to the chosen catalog id, or `user_request`.
   - `resume-session`: pass `planning_folder` for the chosen saved session, or `fresh: true` to open
     a new client.

2. Keep the `session_index` the response returns, a 6-character base32 string, and the `repo` it
   echoes. Later text calls them `meta_session_index` and `target_repo`. A fresh open also returns
   `planning_folder_path` and `client`, the client session it opened alongside this one; a resume
   returns no `client`. Where two indices are in hand, the one from step 1 is this session's.

3. Call `inspect_session { session_index, view: "activities" }` and read `current`, the activities
   in flight. Where it is empty, call
   `next_activity { session_index, activity_id: "dispatch-client-workflow" }`. Where it names one,
   this session stands on that activity already and makes no advance. Where it names several, say
   so and stop: this opening expects one.

   An open checkpoint refuses every other call. Present it and settle it with `respond_checkpoint`
   before going on.

4. Call `get_activity { session_index, activity_id, context_tokens }` for the activity this session
   now stands on. `context_tokens` is your own context window in tokens. That activity carries the
   run that walks the client session, the techniques its steps bind, and the contract the
   orchestrator is held to. From here on it governs and this text stops applying.

## Rules

These bind from your very next call, for the whole session.

- **Every call is attributed.** Pass `session_index` on every authenticated tool call.

- **Every worker is awaited.** No fire-and-forget. On Cursor that means setting
  `run_in_background=false` explicitly and waiting for the worker's envelope.
