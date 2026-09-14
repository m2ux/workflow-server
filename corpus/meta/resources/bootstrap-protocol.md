---
name: bootstrap-protocol
description: The mandatory session-bootstrap sequence executed by every agent at the start of a workflow.
---

# Bootstrap Protocol

IMPORTANT: YOU *MUST* *ALWAYS* EXECUTE ALL OF THESE STEPS

1. Call `start_session { workflow_id: "meta", agent_id: "orchestrator", working_directory, user_request }`.
   `working_directory` is the absolute path of the checkout under work. The server derives
   `owner/repo` from that checkout's origin remote. `repo` is optional and must equal the derived
   origin when present.

   When the response names a `decision` and has no `session_index`, present the `recommendation`
   and `candidates` and wait for the user. Retry the same call after they settle it — a named
   component, a different `working_directory`, or `repo` when the decision is `unbound-repo`.

2. Keep two values from a session response: the `session_index` it returns, a 6-character base32
   string, and the `repo` binding it echoes. Later text calls them `meta_session_index` and
   `target_repo`.

3. Call `get_workflow { session_index }`. The response is the workflow's resolved operations bundle,
   then a `\n\n---\n\n` separator, then the workflow's metadata and activity roster.

   Read the bundle. From here on the operations and rules it carries govern, and this bootstrap text
   stops applying. It names an `initialActivity`: that id is the argument to your first
   `next_activity` call, which is where the workflow itself takes over.

   Two of its rules bind from your very next call:

   - Pass `session_index` on every authenticated tool call from now on.
   - Every worker you spawn must be awaited before your next step — no fire-and-forget. On Cursor that
     means setting `run_in_background=false` explicitly and waiting for the worker's envelope.
