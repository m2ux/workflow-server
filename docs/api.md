# API Reference

HTTP routes, MCP resources, and MCP tools.

## HTTP endpoints

These routes exist when the server is listening over HTTP.

| Path      | Purpose                                                        | Detail                                |
| --------- | -------------------------------------------------------------- | ------------------------------------- |
| [/health](../src/transports/http.ts#L79) | The process is up                                                  | [Verify](http.md#3-verify)            |
| [/ready](../src/transports/http.ts#L97) | Ready to serve                                                 | [Readiness checks](#readiness-checks) |
| [/mcp](../src/transports/http.ts#L205) | The MCP session                                                | [MCP tools](#mcp-tools)               |



### Readiness checks

Responses from `GET /ready`. Ready only when every one is true.


| Check                        | True when                                                         | Detail                                                                             |
| ---------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [schemasDir](../src/transports/http.ts#L102), [workspaceDir](../src/transports/http.ts#L103) | Both directories exist                                            | [Process](configuration.md#process), [root binding](configuration.md#root-binding) |
| [engineeringDir](../src/transports/http.ts#L108) | It exists, where the `--repo` layout splits it from the workspace | [Root binding](configuration.md#root-binding)                                      |
| [sessionKeyWritable](../src/transports/http.ts#L104) | The signing-key directory is usable                               | [Signing key](configuration.md#signing-key)                                        |
| [corpusServes](../src/transports/http.ts#L105) | The mounted corpus holds at least one workflow                    | [Process](configuration.md#process)                                                |



## MCP resources

Schema documents, fetched by URI. The field guide is the [schema](schemas.md).

| Resource | Purpose | Detail |
| -------- | ------- | ------ |
| [workflow-server://schemas](../src/resources/schema-resources.ts#L47) | Every schema, in one document | [Schema guide](schemas.md) |
| [workflow-server://schemas/workflow](../src/resources/schema-resources.ts#L23) | A workflow | [workflow.schema.json](../schemas/workflow.schema.json#L9) |
| [workflow-server://schemas/activity](../src/resources/schema-resources.ts#L23) | An activity | [activity.schema.json](../schemas/activity.schema.json#L9) |
| [workflow-server://schemas/condition](../src/resources/schema-resources.ts#L23) | A condition | [condition.schema.json](../schemas/condition.schema.json#L8) |
| [workflow-server://schemas/technique](../src/resources/schema-resources.ts#L23) | A technique | [technique.schema.json](../schemas/technique.schema.json#L9) |
| [workflow-server://schemas/session-file](../src/resources/schema-resources.ts#L23) | The on-disk session record | [session-file.schema.json](../schemas/session-file.schema.json#L9) |

## MCP Tools

Each [tool](../site/api/tools.html): what it takes, what it returns, and the page that explains the behaviour.

### Bootstrap

Calls available before a session exists.

| Tool             | Purpose                                | Parameters | Returns                                       | Detail                                                                  |
| ---------------- | -------------------------------------- | ---------- | --------------------------------------------- | ----------------------------------------------------------------------- |
| [discover](../src/tools/workflow-tools.ts#L799) | Entry point, before any other tool | ∅ | Server info and a bootstrap stub              | [Verify](setup.md#3-verify)                                             |
| [list_workflows](../src/tools/workflow-tools.ts#L817) | The catalog of available workflows     | ∅ | [ { [id](../src/loaders/workflow-loader.ts#L425), [title](../src/loaders/workflow-loader.ts#L425), [version](../src/loaders/workflow-loader.ts#L425), [tags](../src/loaders/workflow-loader.ts#L425)? } ] ⊕ { workflows, [load_errors](../src/tools/workflow-tools.ts#L821) } | [What a namespace is](resolution.md#what-a-namespace-is) |
| [health_check](../src/tools/workflow-tools.ts#L2975) | Server health                          | ∅ | [status](../src/tools/workflow-tools.ts#L2979), [server](../src/tools/workflow-tools.ts#L2980), [version](../src/tools/workflow-tools.ts#L2981), [workflows_available](../src/tools/workflow-tools.ts#L2982), [uptime_seconds](../src/tools/workflow-tools.ts#L2983), [repo_binding](../src/tools/workflow-tools.ts#L2984) | [HTTP endpoints](#http-endpoints)                                       |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*

### Session

Opening a run, and reading where that run stands.

| Tool                  | Purpose                                               | Parameters                                                                                                                                       | Returns                                                                                                       | Detail                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------ |
| [start_session](../src/tools/resource-tools.ts#L145) | Open or resume a top-level session | { [agent_id](../src/tools/resource-tools.ts#L169)?, [workflow_id](../src/tools/resource-tools.ts#L162)?, [working_directory](../src/tools/resource-tools.ts#L164)?, [planning_folder](../src/tools/resource-tools.ts#L163)?, [repo](../src/tools/resource-tools.ts#L165)?, [context_mode](../src/tools/resource-tools.ts#L170)?, [user_request](../src/tools/resource-tools.ts#L166)?, [target_workflow_id](../src/tools/resource-tools.ts#L167)?, [fresh](../src/tools/resource-tools.ts#L168)? } | { [session_index](../src/tools/resource-tools.ts#L559), [planning_slug](../src/tools/resource-tools.ts#L560), [planning_folder_path](../src/tools/resource-tools.ts#L564)?, [workflow](../src/tools/resource-tools.ts#L553) { [id](../src/tools/resource-tools.ts#L554), [version](../src/tools/resource-tools.ts#L555), [title](../src/tools/resource-tools.ts#L556), [description](../src/tools/resource-tools.ts#L557) }, [execution_path](../src/tools/resource-tools.ts#L574), [repo](../src/tools/resource-tools.ts#L567)?, [client](../src/tools/resource-tools.ts#L582)? } ⊕ { [decision](../src/tools/resource-tools.ts#L296) } | [Opening a session](state.md#opening-a-session)         |
| [dispatch_child](../src/tools/resource-tools.ts#L591) | Start a nested workflow under this session | { [session_index](../src/utils/session/params.ts#L10), [workflow_id](../src/tools/resource-tools.ts#L603) } ∪ { [agent_id](../src/tools/resource-tools.ts#L604)?, [planning_slug](../src/tools/resource-tools.ts#L605)?, [repo](../src/tools/resource-tools.ts#L606)?, [context_mode](../src/tools/resource-tools.ts#L607)? } | { [session_index](../src/tools/resource-tools.ts#L742), [workflow](../src/tools/resource-tools.ts#L742) { [id](../src/tools/resource-tools.ts#L742), [version](../src/tools/resource-tools.ts#L742), [initialActivity](../src/tools/resource-tools.ts#L742) }, [planning_folder_path](../src/tools/resource-tools.ts#L742), [execution_path](../src/tools/resource-tools.ts#L742) } ∪ { [planning_slug](../src/tools/resource-tools.ts#L742)? } | [Spawning the orchestrator](dispatch.md#spawning-the-orchestrator) |
| [get_workflow_status](../src/tools/workflow-tools.ts#L2991) | Where the session stands                              | { [session_index](../src/utils/session/params.ts#L10) } | [status](../src/tools/workflow-tools.ts#L3015), [in_flight](../src/tools/workflow-tools.ts#L3020), [completed_activities](../src/tools/workflow-tools.ts#L3021), [variables](../src/tools/workflow-tools.ts#L3024), [workflow](../src/tools/workflow-tools.ts#L3025), [last_checkpoint](../src/tools/workflow-tools.ts#L3033)? | [Polling](dispatch.md#polling-a-dispatched-workflow)               |
| [inspect_session](../src/tools/workflow-tools.ts#L3050) | Read session state. A checkpoint does not block it | { [session_index](../src/utils/session/params.ts#L10) } ∪ { [view](../src/tools/workflow-tools.ts#L3054)?, [child_index](../src/tools/workflow-tools.ts#L3056)?, [variable](../src/tools/workflow-tools.ts#L3058)?, [agent_id](../src/tools/workflow-tools.ts#L3060)? } | The [projection](../src/tools/workflow-tools.ts#L3074) named by view | [Persistence](state.md#persistence)                     |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*
### Workflow navigation

Moving through the workflow, and pausing when a person has to decide.

| Tool                 | Purpose                                                                     | Parameters                                                                 | Returns                                                                             | Detail                                                                                      |
| -------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [get_workflow](../src/tools/workflow-tools.ts#L825) | Load the session workflow | { [session_index](../src/utils/session/params.ts#L10) } | { technique bundle } ∪ { [id](../src/tools/workflow-tools.ts#L853), [version](../src/tools/workflow-tools.ts#L854), [title](../src/tools/workflow-tools.ts#L855), [description](../src/tools/workflow-tools.ts#L856), [rules](../src/tools/workflow-tools.ts#L857)?, [variables](../src/tools/workflow-tools.ts#L862)?, [initialActivity](../src/tools/workflow-tools.ts#L863), [graph](../src/tools/workflow-tools.ts#L866), [activities](../src/tools/workflow-tools.ts#L867), [activity_load_errors](../src/tools/workflow-tools.ts#L871)?, [session_index](../src/tools/workflow-tools.ts#L872), [planning_folder_path](../src/tools/workflow-tools.ts#L878) } | [Orchestrator bundle](delivery.md#orchestrator-bundle)                            |
| [next_activity](../src/tools/workflow-tools.ts#L1207) | Advance to the next activity. The body stays with get_activity | { [session_index](../src/utils/session/params.ts#L10), [activity_id](../src/tools/workflow-tools.ts#L1210) } ∪ { [from_activity](../src/tools/workflow-tools.ts#L1213)?, [exit](../src/tools/workflow-tools.ts#L1216)?, [step_manifest](../src/tools/workflow-tools.ts#L1217)?, [activity_manifest](../src/tools/workflow-tools.ts#L1218)?, [variables_changed](../src/tools/workflow-tools.ts#L1219)?, [artifacts_produced](../src/tools/workflow-tools.ts#L1220)?, [agent_id](../src/tools/workflow-tools.ts#L1221)?, [context_tokens](../src/tools/workflow-tools.ts#L1224)?, [progress_published](../src/tools/workflow-tools.ts#L1227)? } | { [activity_id](../src/tools/workflow-tools.ts#L1665), [session_index](../src/tools/workflow-tools.ts#L1669) } ∪ { [name](../src/tools/workflow-tools.ts#L1668) ⊕ [outstanding](../src/tools/workflow-tools.ts#L1667) } ∪ { [trace_token](../src/tools/workflow-tools.ts#L1647)? } | [Choosing the next activity](state.md#choosing-the-next-activity)          |
| [get_activity](../src/tools/workflow-tools.ts#L1678) | Load the activity this context was dispatched for | { [session_index](../src/utils/session/params.ts#L10), [context_tokens](../src/utils/session/params.ts#L29) } ∪ { [agent_id](../src/utils/session/params.ts#L49)?, [activity_id](../src/tools/workflow-tools.ts#L1691)?, [bundle](../src/tools/workflow-tools.ts#L1694)? } | { activity body, [exit_destinations](../src/tools/workflow-tools.ts#L253)?, [batch](../src/tools/workflow-tools.ts#L2334) } ∪ { [dispatch](../src/tools/workflow-tools.ts#L2341), [batch](../src/tools/workflow-tools.ts#L2341), [artifact_prefix](../src/tools/workflow-tools.ts#L2340), [artifacts](../src/tools/workflow-tools.ts#L2340), [exit_destinations](../src/tools/workflow-tools.ts#L2342)?, [fan_instance](../src/tools/workflow-tools.ts#L2343)? } | [Worker bundle](delivery.md#worker-bundle)                                        |
| [yield_checkpoint](../src/tools/workflow-tools.ts#L2400) | Yield a checkpoint, or replay one already answered | { [session_index](../src/utils/session/params.ts#L10), [checkpoint_id](../src/tools/workflow-tools.ts#L2403) } ∪ { [message](../src/tools/workflow-tools.ts#L2404)?, [options](../src/tools/workflow-tools.ts#L2405)?, [variables_changed](../src/tools/workflow-tools.ts#L2410)? } | { [status](../src/tools/workflow-tools.ts#L2551), [checkpoint_id](../src/tools/workflow-tools.ts#L2552), [session_index](../src/tools/workflow-tools.ts#L2553), [variables_published](../src/tools/workflow-tools.ts#L2554)? } ⊕ { [status](../src/tools/workflow-tools.ts#L2502), [checkpoint_id](../src/tools/workflow-tools.ts#L2503), [session_index](../src/tools/workflow-tools.ts#L2504), [resolved_option](../src/tools/workflow-tools.ts#L2505), [exit](../src/tools/workflow-tools.ts#L2506)?, [effect](../src/tools/workflow-tools.ts#L2512)? } | [The worker pauses](checkpoint.md#worker-pauses)                                  |
| [resume_checkpoint](../src/tools/workflow-tools.ts#L2623) | Continue after the checkpoint is resolved                                   | { [session_index](../src/utils/session/params.ts#L10) } | [status](../src/tools/workflow-tools.ts#L2659), [session_index](../src/tools/workflow-tools.ts#L2660), [checkpoint](../src/tools/workflow-tools.ts#L2661), [option_id](../src/tools/workflow-tools.ts#L2662), [variables_changed](../src/tools/workflow-tools.ts#L2663), [exit](../src/tools/workflow-tools.ts#L2664)? | [Resume protocol](checkpoint.md#resume-protocol)                                  |
| [present_checkpoint](../src/tools/workflow-tools.ts#L2676) | Load the active checkpoint for the user                                     | { [session_index](../src/utils/session/params.ts#L10) } | { [message](../src/tools/workflow-tools.ts#L2708), [options](../src/tools/workflow-tools.ts#L2717), [session_index](../src/tools/workflow-tools.ts#L2743) } | [Presenting and resolving](checkpoint.md#user-facing-agent-presents-and-resolves) |
| [respond_checkpoint](../src/tools/workflow-tools.ts#L2750) | Clear the active checkpoint                                                 | { [session_index](../src/utils/session/params.ts#L10) } ∪ { [option_id](../src/tools/workflow-tools.ts#L2755) ⊕ [auto_advance](../src/tools/workflow-tools.ts#L2756) ⊕ [condition_not_met](../src/tools/workflow-tools.ts#L2757) } | { [checkpoint_id](../src/tools/workflow-tools.ts#L2899), [resolved](../src/tools/workflow-tools.ts#L2900), [session_index](../src/tools/workflow-tools.ts#L2901) } ∪ { [resolved_option](../src/tools/workflow-tools.ts#L2903)?, [effect](../src/tools/workflow-tools.ts#L2904)?, [dismissed](../src/tools/workflow-tools.ts#L2905)?, [exit](../src/tools/workflow-tools.ts#L2911)? } | [Three ways to resolve one](checkpoint.md#resolving-a-pause)                  |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*
### Techniques and resources

Loading one technique, or one piece of reference material.

| Tool            | Purpose                                                       | Parameters                                                                                    | Returns                                      | Detail                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [get_technique](../src/tools/resource-tools.ts#L796) | Load one technique on demand | { [session_index](../src/utils/session/params.ts#L10) } ∪ { [technique_id](../src/tools/resource-tools.ts#L804)?, [step_id](../src/tools/resource-tools.ts#L807)?, [activity_id](../src/tools/resource-tools.ts#L808)?, [agent_id](../src/utils/session/params.ts#L49)?, [bundle](../src/tools/resource-tools.ts#L809)?, [full](../src/tools/resource-tools.ts#L810)? } | { [composed technique](../src/tools/resource-tools.ts#L1055) } ⊕ { [unchanged marker](../src/tools/resource-tools.ts#L1017) } | [Asking for one by name](delivery.md#asking-for-one-technique-by-name)                      |
| [get_resource](../src/tools/resource-tools.ts#L1061) | Load a resource | { [session_index](../src/utils/session/params.ts#L10), [resource_id](../src/tools/resource-tools.ts#L1069) } ∪ { [agent_id](../src/utils/session/params.ts#L49)?, [bundle](../src/tools/resource-tools.ts#L1070)?, [full](../src/tools/resource-tools.ts#L1071)? } | { [resource body](../src/tools/resource-tools.ts#L1126) } ⊕ { [unchanged marker](../src/tools/resource-tools.ts#L1156) } | [Loading a resource](resolution.md#loading-a-resource-when-it-is-needed) |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*
### Trace and accounting

Reading what the run did, and recording what it cost.

| Tool           | Purpose                                                        | Parameters                                                 | Returns          | Detail                                                               |
| -------------- | ---------------------------------------------------------- | ---------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- |
| [get_trace](../src/tools/workflow-tools.ts#L2924) | The session trace, from tokens or from memory | { [session_index](../src/utils/session/params.ts#L10) } ∪ { [trace_tokens](../src/tools/workflow-tools.ts#L2927)?, [agent_id](../src/tools/workflow-tools.ts#L2928)? } | { [traceId](../src/tools/workflow-tools.ts#L2952), [source](../src/tools/workflow-tools.ts#L2952), [event_count](../src/tools/workflow-tools.ts#L2952), [events](../src/tools/workflow-tools.ts#L2952), [session_index](../src/tools/workflow-tools.ts#L2952) } ∪ { [token_errors](../src/tools/workflow-tools.ts#L2953)? } | [Execution trace](fidelity.md#layer-7-the-execution-trace)  |
| [record_usage](../src/tools/workflow-tools.ts#L2567) | Record one completed activity's token usage | { [session_index](../src/utils/session/params.ts#L10), [activity](../src/tools/workflow-tools.ts#L2570), [usage](../src/tools/workflow-tools.ts#L2571), [basis](../src/tools/workflow-tools.ts#L2576) } ∪ { [agent_id](../src/tools/workflow-tools.ts#L2583)? } | [status](../src/tools/workflow-tools.ts#L2613), [activity](../src/tools/workflow-tools.ts#L2614), [session_index](../src/tools/workflow-tools.ts#L2615), [usage_events](../src/tools/workflow-tools.ts#L2616) | [Token usage](delivery.md#reported-cost) |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*
