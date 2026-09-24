# API reference

A catalog of the tool surface and the HTTP routes: what each one is for, and which document explains how it behaves. Nothing here explains behaviour — that lives in the models, linked in the last column.

For call-contract detail, read the wire descriptions in `src/tools/`, mirrored on the [site tool reference](../site/api/tools.html).

## HTTP endpoints

Started with `--transport=http` (or `TRANSPORT=http`, or `npm run start:http`). Under stdio the server opens no HTTP listener.

| Method and path | Purpose |
|-----------------|---------|
| `GET /health` | Liveness — the process is up |
| `GET /ready` | Readiness — 503 when any check below is false |
| `POST /mcp` | Model Context Protocol over Streamable HTTP, client to server |
| `GET /mcp` | The same, server to client, when the session uses GET |
| `DELETE /mcp` | End the session |

### Readiness checks

| Check | True when |
|-------|-----------|
| `schemasDir`, `workspaceDir` | Both directories exist |
| `engineeringDir` | It exists, where the `--repo` layout splits it from the workspace |
| `sessionKeyWritable` | The signing-key directory is usable |
| `corpusServes` | The mounted corpus holds at least one workflow |

Reading the payload, telling two instances apart, and what a failing check means are in [http.md](http.md#3-verify).

## Tools

Most tools take a `session_index` returned by `start_session`; the bootstrap tools do not. Each authenticated response carries `session_index`, and advisory `_meta.validation` where it applies.

### Bootstrap

| Tool | Parameters | Returns | Purpose |
|------|------------|---------|---------|
| `discover` | — | Server info and a bootstrap stub | The first call: how to start a session |
| `list_workflows` | — | `id`, `title`, `version`, `tags` per workflow | The catalog of available workflows |
| `health_check` | — | Status, version, workflow count, uptime | Process health |

### Session

| Tool | Parameters | Returns | Purpose | Detail |
|------|------------|---------|---------|--------|
| `start_session` | `agent_id`, `workflow_id?`, `working_directory?`, `planning_folder?`, `repo?`, `context_mode?`, `user_request?`, `target_workflow_id?`, `fresh?` | `session_index`, planning path, workflow info, `execution_path`; optionally `repo`, `client`, or a `decision` | Open or resume a top-level session | [Opening a session](state-management-model.md#opening-a-session) |
| `dispatch_child` | `session_index`, `workflow_id`, `agent_id?`, `planning_slug?`, `repo?`, `context_mode?` | Child `session_index`, `execution_path` | Start a nested workflow under this session | [Spawning the orchestrator](dispatch-model.md#spawning-the-orchestrator) |
| `get_workflow_status` | `session_index` | Status, activities in flight, completed activities, checkpoint hint | A snapshot of where the session is | [Polling](dispatch-model.md#polling-a-dispatched-workflow) |
| `inspect_session` | `session_index`, `view?`, `child_index?`, `variable?`, `agent_id?` | A compact projection | Read session state, even while a checkpoint is active | [Persistence](state-management-model.md#persistence) |

### Workflow navigation

All require `session_index`; workflow identity comes from the session.

| Tool | Parameters | Returns | Purpose | Detail |
|------|------------|---------|---------|--------|
| `get_workflow` | `session_index` | Orchestrator technique bundle and workflow stubs | The orchestrator's load: rules, variables, `initialActivity`, activity list | [Orchestrator bundle](delivery-model.md#the-orchestrator-bundle) |
| `next_activity` | `session_index`, `activity_id`, `from_activity`, `exit?`, manifests? | `activity_id`, `name`; barrier and trace in `_meta` | Retire one activity and go to the next | [Choosing the next activity](state-management-model.md#choosing-the-next-activity) |
| `get_activity` | `session_index`, `context_tokens`, `agent_id?`, `activity_id?`, `bundle?` | Worker bundle, activity body, `exit_destinations`, `fan_instance`, `_meta.dispatch` | The worker's load for the activity it was dispatched for | [Worker bundle](delivery-model.md#the-worker-bundle) |
| `yield_checkpoint` | `session_index`, `checkpoint_id`, `message?`, `options?` | `yielded` or `replayed` | Pause for a user decision, or replay a prior answer | [The worker pauses](checkpoint-model.md#the-worker-pauses) |
| `resume_checkpoint` | `session_index` | Status | Continue after the checkpoint is resolved | [Resume protocol](checkpoint-model.md#the-resume-protocol) |
| `present_checkpoint` | `session_index` | Message, options, effects | Load the active checkpoint for the user | [Presenting and resolving](checkpoint-model.md#the-user-facing-agent-presents-and-resolves) |
| `respond_checkpoint` | `session_index`, one of `option_id` / `auto_advance` / `condition_not_met` | Resolution and effects | Clear the active checkpoint | [Three ways to resolve one](checkpoint-model.md#three-ways-to-resolve-one) |

### Techniques and resources

| Tool | Parameters | Returns | Purpose | Detail |
|------|------------|---------|---------|--------|
| `get_technique` | `session_index`, `technique_id?`, `step_id?`, `activity_id?`, `agent_id?`, `bundle?`, `full?` | A composed technique, or an unchanged marker | Load one technique on demand | [Asking for one by name](delivery-model.md#asking-for-one-by-name) |
| `get_resource` | `session_index`, `resource_id`, `agent_id?`, `bundle?`, `full?` | A resource body, or an unchanged marker | Load reference material by slug (`workflow/id` or `#section`) | [Loading a resource](resource-resolution-model.md#loading-a-resource-when-it-is-needed) |

### Trace and accounting

| Tool | Parameters | Returns | Purpose | Detail |
|------|------------|---------|---------|--------|
| `get_trace` | `session_index`, `trace_tokens?` | Trace events | Decode accumulated trace tokens, or return the in-memory trace | [Execution trace](workflow-fidelity.md#layer-7-the-execution-trace) |
| `record_usage` | `session_index`, `activity`, `usage`, `basis`, `agent_id?` | The recorded row | Record one completed activity's token usage | [Token usage](delivery-model.md#token-usage-is-reported-not-derived) |

## Where detail lives

| Topic | Document |
|-------|----------|
| Session files, `session_index`, opening and resume | [State management](state-management-model.md) |
| Yield, present, respond, resume | [Checkpoint model](checkpoint-model.md) |
| Bundles, budgets, reference delivery, measurement | [Delivery model](delivery-model.md) |
| `::` addressing, namespaces, resource lookup | [Resource resolution](resource-resolution-model.md) |
| Manifests, `_meta.validation`, trace tokens | [Workflow fidelity](workflow-fidelity.md) |
| Flags and environment variables | [Configuration](configuration.md) |
| What the server enforces, and what agents do | [Schema enforcement model](../schemas/README.md#enforcement-model) |
| Wire descriptions and parameter schemas | [Site API](../site/api/tools.html), generated from `src/tools/` |
| Technique file shape | [Technique protocol](technique-protocol-specification.md) |
| Workflow and activity file shapes | [Schema guide](../schemas/README.md) |
