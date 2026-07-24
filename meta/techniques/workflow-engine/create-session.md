---
metadata:
  version: 1.5.0
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

`owner/repo` for the session. Prefer the value already on the parent (`session.json#repo` / prior-state / dispatch prompt, e.g. `Target Github repo`) or workspace `AGENTS.md`. Pass it when the parent is not yet bound; if already set, omit or pass the same value (conflicts are rejected).

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
   - `repo: {owner/repo}` when the parent session is not yet bound (from prior-state / prompt / `AGENTS.md`)

   Capture the returned `{session_index}` for use in all subsequent calls inside the child workflow, and the returned `{planning_folder_path}` (the server-resolved absolute folder under its workspace) as the single artifact location. The server appends the child under `parent.triggeredWorkflows[N].state` and embeds the full child SessionFile inline; the agent does not deal with separate child folders, and does not compose the folder path itself. Promotion and path resolution use only `session.json#repo` (after any bind-if-missing from this call).

   Omit `context_mode` (or pass `"fresh"`). Client activities are executed by disposable per-activity workers via [dispatch-activity](./dispatch-activity.md); do not pass `context_mode: "persistent"` on the child session.

## Rules

### bind-repo-on-dispatch

If the parent session has no `repo` yet, you MUST pass `repo` on this `dispatch_child`. That binds `session.json#repo`. Do not invent owner/repo pairs; do not pass a conflicting `repo` when the parent is already bound. Agents do not special-case server topology.
