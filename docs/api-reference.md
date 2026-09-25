# API Reference

MCP tool surface and HTTP routes.

## HTTP endpoints

These routes exist when the server is listening over HTTP.

| Path      | Purpose                                                        | Detail                                |
| --------- | -------------------------------------------------------------- | ------------------------------------- |
| [/health](../src/transports/http.ts#L79) | Liveness — the process is up                                   | [Verify](http.md#3-verify)            |
| [/ready](../src/transports/http.ts#L97) | Readiness — 503 when any check below is false                  | [Readiness checks](#readiness-checks) |
| [/mcp](../src/transports/http.ts#L205) | The session: client to server, server to client, and ending it | [MCP tools](#mcp-tools)               |



### Readiness checks

Repsonses from `GET /ready`. Ready only when every one is true.


| Check                        | True when                                                         | Detail                                                                             |
| ---------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [schemasDir](../src/transports/http.ts#L102), [workspaceDir](../src/transports/http.ts#L103) | Both directories exist                                            | [Process](configuration.md#process), [root binding](configuration.md#root-binding) |
| [engineeringDir](../src/transports/http.ts#L108) | It exists, where the `--repo` layout splits it from the workspace | [Root binding](configuration.md#root-binding)                                      |
| [sessionKeyWritable](../src/transports/http.ts#L104) | The signing-key directory is usable                               | [Signing key](configuration.md#signing-key)                                        |
| [corpusServes](../src/transports/http.ts#L105) | The mounted corpus holds at least one workflow                    | [Process](configuration.md#process)                                                |



## MCP Tools

Each[tool](../site/api/tools.html): what it takes, what it returns, and the page that explains the behaviour.

### Bootstrap

Calls available before a session exists.

| Tool             | Parameters | Returns                                       | Purpose                                | Detail                                                                  |
| ---------------- | ---------- | --------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------- |
| [discover](../src/tools/workflow-tools.ts#L778) | —          | Server info and a bootstrap stub              | The first call: how to start a session | [Verify](setup.md#3-verify)                                             |
| [list_workflows](../src/tools/workflow-tools.ts#L796) | —          | `id`, `title`, `version`, `tags`; `load_errors` when a workflow fails to load | The catalog of available workflows     | [What a namespace is](resource-resolution-model.md#what-a-namespace-is) |
| [health_check](../src/tools/workflow-tools.ts#L2949) | —          | `status`, `server`, `version`, `workflows_available`, `uptime_seconds`, `repo_binding` | Process health                         | [HTTP endpoints](#http-endpoints)                                       |

### Session

Opening a run, and reading where that run stands.

| Tool                  | Parameters                                                                                                                                       | Returns                                                                                                       | Purpose                                               | Detail                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------ |
| [start_session](../src/tools/resource-tools.ts#L145) | `agent_id?`, `workflow_id?`, `working_directory?`, `planning_folder?`, `repo?`, `context_mode?`, `user_request?`, `target_workflow_id?`, `fresh?` | `session_index`, `planning_slug`, `planning_folder_path?`, `workflow` (`id`, `version`, `title`, `description`), `execution_path`; `repo?`, `client?`, or a `decision` and no `session_index` | Open or resume a top-level session                    | [Opening a session](state-management-model.md#opening-a-session)         |
| [dispatch_child](../src/tools/resource-tools.ts#L591) | `session_index`, `workflow_id`, `agent_id?`, `planning_slug?`, `repo?`, `context_mode?`                                                          | `session_index`, `workflow` (`id`, `version`, `initialActivity`), `planning_folder_path`, `execution_path`; `planning_slug` when the parent was transient | Start a nested workflow under this session            | [Spawning the orchestrator](dispatch-model.md#spawning-the-orchestrator) |
| [get_workflow_status](../src/tools/workflow-tools.ts#L2965) | `session_index`                                                                                                                                  | `status`, `in_flight`, `completed_activities`, `variables`, `workflow`, `last_checkpoint?`                    | A snapshot of where the session is                    | [Polling](dispatch-model.md#polling-a-dispatched-workflow)               |
| [inspect_session](../src/tools/workflow-tools.ts#L3040) | `session_index`, `view?`, `child_index?`, `variable?`, `agent_id?`                                                                               | A compact projection                                                                                          | Read session state, even while a checkpoint is active | [Persistence](state-management-model.md#persistence)                     |

### Workflow navigation

Moving through the workflow, and pausing when a person has to decide.

| Tool                 | Parameters                                                                 | Returns                                                                             | Purpose                                                                     | Detail                                                                                      |
| -------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [get_workflow](../src/tools/workflow-tools.ts#L804) | `session_index`                                                            | Technique bundle, then `id`, `version`, `title`, `description`, `rules?`, `variables?`, `initialActivity`, `graph`, `activities`, `activity_load_errors?`, `session_index`, `planning_folder_path` | The orchestrator's load: rules, variables, `initialActivity`, activity list | [Orchestrator bundle](delivery-model.md#the-orchestrator-bundle)                            |
| [next_activity](../src/tools/workflow-tools.ts#L1186) | `session_index`, `activity_id`, `from_activity?`, `exit?`, `step_manifest?`, `activity_manifest?`, `variables_changed?`, `artifacts_produced?`, `agent_id?`, `context_tokens?`, `progress_published?` | `activity_id`, `session_index`, and `name` or `outstanding`; `_meta.trace_token` when a segment was recorded | Retire one activity and go to the next                                      | [Choosing the next activity](state-management-model.md#choosing-the-next-activity)          |
| [get_activity](../src/tools/workflow-tools.ts#L1657) | `session_index`, `context_tokens`, `agent_id?`, `activity_id?`, `bundle?`  | Activity body; `exit_destinations`, `batch`; `_meta` carries `dispatch`, `batch`, `artifact_prefix`, `artifacts`, `exit_destinations?`, `fan_instance?` | The worker's load for the activity it was dispatched for                    | [Worker bundle](delivery-model.md#the-worker-bundle)                                        |
| [yield_checkpoint](../src/tools/workflow-tools.ts#L2379) | `session_index`, `checkpoint_id`, `message?`, `options?`, `variables_changed?` | `status` (`yielded` or `replayed`), `checkpoint_id`, `session_index`; `variables_published?` when yielded; `resolved_option` and `effect?` when replayed | Pause for a user decision, or replay a prior answer                         | [The worker pauses](checkpoint-model.md#the-worker-pauses)                                  |
| [resume_checkpoint](../src/tools/workflow-tools.ts#L2602) | `session_index`                                                            | `status`, `session_index`, `checkpoint`, `option_id`, `variables_changed`           | Continue after the checkpoint is resolved                                   | [Resume protocol](checkpoint-model.md#the-resume-protocol)                                  |
| [present_checkpoint](../src/tools/workflow-tools.ts#L2645) | `session_index`                                                            | Checkpoint fields (`message`, `options`, effects, `autoAdvanceMs`), `session_index` | Load the active checkpoint for the user                                     | [Presenting and resolving](checkpoint-model.md#the-user-facing-agent-presents-and-resolves) |
| [respond_checkpoint](../src/tools/workflow-tools.ts#L2719) | `session_index`, one of `option_id` / `auto_advance` / `condition_not_met` | `checkpoint_id`, `resolved`, `session_index`, `resolved_option?`, `effect?`, `dismissed?`, `exit?` | Clear the active checkpoint                                                 | [Three ways to resolve one](checkpoint-model.md#three-ways-to-resolve-one)                  |

### Techniques and resources

Loading one technique, or one piece of reference material.

| Tool            | Parameters                                                                                    | Returns                                      | Purpose                                                       | Detail                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [get_technique](../src/tools/resource-tools.ts#L796) | `session_index`, `technique_id?`, `step_id?`, `activity_id?`, `agent_id?`, `bundle?`, `full?` | A composed technique, or an unchanged marker | Load one technique on demand                                  | [Asking for one by name](delivery-model.md#asking-for-one-by-name)                      |
| [get_resource](../src/tools/resource-tools.ts#L1061) | `session_index`, `resource_id`, `agent_id?`, `bundle?`, `full?`                               | A resource body, or an unchanged marker      | Load reference material by slug (`workflow/id` or `#section`) | [Loading a resource](resource-resolution-model.md#loading-a-resource-when-it-is-needed) |

### Trace and accounting

Reading what the run did, and recording what it cost.

| Tool           | Parameters                                                 | Returns          | Purpose                                                        | Detail                                                               |
| -------------- | ---------------------------------------------------------- | ---------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- |
| [get_trace](../src/tools/workflow-tools.ts#L2898) | `session_index`, `trace_tokens?`, `agent_id?`                  | `traceId`, `source`, `event_count`, `events`, `session_index`; `token_errors?` when a token fails to decode | Decode accumulated trace tokens, or return the in-memory trace | [Execution trace](workflow-fidelity.md#layer-7-the-execution-trace)  |
| [record_usage](../src/tools/workflow-tools.ts#L2546) | `session_index`, `activity`, `usage`, `basis`, `agent_id?` | `status`, `activity`, `session_index`, `usage_events` | Record one completed activity's token usage                    | [Token usage](delivery-model.md#token-usage-is-reported-not-derived) |
