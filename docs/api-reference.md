# API reference

A catalog of the tool surface and the HTTP routes. It is deliberately brief: each entry says what a tool is for and links to the model that explains how it behaves. For call-contract detail, read the wire descriptions in `src/tools/`, mirrored on the [site tool reference](../site/api/tools.html).

## HTTP endpoints

Started with `--transport=http` (or `TRANSPORT=http`, or `npm run start:http`), the server exposes these routes. Under stdio it opens no HTTP listener.

| Method and path | Purpose |
|-----------------|---------|
| `GET /health` | Liveness — the process is up |
| `GET /ready` | Readiness — see the checks below |
| `POST /mcp` | Model Context Protocol over Streamable HTTP, client to server |
| `GET /mcp` | The same, server to client, when the session uses GET |
| `DELETE /mcp` | End the session |

`/ready` returns 503 when any check is false:

| Check | True when |
|-------|-----------|
| `schemasDir`, `workspaceDir` | both directories exist |
| `engineeringDir` | it exists, where the `--repo` layout splits it from the workspace |
| `sessionKeyWritable` | the signing-key directory is usable |
| `corpusServes` | the mounted corpus holds at least one workflow |

A green `/health` alone does **not** mean `start_session` can run. Verify `sessionKeyWritable: true` — a non-root Docker container with `HOME=/` has historically failed there. See [http.md](../http.md) and `WORKFLOW_SERVER_KEY_DIR`.

### Telling two instances apart

The `/ready` payload carries a `corpus` object beside `checks`. `dir` is the tree definitions resolve against, `workflows` is what the walk found there, and `ambiguous` lists ids that more than one directory claims. The walk reads the corpus as it stands rather than as it stood at boot.

`hostDir` names the tree behind the mount, and appears when the container was given a corpus bind source — which `start.sh` and the compose file set as `HOST_WORKFLOWS_DIR`. Every container resolves definitions at the same mount point, so `dir` states what a server reads while `hostDir` states which corpus that is. That is the fact telling two instances apart. Outside Docker the two coincide and only `dir` appears.

### Access and request identity

Responses carry an `x-request-id` header, echoed when the client supplies one.

The server implements no application-level authentication, so place the listener behind network access control or a reverse proxy. Local `mcp-remote` clients may probe OAuth discovery URLs (`/.well-known/oauth-*`) and receive 404s. That is expected without auth, and is logged as information rather than error.

## Tools

Most tools take a `session_index` returned by `start_session`. The bootstrap tools do not. Each authenticated response carries `session_index`, and advisory `_meta.validation` where it applies.

### Bootstrap

| Tool | Parameters | Returns | Purpose |
|------|------------|---------|---------|
| `discover` | — | Server info and a bootstrap stub | The first call: how to start a session |
| `list_workflows` | — | `id`, `title`, `version`, `tags` per workflow | The catalog of available workflows |
| `health_check` | — | Status, version, workflow count, uptime | Process health |

### Session

| Tool | Parameters | Returns | Purpose |
|------|------------|---------|---------|
| `start_session` | `agent_id`, `workflow_id?`, `working_directory?`, `planning_folder?`, `repo?`, `context_mode?`, `user_request?`, `target_workflow_id?`, `fresh?` | `session_index`, planning path, workflow info, `execution_path`; optionally `repo`, `client`, or a `decision` | Open or resume a top-level session |
| `dispatch_child` | `session_index`, `workflow_id`, `agent_id?`, `planning_slug?`, `repo?`, `context_mode?` | Child `session_index`, `execution_path` | Start a nested workflow under this session |
| `get_workflow_status` | `session_index` | Status, activities in flight, completed activities, checkpoint hint | A snapshot of where the session is |
| `inspect_session` | `session_index`, `view?`, `child_index?`, `variable?`, `agent_id?` | A compact projection | Read session state, even while a checkpoint is active |

**Opening a session.** The default workflow is `meta`. Pass `working_directory` as the checkout under work: the server derives `owner/repo` from that checkout's origin, even when the folder is named for a branch. `repo` is optional, and must equal the derived origin when supplied. A named `planning_folder` resumes. Where a derived dated slug already holds a session, the server opens the next free numbered folder. `user_request` seeds the opening request into the variable bag, and children inherit it.

**What comes back instead of a session.** A unique catalog match with no resume phrasing also returns `client`. A durable meta start that cannot uniquely open a client returns a `decision` — `workflow-selection` or `resume-session` — and no `session_index`. `execution_path` is `agent` when a caller walks the definition and `runner` when the server does.

**Dispatching a child** uses `session.repo`; an optional `repo` binds it if missing and must match if already set. The child records which path drove it. See [dispatch](dispatch-model.md) and [state](state-management-model.md).

### Workflow navigation

All of these require `session_index`; workflow identity comes from the session.

| Tool | Parameters | Returns | Purpose |
|------|------------|---------|---------|
| `get_workflow` | `session_index` | Orchestrator technique bundle and workflow stubs | The orchestrator's load: rules, variables, `initialActivity`, activity list |
| `next_activity` | `session_index`, `activity_id`, `from_activity`, `exit?`, manifests? | `activity_id`, `name`; barrier and trace in `_meta` | Retire one activity and go to the next |
| `get_activity` | `session_index`, `context_tokens`, `agent_id?`, `activity_id?`, `bundle?` | Worker bundle, activity body, `exit_destinations`, `_meta.dispatch` | The worker's load for the activity it was dispatched for |
| `yield_checkpoint` | `session_index`, `checkpoint_id`, `message?`, `options?` | `yielded` or `replayed` | Pause for a user decision, or replay a prior answer |
| `resume_checkpoint` | `session_index` | Status | Continue after the checkpoint is resolved |
| `present_checkpoint` | `session_index` | Message, options, effects | Load the active checkpoint for the user |
| `respond_checkpoint` | `session_index`, one of `option_id` / `auto_advance` / `condition_not_met` | Resolution and effects | Clear the active checkpoint |

**Moving between activities.** `next_activity` names the activity to retire as `from_activity` and the destination as `activity_id` — one activity, `__terminal__`, or the destination as the graph names it where the exit fans. One call opens every branch of a fan; its meeting point is entered by the branch return that empties the frontier. See [fidelity](workflow-fidelity.md).

**Loading an activity.** `context_tokens` is required and sizes the eager bundle; `agent_id` scopes delivery to one worker context. Name `activity_id` where several are in flight. `fan_instance` appears where the graph runs the activity over a collection. What the bundle leaves out is fetched as a step technique with `get_technique { step_id }`, or as a resource named under `resource_refs`. See [bundling](delivery-model.md#eager-technique-bundling) and [reference delivery](delivery-model.md#reference-delivery).

**Raising an undeclared decision.** `message` and `options` on `yield_checkpoint` raise a decision the activity did not declare. They are refused on one it did, because a declared gate owns its own wording. See [checkpoints](checkpoint-model.md).

### Techniques and resources

| Tool | Parameters | Returns | Purpose |
|------|------------|---------|---------|
| `get_technique` | `session_index`, `technique_id?`, `step_id?`, `activity_id?`, `agent_id?`, `bundle?`, `full?` | A composed technique, or an unchanged marker | Load one technique on demand |
| `get_resource` | `session_index`, `resource_id`, `agent_id?`, `bundle?`, `full?` | A resource body, or an unchanged marker | Load reference material by slug (`workflow/id` or `#section`) |

`step_id` and `technique_id` are alternatives. `step_id` names the technique a step binds. `technique_id` names an operation of the caller's role contract — a protocol the caller has reached but was not sent, such as the checkpoint pair on a run that declares no gate, or one whose delivery its context no longer holds. Only operations this session's definitions name are servable. Passing `activity_id` makes a step id that resolves against a moved activity pointer fail, rather than returning a technique from the wrong activity. See [resolution](resource-resolution-model.md).

### Trace and accounting

| Tool | Parameters | Returns | Purpose |
|------|------------|---------|---------|
| `get_trace` | `session_index`, `trace_tokens?` | Trace events | Decode accumulated trace tokens, or return the in-memory trace |
| `record_usage` | `session_index`, `activity`, `usage`, `basis`, `agent_id?` | The recorded row | Record one completed activity's token usage |

`basis` says whether the figure is that activity's own spend or a running total for the agent, since the two sum differently. Read the rows back through `inspect_session` with `view: usage`. See [fidelity](workflow-fidelity.md).

## Where detail lives

| Topic | Document |
|-------|----------|
| Session files, `session_index`, resume | [State management](state-management-model.md) |
| Yield, present, respond, resume | [Checkpoint model](checkpoint-model.md) |
| Manifests, `_meta.validation`, trace tokens | [Workflow fidelity](workflow-fidelity.md) |
| Technique bundles, composition, resources | [Resource resolution](resource-resolution-model.md) |
| What the server enforces, and what agents do | [Schema enforcement model](../schemas/README.md#enforcement-model) |
| Wire descriptions and parameter schemas | [Site API](../site/api/tools.html), generated from `src/tools/` |
| Technique file shape | [Technique protocol](technique-protocol-specification.md) |
| Workflow and activity file shapes | [Schema guide](../schemas/README.md) |
