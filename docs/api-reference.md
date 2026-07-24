# API Reference

Catalog of the MCP tool surface and HTTP routes. For call-contract footguns, use the wire descriptions in `src/tools/` (mirrored on the [site tool reference](../site/api/tools.html)). For behavioral depth, follow the links to architecture models.

## HTTP endpoints

When the server starts with `--transport=http` (or `TRANSPORT=http` / `npm run start:http`), it exposes these routes. stdio mode does not open an HTTP listener.

| Method / path | Purpose |
|---------------|---------|
| `GET /health` | Liveness — process is up |
| `GET /ready` | Readiness — `workflowDir`, `schemasDir`, and `workspaceDir` exist; also `engineeringDir` when it is split from workspace (`--repo` layout) |
| `POST /mcp` | MCP Streamable HTTP |

Responses include an `x-request-id` header (echoed when the client supplies one). Place the listener behind network access control or a reverse proxy; the server does not implement application-level authentication. See [setup.md](../setup.md) (shared binding), [http.md](../http.md) / [stdio.md](../stdio.md) (transports), and [development.md](development.md) for the full env table.

## MCP Tools

Most tools take a `session_index` from `start_session`. Bootstrap tools do not. Each authenticated response includes `session_index` and advisory `_meta.validation` where applicable.

### Bootstrap

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `discover` | — | Server info, bootstrap stub | First call: how to start a session. |
| `list_workflows` | — | Workflow list (`id`, `title`, `version`, `tags`) | Catalog of available workflows. |
| `health_check` | — | Status, version, workflow count, uptime | Process health. |

### Session

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `start_session` | `agent_id`, `workflow_id?`, `planning_folder?`, `context_mode?` | `session_index`, planning path, workflow info | Open or resume a top-level session (default workflow: `meta`). [State](state_management_model.md) · [Reference delivery](resource_resolution_model.md#11-reference-delivery) |
| `dispatch_child` | `session_index`, `workflow_id`, `agent_id?`, `planning_slug?`, `context_mode?` | Child `session_index` | Start a nested workflow under the current session. [Dispatch](dispatch_model.md) |
| `get_workflow_status` | `session_index` | Status, current/completed activities, checkpoint hint | Snapshot of where the session is. |
| `inspect_session` | `session_index`, `view?`, `child_index?`, `variable?` | Compact projection | Read-only view of session state (usable while blocked). |

### Workflow navigation

Require `session_index`. Workflow identity comes from the session.

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `get_workflow` | `session_index` | Orchestrator technique bundle + workflow stubs | Orchestrator load: rules, variables, `initialActivity`, activity list. [Resolution](resource_resolution_model.md) |
| `next_activity` | `session_index`, `activity_id`, manifests? | `activity_id`, `name`; trace in `_meta` | Advance to an activity (does not return its body). [Fidelity](workflow-fidelity.md) |
| `get_activity` | `session_index`, `context_tokens`, `bundle?` | Worker bundle + activity body | Worker load for the current activity. `context_tokens` is required. [Bundling](resource_resolution_model.md#12-hybrid-technique-bundling) |
| `yield_checkpoint` | `session_index`, `checkpoint_id` | `yielded` or `replayed` | Pause for a user decision (or replay a prior answer). [Checkpoints](checkpoint_model.md) |
| `resume_checkpoint` | `session_index` | Status | Worker continues after the checkpoint is resolved. |
| `present_checkpoint` | `session_index` | Message, options, effects | Load the active checkpoint for the user. |
| `respond_checkpoint` | `session_index`, one of `option_id` / `auto_advance` / `condition_not_met` | Resolution + effects | Clear the active checkpoint. |

### Techniques and resources

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `get_technique` | `session_index`, `step_id?`, `full?` | Composed technique (or unchanged marker) | Load one technique on demand. [Resolution](resource_resolution_model.md) |
| `get_resource` | `session_index`, `resource_id`, `full?` | Resource body (or unchanged marker) | Load reference material by slug (`workflow/id` or `#section`). |

### Trace

| Tool | Parameters | Returns | Description |
|------|------------|---------|-------------|
| `get_trace` | `session_index`, `trace_tokens?` | Trace events | Decode accumulated trace tokens or return the in-memory session trace. [Fidelity](workflow-fidelity.md) |

## Where detail lives

| Topic | Document |
|-------|----------|
| Session files, `session_index`, resume | [State management](state_management_model.md) |
| Yield / present / respond / resume | [Checkpoint model](checkpoint_model.md) |
| Manifests, `_meta.validation`, trace tokens | [Workflow fidelity](workflow-fidelity.md) |
| Technique bundles, composition, resources | [Resource resolution](resource_resolution_model.md) |
| Reference delivery & eager step bundling | [Resource resolution §11–12](resource_resolution_model.md#11-reference-delivery) |
| What the server enforces vs agents | [Schema enforcement model](../schemas/README.md#enforcement-model) |
| Wire descriptions & parameter schemas | [Site API](../site/api/tools.html) (generated from `src/tools/`) |
| Technique file shape | [Technique protocol](technique-protocol-specification.md) |
| Workflow / activity language | [Orchestra specification](orchestra-specification.md) |
