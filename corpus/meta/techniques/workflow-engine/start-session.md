---
metadata:
  version: 1.22.0
---

## Capability

The top-level workflow session: its index and binding, and either the embedded client or an opening decision.

## Inputs

### working_directory

Absolute path of the checkout under work.

### workflow_id

Optional. Fresh-session workflow id (default `meta`). Ignored on resume.

### planning_slug

Optional. A single path segment naming this session's planning folder, composed per the [bootstrap protocol](/meta/resources/bootstrap-protocol.md). The server resolves the planning root it lands in.

### planning_folder

Optional. Absolute path of one planning folder. A folder already holding a session resumes, wherever it sits.

### repo

Optional. Target repository as `owner/repo` (or GitHub URL).

### user_request

The user's free-form request that opened this session.

### target_workflow_id

Optional. Catalog id of the client workflow. Distinct from `workflow_id`, which is the top-level session (default `meta`).

### fresh_client

Optional. True means this call opens a new client despite resume phrasing.

### agent_id

Agent identity stored on the session (default `orchestrator`).

### context_mode

Optional. Omit or pass `"fresh"`.

## Outputs

### session_index

Stable 6-character base32 index for every subsequent authenticated tool call. Absent when the call yields an opening decision.

### planning_folder_path

Canonical absolute planning folder path as resolved by the server. Absent while the session is transient and no durable path has been resolved.

### repo

Bound target repository as `owner/repo`, echoing the durable session binding.

### initial_activity

First activity id of the session this call opened, which its first advance names. Absent when the call yields an opening decision.

### client_session_index

6-character base32 index of the embedded client session. Absent when the call yields an opening decision or opens meta alone.

### client_initial_activity

First activity id of the embedded client. Absent when `client_session_index` is absent.

### opening_decision

Named opening decision. Absent when `session_index` is present.

### opening_candidates

Ranked options for the opening decision. Absent when `opening_decision` is absent.

### opening_recommendation

Retry instruction for the opening decision. Absent when `opening_decision` is absent.

## Protocol

### 1. Open Session

- Call `start_session` with `{working_directory}`, `{workflow_id}`, `{agent_id}`, `{user_request}`, `{planning_slug}`, and optional `{planning_folder}`, `{repo}`, `{target_workflow_id}`, and `{fresh_client}` as `fresh`, per the [bootstrap protocol](/meta/resources/bootstrap-protocol.md). Omit `{context_mode}` or pass `"fresh"`.
  > - The bound `{repo}` is the origin remote of `{working_directory}`.
  > - When `{repo}` is passed with `{working_directory}`, it equals that origin.
  > - Pass `{user_request}` verbatim — the server seeds it into the bag and children inherit it, so it reaches downstream agents as state rather than as prose in a spawn prompt.
  > - When the response has `{opening_decision}` and no `{session_index}`, capture `{opening_decision}`, `{opening_candidates}`, and `{opening_recommendation}`. Retry with the pin `{opening_recommendation}` names.
  > - When the response has `{client_session_index}`, capture `{client_session_index}` and `{client_initial_activity}`. The meta walk drives that client session; this context does not advance it here.

### 2. Save Session Bindings

- Save `{session_index}` and `{planning_folder_path}` from the response. Record `{repo}` as bag `{target_repo}` (the echoed binding). Do not compose or reconcile the planning path yourself.
- Read `{initial_activity}` as the activity this session's first advance names.
  > The response also reports what the session already stands on, and its lifecycle state. A
  > resume stands where its last walk left it and makes no opening advance; a session reported
  > `completed` has already ended its walk and takes no further advance at all.

### 3. Re-Establish the Contract After Summarization

- Where this context has lost the contract it was delivered, call `get_workflow { session_index }` and follow the returned techniques bundle, with the escapes in force-full-after-summarization.
  > The contract arrives with the activity that carries it, so an opening context already holds it
  > and this call has nothing to add. The bundle carries what the workflow declares at
  > `techniques.workflow`, which is the orchestrator's; a workflow declaring none returns none.

## Rules

### the-returned-path-is-the-session-folder

The returned `planning_folder_path` is the folder this session uses, and this call composes no planning path of its own.

### planning-folder-is-absolute

`planning_folder` is an absolute path. A new folder sits directly under the planning root of this session, and one named anywhere else is refused, naming that root. Bare slugs and relative paths are rejected.

### one-designator-names-the-folder

A call names its folder with `{planning_slug}` or with `{planning_folder}`. A call passing both is refused.

### origin-binds-from-working-directory

The bound repository is the origin remote of `{working_directory}`, including when that folder is named for a branch.
