---
name: bootstrap-protocol
description: The mandatory session-bootstrap sequence executed by every agent at the start of a workflow.
---

# Bootstrap Protocol

IMPORTANT: YOU *MUST* *ALWAYS* EXECUTE ALL OF THESE STEPS

1. **Open the session.**

   Call `start_session { workflow_id: "meta", agent_id: "orchestrator", working_directory, user_request }`.
   > - `working_directory` is the absolute path of the checkout under work.
   > - The server derives `owner/repo` from that checkout's origin remote.
   > - `repo` is optional and must equal the derived origin when present.
   > - Origin binds even when the checkout folder is named for a branch.

2. **Settle any opening decision**, where the response names a `decision` and has no `session_index`.

   Present the `recommendation` and `candidates`, wait for the user, then retry the same call with
   what they chose.
   > - `unbound-repo`: pass `repo` as `owner/repo`.
   > - `binding-mismatch`: pass `repo` matching the checkout, or a different `working_directory`.
   > - `component-choice`: name a component in the request, or pass that component's `working_directory`.
   > - `unmapped-root`: pass a `working_directory` under a checkout this server serves.
   > - `workflow-selection`: pass `target_workflow_id` set to the chosen catalog id, or `user_request`.
   > - `resume-session`: pass `planning_folder` for the chosen saved session, or `fresh: true` for a new client.

3. **Keep what the response returns.**

   Hold the `session_index`, a 6-character base32 string, and the `repo` it echoes. Later text
   calls them `meta_session_index` and `target_repo`.
   > - A fresh open also returns `planning_folder_path`, and `client`, the client session it opened
   >   alongside this one. A resume returns no `client`.
   > - Where two indices are in hand, the one this call returned is this session's.

4. **Read where the session stands.**

   Call `inspect_session { session_index, view: "activities" }` and read `current`, the activities
   in flight.
   > - Empty means the session has not opened on an activity yet.
   > - One entry means this session stands on that activity already.
   > - Several entries mean this is not an opening. Say so and stop.

5. **Settle an open checkpoint**, where step 4 reports one.

   Present it to the user and answer it with `respond_checkpoint`.
   > An open checkpoint refuses every other call, so nothing below runs until it is settled.

6. **Advance onto the opening activity**, where step 4 found nothing in flight.

   Call `next_activity { session_index, activity_id: "dispatch-client-workflow" }`.
   > A session already standing on an activity makes no advance. Skip to step 7.

7. **Take the activity this session now stands on.**

   Call `get_activity { session_index, activity_id, context_tokens }`, naming the activity step 4
   reported or step 6 advanced onto.
   > - `context_tokens` is your own context window in tokens.
   > - That activity carries the run that walks the client session, the techniques its steps bind,
   >   and the contract the orchestrator is held to.
   > - From here on it governs and this text stops applying.

## Rules

These bind from your very next call, for the whole session.

- **Every call is attributed.** Pass `session_index` on every authenticated tool call.

- **Every worker is awaited.** No fire-and-forget. On Cursor that means setting
  `run_in_background=false` explicitly and waiting for the worker's envelope.
