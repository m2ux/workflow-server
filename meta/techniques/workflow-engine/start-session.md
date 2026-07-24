---
metadata:
  version: 1.5.0
---

## Capability

Obtain or resume the top-level workflow session via the `start_session` tool.

## Inputs

### workflow_id

Optional. Fresh-session workflow id (default `meta`). Ignored on resume.

### planning_folder

Optional. Absolute path whose basename is the planning slug. Omit for a transient meta bootstrap when the slug is not yet known.

### repo

Target `owner/repo` (or GitHub URL). Always pass it. Source from the user or the workspace `AGENTS.md` / `CLAUDE.md`; do not invent owner/repo pairs. Also accepted implicitly when `planning_folder` already sits under `…/<owner>/<repo>/…`.

### agent_id

Agent identity stored on the session (default `orchestrator`).

### context_mode

Optional. Omit or pass `"fresh"`. Client sessions use per-activity disposable workers ([dispatch-activity](./dispatch-activity.md)::workers-need-full-delivery).

## Outputs

### session_index

Stable 6-character base32 index for every subsequent authenticated tool call. Land as bag `{meta_session_index}` for meta.

### planning_folder_path

Canonical absolute planning folder path as resolved by the server (omitted for pure transient meta until promotion).

### repo

Echo of the bound repo. Land as bag `{target_repo}` so initialize-session's `create-session` binding can resolve `repo` from the bag.

## Protocol

1. Call `start_session` with `{workflow_id}`, `{agent_id}`, `{repo}`, and optional `{planning_folder}`, per the [bootstrap protocol](../../resources/bootstrap-protocol.md). Omit `context_mode` (or pass `"fresh"`).
2. Save `{session_index}` → bag `{meta_session_index}`, and `{repo}` → bag `{target_repo}` (response echo, else the value you passed). The bag is the single channel for downstream technique bindings — do not also stuff repo into the worker prompt by hand. Do not compose or reconcile the planning path yourself.
3. Call `get_workflow { session_index }` and follow the returned operations bundle. After summarization, re-fetch with the escapes in `workflow-engine.force-full-after-summarization`.

## Rules

### planning-folder-absolute-or-omit

When targeting a planning folder, `planning_folder` MUST be an absolute path; only the basename is consumed as the slug. Bare slugs and relative paths are rejected. Omit `planning_folder` entirely for a transient meta bootstrap — the server mints a transitional slug and parks the session until `dispatch_child` promotes it. Always prefer the returned `planning_folder_path` over any path the agent constructed.

### always-bind-repo

Always pass `repo: "owner/repo"` on meta `start_session` (even when omitting `planning_folder`) and record it as bag `{target_repo}`.
