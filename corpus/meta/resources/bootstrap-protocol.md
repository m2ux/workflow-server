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
   > - Keep the `session_index` it returns, a 6-character base32 string. Every call below takes it.

2. **Settle any opening decision**, where the response names a `decision` and has no `session_index`.

   Present the `recommendation` and `candidates`, wait for the user, then retry the same call with
   what they chose.
   > - `unbound-repo`: pass `repo` as `owner/repo`.
   > - `binding-mismatch`: pass `repo` matching the checkout, or a different `working_directory`.
   > - `component-choice`: name a component in the request, or pass that component's `working_directory`.
   > - `unmapped-root`: pass a `working_directory` under a checkout this server serves.
   > - `workflow-selection`: pass `target_workflow_id` set to the chosen catalog id, or `user_request`.
   > - `resume-session`: pass `planning_folder` for the chosen saved session, or `fresh: true` for a new client.

3. **Take the activity the session stands on.**

   Call `get_activity { session_index, context_tokens }`.
   > - `context_tokens` is your own context window in tokens.
   > - The session already stands on an activity: a fresh one opens on it, and a resumed one holds
   >   wherever its last walk left it. Name no activity and the one in flight is served.
   > - Where the call reports a checkpoint already open, present it to the user and answer it with
   >   `respond_checkpoint`, then call again. An open gate refuses every other call.
   > - That activity carries the run that walks the client session, the techniques its steps bind,
   >   and the contract the orchestrator is held to. From here on it governs and this text stops
   >   applying.
