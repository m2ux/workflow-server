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
| [discover](../src/tools/workflow-tools.ts#L812) | Entry point, before any other tool | ∅ | Server info and a bootstrap stub              | [Verify](setup.md#3-verify)                                             |
| [list_workflows](../src/tools/workflow-tools.ts#L830) | The catalog of available workflows     | ∅ | [ { [id](../src/loaders/workflow-loader.ts#L441), [title](../src/loaders/workflow-loader.ts#L441), [version](../src/loaders/workflow-loader.ts#L441), [tags](../src/loaders/workflow-loader.ts#L441)? } ] ⊕ { workflows, [load_errors](../src/tools/workflow-tools.ts#L834) } | [What a namespace is](resolution.md#what-a-namespace-is) |
| [health_check](../src/tools/workflow-tools.ts#L3034) | Server health                          | ∅ | [status](../src/tools/workflow-tools.ts#L3034), [server](../src/tools/workflow-tools.ts#L3034), [version](../src/tools/workflow-tools.ts#L3034), [workflows_available](../src/tools/workflow-tools.ts#L3041), [uptime_seconds](../src/tools/workflow-tools.ts#L3042), [repo_binding](../src/tools/workflow-tools.ts#L3043) | [HTTP endpoints](#http-endpoints)                                       |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*

### Session

Opening a run, and reading where that run stands.

| Tool                  | Purpose                                               | Parameters                                                                                                                                       | Returns                                                                                                       | Detail                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------ |
| [start_session](../src/tools/resource-tools.ts#L189) | Open or resume a top-level session | { [agent_id](../src/tools/resource-tools.ts#L215)?, [workflow_id](../src/tools/resource-tools.ts#L208)?, [working_directory](../src/tools/resource-tools.ts#L210)?, [planning_folder](../src/tools/resource-tools.ts#L209)?, [repo](../src/tools/resource-tools.ts#L211)?, [context_mode](../src/tools/resource-tools.ts#L216)?, [user_request](../src/tools/resource-tools.ts#L212)?, [target_workflow_id](../src/tools/resource-tools.ts#L213)?, [fresh](../src/tools/resource-tools.ts#L214)? } | { [session_index](../src/tools/resource-tools.ts#L613), [planning_slug](../src/tools/resource-tools.ts#L620), [resumed](../src/tools/resource-tools.ts#L621), [planning_folder_path](../src/tools/resource-tools.ts#L625)?, [workflow](../src/tools/resource-tools.ts#L603) { [id](../src/tools/resource-tools.ts#L604), [version](../src/tools/resource-tools.ts#L605), [title](../src/tools/resource-tools.ts#L606), [description](../src/tools/resource-tools.ts#L607) }, [execution_path](../src/tools/resource-tools.ts#L635), [repo](../src/tools/resource-tools.ts#L628)?, [client](../src/tools/resource-tools.ts#L643)? } ⊕ { [decision](../src/tools/resource-tools.ts#L350) } | [Opening a session](state.md#opening-a-session)         |
| [dispatch_child](../src/tools/resource-tools.ts#L653) | Start a nested workflow under this session | { [session_index](../src/utils/session/params.ts#L10), [workflow_id](../src/tools/resource-tools.ts#L664) } ∪ { [agent_id](../src/tools/resource-tools.ts#L665)?, [planning_slug](../src/tools/resource-tools.ts#L666)?, [repo](../src/tools/resource-tools.ts#L667)?, [context_mode](../src/tools/resource-tools.ts#L668)? } | { [session_index](../src/tools/resource-tools.ts#L817), [workflow](../src/tools/resource-tools.ts#L817) { [id](../src/tools/resource-tools.ts#L817), [version](../src/tools/resource-tools.ts#L817), [initialActivity](../src/tools/resource-tools.ts#L817) }, [planning_folder_path](../src/tools/resource-tools.ts#L817), [execution_path](../src/tools/resource-tools.ts#L817) } ∪ { [planning_slug](../src/tools/resource-tools.ts#L817)? } | [Spawning the orchestrator](dispatch.md#spawning-the-orchestrator) |
| [get_workflow_status](../src/tools/workflow-tools.ts#L3050) | Where the session stands                              | { [session_index](../src/utils/session/params.ts#L10) } | [status](../src/tools/workflow-tools.ts#L3065), [in_flight](../src/tools/workflow-tools.ts#L3079), [completed_activities](../src/tools/workflow-tools.ts#L3080), [variables](../src/tools/workflow-tools.ts#L3083), [workflow](../src/tools/workflow-tools.ts#L3063), [last_checkpoint](../src/tools/workflow-tools.ts#L3092)? | [Polling](dispatch.md#polling-a-dispatched-workflow)               |
| [inspect_session](../src/tools/workflow-tools.ts#L3111) | Read session state. A checkpoint does not block it | { [session_index](../src/utils/session/params.ts#L10) } ∪ { [view](../src/tools/workflow-tools.ts#L3115)?, [child_index](../src/tools/workflow-tools.ts#L3117)?, [variable](../src/tools/workflow-tools.ts#L3119)?, [agent_id](../src/tools/workflow-tools.ts#L3121)? } | The [projection](../src/tools/workflow-tools.ts#L3135) named by view | [Persistence](state.md#persistence)                     |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*
### Workflow navigation

Moving through the workflow, and pausing when a person has to decide.

| Tool                 | Purpose                                                                     | Parameters                                                                 | Returns                                                                             | Detail                                                                                      |
| -------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [get_workflow](../src/tools/workflow-tools.ts#L838) | Load the session workflow | { [session_index](../src/utils/session/params.ts#L10) } | { technique bundle } ∪ { [id](../src/tools/workflow-tools.ts#L866), [version](../src/tools/workflow-tools.ts#L867), [title](../src/tools/workflow-tools.ts#L868), [description](../src/tools/workflow-tools.ts#L869), [rules](../src/tools/workflow-tools.ts#L870)?, [variables](../src/tools/workflow-tools.ts#L875)?, [initialActivity](../src/tools/workflow-tools.ts#L876), [graph](../src/tools/workflow-tools.ts#L879), [activities](../src/tools/workflow-tools.ts#L880), [activity_load_errors](../src/tools/workflow-tools.ts#L884)?, [session_index](../src/tools/workflow-tools.ts#L885), [planning_folder_path](../src/tools/workflow-tools.ts#L891) } | [Orchestrator bundle](delivery.md#orchestrator-bundle)                            |
| [next_activity](../src/tools/workflow-tools.ts#L1205) | Advance to the next activity. The body stays with get_activity | { [session_index](../src/utils/session/params.ts#L10), [activity_id](../src/tools/workflow-tools.ts#L1208) } ∪ { [from_activity](../src/tools/workflow-tools.ts#L1211)?, [exit](../src/tools/workflow-tools.ts#L1214)?, [step_manifest](../src/tools/workflow-tools.ts#L1215)?, [activity_manifest](../src/tools/workflow-tools.ts#L1216)?, [variables_changed](../src/tools/workflow-tools.ts#L1217)?, [artifacts_produced](../src/tools/workflow-tools.ts#L1218)?, [agent_id](../src/tools/workflow-tools.ts#L1219)?, [context_tokens](../src/tools/workflow-tools.ts#L1222)?, [progress_published](../src/tools/workflow-tools.ts#L1225)? } | { [activity_id](../src/tools/workflow-tools.ts#L1697), [session_index](../src/tools/workflow-tools.ts#L1704) } ∪ { [name](../src/tools/workflow-tools.ts#L1694) ⊕ [outstanding](../src/tools/workflow-tools.ts#L1699) } ∪ { [trace_token](../src/tools/workflow-tools.ts#L1679)? } | [Choosing the next activity](state.md#choosing-the-next-activity)          |
| [get_activity](../src/tools/workflow-tools.ts#L1713) | Load the activity this context was dispatched for | { [session_index](../src/utils/session/params.ts#L10), [context_tokens](../src/utils/session/params.ts#L29) } ∪ { [agent_id](../src/utils/session/params.ts#L49)?, [activity_id](../src/tools/workflow-tools.ts#L1713)?, [bundle](../src/tools/workflow-tools.ts#L1716)? } | { activity body, [exit_destinations](../src/tools/workflow-tools.ts#L250)?, [batch](../src/tools/workflow-tools.ts#L2355) } ∪ { [dispatch](../src/tools/workflow-tools.ts#L2371), [batch](../src/tools/workflow-tools.ts#L2364), [artifact_prefix](../src/tools/workflow-tools.ts#L2370), [artifacts](../src/tools/workflow-tools.ts#L2370), [exit_destinations](../src/tools/workflow-tools.ts#L2372)?, [fan_instance](../src/tools/workflow-tools.ts#L2373)? } | [Worker bundle](delivery.md#worker-bundle)                                        |
| [yield_checkpoint](../src/tools/workflow-tools.ts#L2430) | Yield a checkpoint, or replay one already answered | { [session_index](../src/utils/session/params.ts#L10), [checkpoint_id](../src/tools/workflow-tools.ts#L2433) } ∪ { [message](../src/tools/workflow-tools.ts#L2430)?, [options](../src/tools/workflow-tools.ts#L2430)?, [variables_changed](../src/tools/workflow-tools.ts#L2440)? } | { [status](../src/tools/workflow-tools.ts#L2581), [checkpoint_id](../src/tools/workflow-tools.ts#L2569), [session_index](../src/tools/workflow-tools.ts#L2575), [variables_published](../src/tools/workflow-tools.ts#L2584)? } ⊕ { [status](../src/tools/workflow-tools.ts#L2532), [checkpoint_id](../src/tools/workflow-tools.ts#L2525), [session_index](../src/tools/workflow-tools.ts#L2534), [resolved_option](../src/tools/workflow-tools.ts#L2535), [exit](../src/tools/workflow-tools.ts#L2517)?, [effect](../src/tools/workflow-tools.ts#L2537)? } | [The worker pauses](checkpoint.md#worker-pauses)                                  |
| [resume_checkpoint](../src/tools/workflow-tools.ts#L2653) | Continue after the checkpoint is resolved                                   | { [session_index](../src/utils/session/params.ts#L10) } | [status](../src/tools/workflow-tools.ts#L2689), [session_index](../src/tools/workflow-tools.ts#L2690), [checkpoint](../src/tools/workflow-tools.ts#L2677), [option_id](../src/tools/workflow-tools.ts#L2692), [variables_changed](../src/tools/workflow-tools.ts#L2693), [exit](../src/tools/workflow-tools.ts#L2684)? | [Resume protocol](checkpoint.md#resume-protocol)                                  |
| [present_checkpoint](../src/tools/workflow-tools.ts#L2706) | Load the active checkpoint for the user                                     | { [session_index](../src/utils/session/params.ts#L10) } | { [message](../src/tools/workflow-tools.ts#L2738), [options](../src/tools/workflow-tools.ts#L2745), [session_index](../src/tools/workflow-tools.ts#L2769) } | [Presenting and resolving](checkpoint.md#user-facing-agent-presents-and-resolves) |
| [respond_checkpoint](../src/tools/workflow-tools.ts#L2780) | Clear the active checkpoint                                                 | { [session_index](../src/utils/session/params.ts#L10) } ∪ { [option_id](../src/tools/workflow-tools.ts#L2782) ∪ { [reply](../src/tools/workflow-tools.ts#L2783)? } ⊕ [auto_advance](../src/tools/workflow-tools.ts#L2782) ⊕ [condition_not_met](../src/tools/workflow-tools.ts#L2782) } | { [checkpoint_id](../src/tools/workflow-tools.ts#L2948), [resolved](../src/tools/workflow-tools.ts#L2959), [session_index](../src/tools/workflow-tools.ts#L2948) } ∪ { [resolved_option](../src/tools/workflow-tools.ts#L2962)?, [effect](../src/tools/workflow-tools.ts#L2963)?, [dismissed](../src/tools/workflow-tools.ts#L2964)?, [exit](../src/tools/workflow-tools.ts#L2965)? } | [Three ways to resolve one](checkpoint.md#resolving-a-pause)                  |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*
### Techniques and resources

Loading one technique, or one piece of reference material.

| Tool            | Purpose                                                       | Parameters                                                                                    | Returns                                      | Detail                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [get_technique](../src/tools/resource-tools.ts#L872) | Load one technique on demand | { [session_index](../src/utils/session/params.ts#L10) } ∪ { [technique_id](../src/tools/resource-tools.ts#L879)?, [step_id](../src/tools/resource-tools.ts#L882)?, [activity_id](../src/tools/resource-tools.ts#L883)?, [agent_id](../src/utils/session/params.ts#L49)?, [bundle](../src/tools/resource-tools.ts#L884)?, [full](../src/tools/resource-tools.ts#L885)? } | { [composed technique](../src/tools/resource-tools.ts#L1122) } ⊕ { [unchanged marker](../src/tools/resource-tools.ts#L1084) } | [Asking for one by name](delivery.md#asking-for-one-technique-by-name)                      |
| [get_resource](../src/tools/resource-tools.ts#L1137) | Load a resource | { [session_index](../src/utils/session/params.ts#L10), [resource_id](../src/tools/resource-tools.ts#L1144) } ∪ { [agent_id](../src/utils/session/params.ts#L49)?, [bundle](../src/tools/resource-tools.ts#L1145)?, [full](../src/tools/resource-tools.ts#L1146)? } | { [resource body](../src/tools/resource-tools.ts#L1193) } ⊕ { [unchanged marker](../src/tools/resource-tools.ts#L1223) } | [Loading a resource](resolution.md#loading-a-resource-when-it-is-needed) |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*
### Trace and accounting

Reading what the run did, and recording what it cost.

| Tool           | Purpose                                                        | Parameters                                                 | Returns          | Detail                                                               |
| -------------- | ---------------------------------------------------------- | ---------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- |
| [get_trace](../src/tools/workflow-tools.ts#L2983) | The session trace, from tokens or from memory | { [session_index](../src/utils/session/params.ts#L10) } ∪ { [trace_tokens](../src/tools/workflow-tools.ts#L2983)?, [agent_id](../src/tools/workflow-tools.ts#L2983)? } | { [traceId](../src/tools/workflow-tools.ts#L3011), [source](../src/tools/workflow-tools.ts#L3011), [event_count](../src/tools/workflow-tools.ts#L3011), [events](../src/tools/workflow-tools.ts#L3005), [session_index](../src/tools/workflow-tools.ts#L2993) } ∪ { [token_errors](../src/tools/workflow-tools.ts#L3012)? } | [Execution trace](fidelity.md#layer-7-the-execution-trace)  |
| [record_usage](../src/tools/workflow-tools.ts#L2597) | Record one completed activity's token usage | { [session_index](../src/utils/session/params.ts#L10), [activity](../src/tools/workflow-tools.ts#L2597), [usage](../src/tools/workflow-tools.ts#L2597), [basis](../src/tools/workflow-tools.ts#L2597) } ∪ { [agent_id](../src/tools/workflow-tools.ts#L2597)? } | [status](../src/tools/workflow-tools.ts#L2643), [activity](../src/tools/workflow-tools.ts#L2635), [session_index](../src/tools/workflow-tools.ts#L2645), [usage_events](../src/tools/workflow-tools.ts#L2646) | [Token usage](delivery.md#reported-cost) |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*
