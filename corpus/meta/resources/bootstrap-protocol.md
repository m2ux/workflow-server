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

   Hold its `session_index`, a 6-character base32 string; its `workflow.initialActivity`, the
   activity this session opens on; its `current`, the activity already in flight; and its `status`.
   > - Every call below takes the `session_index`.
   > - A fresh open also returns `planning_folder_path`, and `client`, the client session it opened
   >   alongside this one. A resume returns no `client`.
   > - Where two session indices are in hand, the one this call returned is this session's.

4. **Stop**, where `status` came back `completed`.

   Tell the user this session's walk has already ended, and ask whether to open a fresh one.
   > A finished session leaves `current` empty for the same reason a new one does. Advancing it
   > restarts a walk that is already done, over client work that is already delivered.

5. **Settle an open checkpoint**, where the response names one.

   Call `present_checkpoint { session_index }` for its question and options, put those to the user,
   and call `respond_checkpoint { session_index, option_id }` with the option they chose.
   > - Pass `reply` alongside `option_id` where that option asks for text.
   > - An open gate refuses every other call, so nothing below runs until it is answered.

6. **Make the opening advance**, where `current` came back empty.

   Call `next_activity { session_index, activity_id }`, naming the `initialActivity` from step 3.
   > A `current` that already names an activity is a resumed session standing where its last walk
   > left it. It makes no advance.

7. **Take the activity this session stands on.**

   Call `get_activity { session_index, context_tokens }`.
   > - `context_tokens` is your own context window in tokens.
   > - Name no activity: the one in flight is what it serves.
   > - That activity carries the run that walks the client session, the techniques its steps bind,
   >   and the contract the orchestrator is held to. From here on it governs and this text stops
   >   applying.
