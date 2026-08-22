# API Reference

Catalog of the MCP tool surface and HTTP routes. For call-contract footguns, use the wire descriptions in `src/tools/` (mirrored on the [site tool reference](../site/api/tools.html)). For behavioral depth, follow the links to architecture models.

## HTTP endpoints

When the server starts with `--transport=http` (or `TRANSPORT=http` / `npm run start:http`), it exposes these routes. stdio mode does not open an HTTP listener.

| Method / path | Purpose |
|---------------|---------|
| `GET /health` | Liveness — process is up |
| `GET /ready` | Readiness — `workflowDir`, `schemasDir`, and `workspaceDir` exist; `engineeringDir` when split from workspace (`--repo` layout); and `sessionKeyWritable` (HMAC key directory is usable) |
| `POST /mcp` | MCP Streamable HTTP (client → server messages) |
| `GET /mcp` | MCP Streamable HTTP (server → client stream when the session uses GET) |
| `DELETE /mcp` | MCP Streamable HTTP (end session) |

`/ready` returns 503 when any check is false. A green `/health` alone does **not** mean `start_session` can run — verify `sessionKeyWritable: true` (Docker non-root with `HOME=/` historically failed here; see [http.md](../http.md) and `WORKFLOW_SERVER_KEY_DIR`).

Responses include an `x-request-id` header (echoed when the client supplies one). Place the listener behind network access control or a reverse proxy; the server does not implement application-level authentication. Local `mcp-remote` clients may probe OAuth well-known URLs (`/.well-known/oauth-*`) and receive 404s; that is expected without auth and is logged as info, not error. See [setup.md](../setup.md), [http.md](../http.md) / [stdio.md](../stdio.md) (transports), and [development.md](development.md) for process env (developers).

## MCP Tools

Most tools take a `session_index` from `start_session`. Bootstrap tools do not. Each authenticated response includes `session_index` and advisory `_meta.validation` where applicable.

### Bootstrap

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `discover` | — | Server info, bootstrap stub | First call: how to start a session. Always pass `repo` on `start_session`. |
| `list_workflows` | — | Workflow list (`id`, `title`, `version`, `tags`) | Catalog of available workflows. |
| `health_check` | — | Status, version, workflow count, uptime | Process health. |

### Session

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `start_session` | `agent_id`, `workflow_id?`, `planning_folder?`, `repo?`, `context_mode?`, `user_request?` | `session_index`, planning path, workflow info, optional `repo` | Open or resume a top-level session (default workflow: `meta`). Always pass `repo: "owner/repo"` — written to `session.json#repo` (multi-root plans under `$HOST_PROJECTS_ROOT/<repo>/.engineering/…`). `user_request` seeds the opening request into the variable bag, and children inherit it. [State](state-management-model.md) · [Reference delivery](resource-resolution-model.md#reference-delivery) |
| `dispatch_child` | `session_index`, `workflow_id`, `agent_id?`, `planning_slug?`, `repo?`, `context_mode?` | Child `session_index` | Start a nested workflow under the current session. Uses `session.repo`; optional `repo` binds if missing (must match if set). [Dispatch](dispatch-model.md) |
| `get_workflow_status` | `session_index` | Status, current/completed activities, checkpoint hint | Snapshot of where the session is. |
| `inspect_session` | `session_index`, `view?`, `child_index?`, `variable?`, `agent_id?` | Compact projection | Read-only view of session state, usable while a checkpoint is active. `agent_id` narrows history and usage to one worker context. |

### Workflow navigation

Require `session_index`. Workflow identity comes from the session.

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `get_workflow` | `session_index` | Orchestrator technique bundle + workflow stubs | Orchestrator load: rules, variables, `initialActivity`, activity list. [Resolution](resource-resolution-model.md) |
| `next_activity` | `session_index`, `activity_id`, manifests? | `activity_id`, `name`; trace in `_meta` | Advance to an activity (does not return its body). [Fidelity](workflow-fidelity.md) |
| `get_activity` | `session_index`, `context_tokens`, `agent_id?`, `bundle?` | Worker bundle + activity body, `_meta.dispatch` | Worker load for the current activity. `context_tokens` is required; `agent_id` scopes delivery to this worker context. [Bundling](resource-resolution-model.md#hybrid-technique-bundling) · [Reference delivery](resource-resolution-model.md#reference-delivery) |
| `yield_checkpoint` | `session_index`, `checkpoint_id`, `message?`, `options?` | `yielded` or `replayed` | Pause for a user decision, or replay a prior answer. `message` and `options` raise a decision the activity did not declare, and are refused on one it did. [Checkpoints](checkpoint-model.md) |
| `resume_checkpoint` | `session_index` | Status | Worker continues after the checkpoint is resolved. |
| `present_checkpoint` | `session_index` | Message, options, effects | Load the active checkpoint for the user. |
| `respond_checkpoint` | `session_index`, one of `option_id` / `auto_advance` / `condition_not_met` | Resolution + effects | Clear the active checkpoint. |

### Techniques and resources

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `get_technique` | `session_index`, `step_id?`, `activity_id?`, `agent_id?`, `bundle?`, `full?` | Composed technique (or unchanged marker) | Load one technique on demand. Passing `activity_id` fails a step id that resolves against a moved activity pointer, rather than returning a technique from the wrong activity. [Resolution](resource-resolution-model.md) · [Reference delivery](resource-resolution-model.md#reference-delivery) |
| `get_resource` | `session_index`, `resource_id`, `agent_id?`, `bundle?`, `full?` | Resource body (or unchanged marker) | Load reference material by slug (`workflow/id` or `#section`). |

### Trace and accounting

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `get_trace` | `session_index`, `trace_tokens?` | Trace events | Decode accumulated trace tokens or return the in-memory session trace. [Fidelity](workflow-fidelity.md) |
| `record_usage` | `session_index`, `activity`, `usage`, `basis`, `agent_id?` | Recorded row | Record the token usage of one completed activity. `basis` says whether the figure is that activity's own spend or a running total for the agent, since the two sum differently. Read it back through `inspect_session` with `view: usage`. |

## Where detail lives

| Topic | Document |
|-------|----------|
| Session files, `session_index`, resume | [State management](state-management-model.md) |
| Yield / present / respond / resume | [Checkpoint model](checkpoint-model.md) |
| Manifests, `_meta.validation`, trace tokens | [Workflow fidelity](workflow-fidelity.md) |
| Technique bundles, composition, resources | [Resource resolution](resource-resolution-model.md) |
| Reference delivery and eager step bundling | [Reference delivery](resource-resolution-model.md#reference-delivery) and [hybrid technique bundling](resource-resolution-model.md#hybrid-technique-bundling) |
| What the server enforces vs agents | [Schema enforcement model](../schemas/README.md#enforcement-model) |
| Wire descriptions & parameter schemas | [Site API](../site/api/tools.html) (generated from `src/tools/`) |
| Technique file shape | [Technique protocol](technique-protocol-specification.md) |
| Workflow / activity file shapes | [Schema guide](../schemas/README.md) |
