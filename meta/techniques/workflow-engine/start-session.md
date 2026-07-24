---
metadata:
  version: 1.2.0
---

## Capability

Obtain or resume the top-level workflow session via the `start_session` tool.

## Inputs

### workflow_id

Optional. Fresh-session workflow id (default `meta`). Ignored on resume.

### planning_folder

Optional. Absolute path whose basename is the planning slug. Omit for a transient meta bootstrap when the slug is not yet known.

### repo

Optional. Target `owner/repo` (or GitHub URL). Required when the server is bound to an install multi-root (`$INSTALL/engineering`) and the session will later promote via `dispatch_child` or create a durable planning folder. Also accepted implicitly when `planning_folder` sits under `engineering/<owner>/<repo>/…`. Source the value from the user or the workspace `AGENTS.md` / `CLAUDE.md` — do not invent owner/repo pairs.

### agent_id

Agent identity stored on the session (default `orchestrator`).

### context_mode

Optional. Omit or pass `"fresh"`. Client sessions use per-activity disposable workers ([dispatch-activity](./dispatch-activity.md)::workers-need-full-delivery).

## Outputs

### session_index

Stable 6-character base32 index for every subsequent authenticated tool call.

### planning_folder_path

Canonical absolute planning folder path as resolved by the server (omitted for pure transient meta until promotion).

### repo

Echoed when a target repository was bound for this session.

### session_scope

`multi` or `single` — whether the process uses install multi-root engineering.

### promotion_requires_repo

Present and `true` only when the session is transient under multi-root **without** a repo binding. Re-call `start_session` with `repo` before `dispatch_child`.

## Protocol

1. Call `start_session` with `{workflow_id}`, `{agent_id}`, optional `{planning_folder}`, and `{repo}` when multi-root requires it, per the [bootstrap protocol](../../resources/bootstrap-protocol.md). Omit `context_mode` (or pass `"fresh"`).
2. Save `{session_index}`, `{planning_folder_path}`, and `{repo}` from the response. Do not compose or reconcile the planning path yourself.
3. Call `get_workflow { session_index }` and follow the returned operations bundle. After summarization, re-fetch with the escapes in `workflow-engine.force-full-after-summarization`.

## Rules

### planning-folder-absolute-or-omit

When targeting a planning folder, `planning_folder` MUST be an absolute path; only the basename is consumed as the slug. Bare slugs and relative paths are rejected. Omit `planning_folder` entirely for a transient meta bootstrap — the server mints a transitional slug and parks the session until `dispatch_child` promotes it. Always prefer the returned `planning_folder_path` over any path the agent constructed.

### multi-root-repo-binding

When `discover` / `health_check` report `session_scope: multi` (install multi-root), pass `repo: "owner/repo"` on meta `start_session` even when omitting `planning_folder`. The server stashes the binding and uses it when `dispatch_child` promotes the transient parent into `engineering/<owner>/<repo>/artifacts/planning/<slug>/`. Omitting `repo` on multi-root leaves `promotion_requires_repo: true` and causes `dispatch_child` to fail until a bound session exists.
