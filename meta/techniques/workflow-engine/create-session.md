---
metadata:
  version: 1.6.0
---

## Capability

Dispatch a fresh client workflow as a child of the meta session via `dispatch_child`. For the top-level `start_session` tool (parent/meta entry), see [start-session](./start-session.md).

## Inputs

### parent_session_index

`session_index` of the meta (parent) session — typically the `meta_session_index` variable.

### workflow_id

Target client workflow id (e.g., `work-package`).

### planning_slug

The work-package planning slug — `YYYY-MM-DD-{initiative_name}`. Names the planning folder the server materialises under its workspace engineering root. Omit when no slug has been derived; the server then falls back to `YYYY-MM-DD-<workflow_id>`.

### repo

Target `owner/repo`. **Required on this call** for initialize-session workers: take it from prior-state `Target Github repo` / `{target_repo}` in the worker prompt. Do not invent owner/repo pairs. Do not wait for a durable parent `session.json` — promotion writes the bind from this argument.

## Outputs

### session_index

The 6-character base32 `session_index` of the newly created child session

### planning_folder_path

The canonical absolute path of the planning folder, as resolved by the server under its own workspace engineering root. The authoritative artifact location for the work package, bound to the workflow's `{planning_folder_path}` variable.

## Protocol

1. Call `dispatch_child` with:

   - `session_index: {parent_session_index}`
   - `workflow_id: {workflow_id}`
   - `agent_id: 'orchestrator'`
   - `planning_slug: {client_planning_slug}` when known
   - `repo: {repo}` — always, from prior-state / `{target_repo}` (see rule below)

   Capture the returned `{session_index}` for use in all subsequent calls inside the child workflow, and the returned `{planning_folder_path}` (the server-resolved absolute folder under its workspace) as the single artifact location. The server appends the child under `parent.triggeredWorkflows[N].state` and embeds the full child SessionFile inline; the agent does not deal with separate child folders, and does not compose the folder path itself.

   Omit `context_mode` (or pass `"fresh"`). Client activities are executed by disposable per-activity workers via [dispatch-activity](./dispatch-activity.md); do not pass `context_mode: "persistent"` on the child session.

## Rules

### repo-from-prior-state

Always pass `repo` on `dispatch_child` using the value from the worker prompt prior-state (`Target Github repo` / `{target_repo}`). That is the authoritative source for initialize-session: the parent may still be a transient meta session with no durable planning `session.json` yet. The server bind-if-missings onto the parent and uses it for promotion. Do not skip `repo` hoping the parent already has it. Do not pass a conflicting owner/repo.
