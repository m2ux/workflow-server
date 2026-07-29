---
metadata:
  version: 1.5.0
---

## Capability

The top-level workflow session, obtained or resumed: its stable index, the server's canonical planning path, the durable repository binding, and the running workflow's identity and version.

## Inputs

### workflow_id

Optional. Fresh-session workflow id (default `meta`). Ignored on resume.

### planning_folder

Optional. Absolute path whose basename is the planning slug. Omit for a transient meta bootstrap when the slug is not yet known.

### repo

Target repository as `owner/repo` (or GitHub URL), taken from the host repository's origin remote. Also accepted implicitly when `planning_folder` already sits under `…/<owner>/<repo>/…`.

### user_request

The user's free-form request that opened this session.

### agent_id

Agent identity stored on the session (default `orchestrator`).

### context_mode

Optional. Omit or pass `"fresh"`.

## Outputs

### session_index

Stable 6-character base32 index for every subsequent authenticated tool call.

### planning_folder_path

Canonical absolute planning folder path as resolved by the server. Absent while the session is transient and no durable path has been resolved.

### repo

Bound target repository as `owner/repo`, echoing the durable session binding.

### planning_slug

Slug the session is keyed on — minted transitionally when no planning folder was supplied.

## Protocol

1. Call `start_session` with `{workflow_id}`, `{agent_id}`, `{repo}`, `{user_request}`, and optional `{planning_folder}`, per the [bootstrap protocol](../../resources/bootstrap-protocol.md). Omit `context_mode` (or pass `"fresh"`).
   > `{repo}` is required on every call, including transient meta when `{planning_folder}` is omitted.
   > Pass `{user_request}` verbatim — the server seeds it into the bag and children inherit it, so it reaches downstream agents as state rather than as prose in a spawn prompt.
2. Save `{session_index}` and `{planning_folder_path}` from the response. Record `{repo}` as bag `{target_repo}` (response echo when present, otherwise the value passed). Do not compose or reconcile the planning path yourself.
3. Call `get_workflow { session_index }` and follow the returned operations bundle. After summarization, re-fetch with the escapes in `workflow-engine.force-full-after-summarization`.

## Rules

### planning-folder-absolute-or-omit

When targeting a planning folder, `planning_folder` MUST be an absolute path; only the basename is consumed as the slug. Bare slugs and relative paths are rejected. Omit `planning_folder` entirely for a transient meta bootstrap — the server mints a transitional slug and parks the session until `dispatch_child` promotes it. Always prefer the returned `planning_folder_path` over any path the agent constructed.
