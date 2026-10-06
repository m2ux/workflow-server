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
   echoes. Later text calls them `meta_session_index` and `target_repo`. The response also returns
   `planning_folder_path`, and `client`, which carries the already-open client session's own
   `session_index` and workflow. Where both indices are in hand, the one from step 1 is this
   session's.

3. Call `get_workflow { session_index }`. It delivers the techniques this session orchestrates by
   and the contract they inherit, and names the activity the walk opens on. Read that activity id
   from `initialActivity`.

4. Call `inspect_session { session_index, view: "activities" }` and read `current`. Where it is
   empty, call `next_activity { session_index, activity_id }` naming the `initialActivity` read in
   step 3. Where it names an activity, this session stands on that activity already and makes no
   advance.

5. Call `get_activity { session_index, activity_id, context_tokens }`, naming the activity this
   session now stands on — the one `current` reported, or the one step 4 advanced onto. That
   activity carries the run that walks the client session and the techniques its steps bind. From
   here on it governs and this text stops applying.

## Rules

Both of these bind from your very next call, for the whole session.

- Pass `session_index` on every authenticated tool call. A call without it cannot be attributed to
  this session.

- Every worker this session spawns is awaited before the next step — no fire-and-forget. On Cursor
  that means setting `run_in_background=false` explicitly and waiting for the worker's envelope.
