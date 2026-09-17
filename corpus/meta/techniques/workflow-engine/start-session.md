---
metadata:
  version: 1.14.0
---

## Capability

The top-level workflow session: its index and binding, and either the embedded client or an opening decision.

## Inputs

### working_directory

Absolute path of the checkout under work.

### workflow_id

Optional. Fresh-session workflow id (default `meta`). Ignored on resume.

### planning_folder

Optional. Absolute path whose basename is the planning slug. Omit for a transient meta bootstrap when the slug is not yet known.

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

### planning_slug

Slug the session is keyed on — minted transitionally when no planning folder was supplied.

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

- Call `start_session` with `{working_directory}`, `{workflow_id}`, `{agent_id}`, `{user_request}`, and optional `{planning_folder}`, `{repo}`, `{target_workflow_id}`, and `{fresh_client}` as `fresh`, per the [bootstrap protocol](/meta/resources/bootstrap-protocol.md). Omit `{context_mode}` or pass `"fresh"`.
  > - The bound `{repo}` is the origin remote of `{working_directory}`.
  > - When `{repo}` is passed with `{working_directory}`, it equals that origin.
  > - Pass `{user_request}` verbatim — the server seeds it into the bag and children inherit it, so it reaches downstream agents as state rather than as prose in a spawn prompt.
  > - When the response has `{opening_decision}` and no `{session_index}`, capture `{opening_decision}`, `{opening_candidates}`, and `{opening_recommendation}`. Retry with the pin `{opening_recommendation}` names.
  > - When the response has `{client_session_index}`, capture `{client_session_index}` and `{client_initial_activity}`. Call `get_workflow` and `next_activity` on `{client_session_index}` with `{client_initial_activity}`. Remaining steps of this technique do not apply.

### 2. Save Session Bindings

- Save `{session_index}` and `{planning_folder_path}` from the response. Record `{repo}` as bag `{target_repo}` (the echoed binding). Do not compose or reconcile the planning path yourself.

### 3. Take Operations Bundle

- Call `get_workflow { session_index }` and follow the returned operations bundle. After summarization, re-fetch with the escapes in force-full-after-summarization.

## Rules

### planning-folder-absolute-or-omit

When targeting a planning folder, `planning_folder` MUST be an absolute path; only the basename is consumed as the slug. Bare slugs and relative paths are rejected. Omit `planning_folder` entirely for a transient meta bootstrap — the server mints a transitional slug and parks the session until `dispatch_child` promotes it. Always prefer the returned `planning_folder_path` over any path the agent constructed.

### origin-binds-from-working-directory

The bound repository is the origin remote of `{working_directory}`, including when that folder is named for a branch.
