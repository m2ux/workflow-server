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
| [discover](../src/tools/workflow-tools.ts#L815) | Entry point, before any other tool | ∅ | Server info and a bootstrap stub              | [Verify](setup.md#3-verify)                                             |
| [list_workflows](../src/tools/workflow-tools.ts#L833) | The catalog of available workflows     | ∅ | [ { [id](../src/loaders/workflow-loader.ts#L441), [title](../src/loaders/workflow-loader.ts#L441), [version](../src/loaders/workflow-loader.ts#L441), [tags](../src/loaders/workflow-loader.ts#L441)? } ] ⊕ { workflows, [load_errors](../src/tools/workflow-tools.ts#L837) } | [What a namespace is](resolution.md#what-a-namespace-is) |
| [health_check](../src/tools/workflow-tools.ts#L3052) | Server health                          | ∅ | [status](../src/tools/workflow-tools.ts#L3052), [server](../src/tools/workflow-tools.ts#L3052), [version](../src/tools/workflow-tools.ts#L3052), [workflows_available](../src/tools/workflow-tools.ts#L3059), [uptime_seconds](../src/tools/workflow-tools.ts#L3060), [repo_binding](../src/tools/workflow-tools.ts#L3061) | [HTTP endpoints](#http-endpoints)                                       |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*

### Session

Opening a run, and reading where that run stands.

| Tool                  | Purpose                                               | Parameters                                                                                                                                       | Returns                                                                                                       | Detail                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------ |
| [start_session](../src/tools/resource-tools.ts#L189) | Open or resume a top-level session | { [agent_id](../src/tools/resource-tools.ts#L215)?, [workflow_id](../src/tools/resource-tools.ts#L208)?, [working_directory](../src/tools/resource-tools.ts#L210)?, [planning_folder](../src/tools/resource-tools.ts#L209)?, [repo](../src/tools/resource-tools.ts#L211)?, [context_mode](../src/tools/resource-tools.ts#L216)?, [user_request](../src/tools/resource-tools.ts#L212)?, [target_workflow_id](../src/tools/resource-tools.ts#L213)?, [fresh](../src/tools/resource-tools.ts#L214)? } | { [session_index](../src/tools/resource-tools.ts#L617), [planning_slug](../src/tools/resource-tools.ts#L624), [resumed](../src/tools/resource-tools.ts#L625), [planning_folder_path](../src/tools/resource-tools.ts#L629)?, [workflow](../src/tools/resource-tools.ts#L607) { [id](../src/tools/resource-tools.ts#L608), [version](../src/tools/resource-tools.ts#L609), [title](../src/tools/resource-tools.ts#L610), [description](../src/tools/resource-tools.ts#L611) }, [execution_path](../src/tools/resource-tools.ts#L639), [repo](../src/tools/resource-tools.ts#L632)?, [client](../src/tools/resource-tools.ts#L647)? } ⊕ { [decision](../src/tools/resource-tools.ts#L354) } | [Opening a session](state.md#opening-a-session)         |
| [dispatch_child](../src/tools/resource-tools.ts#L657) | Start a nested workflow under this session | { [session_index](../src/utils/session/params.ts#L10), [workflow_id](../src/tools/resource-tools.ts#L668) } ∪ { [agent_id](../src/tools/resource-tools.ts#L669)?, [planning_slug](../src/tools/resource-tools.ts#L670)?, [repo](../src/tools/resource-tools.ts#L671)?, [context_mode](../src/tools/resource-tools.ts#L672)? } | { [session_index](../src/tools/resource-tools.ts#L821), [workflow](../src/tools/resource-tools.ts#L821) { [id](../src/tools/resource-tools.ts#L821), [version](../src/tools/resource-tools.ts#L821), [initialActivity](../src/tools/resource-tools.ts#L821) }, [planning_folder_path](../src/tools/resource-tools.ts#L821), [execution_path](../src/tools/resource-tools.ts#L821) } ∪ { [planning_slug](../src/tools/resource-tools.ts#L821)? } | [Spawning the orchestrator](dispatch.md#spawning-the-orchestrator) |
| [get_workflow_status](../src/tools/workflow-tools.ts#L3068) | Where the session stands                              | { [session_index](../src/utils/session/params.ts#L10) } | [status](../src/tools/workflow-tools.ts#L3083), [in_flight](../src/tools/workflow-tools.ts#L3097), [completed_activities](../src/tools/workflow-tools.ts#L3098), [variables](../src/tools/workflow-tools.ts#L3101), [workflow](../src/tools/workflow-tools.ts#L3081), [last_checkpoint](../src/tools/workflow-tools.ts#L3110)? | [Polling](dispatch.md#polling-a-dispatched-workflow)               |
| [inspect_session](../src/tools/workflow-tools.ts#L3129) | Read session state. A checkpoint does not block it | { [session_index](../src/utils/session/params.ts#L10) } ∪ { [view](../src/tools/workflow-tools.ts#L3133)?, [child_index](../src/tools/workflow-tools.ts#L3135)?, [variable](../src/tools/workflow-tools.ts#L3137)?, [agent_id](../src/tools/workflow-tools.ts#L3139)? } | The [projection](../src/tools/workflow-tools.ts#L3153) named by view | [Persistence](state.md#persistence)                     |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*
### Workflow navigation

Moving through the workflow, and pausing when a person has to decide.

| Tool                 | Purpose                                                                     | Parameters                                                                 | Returns                                                                             | Detail                                                                                      |
| -------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [get_workflow](../src/tools/workflow-tools.ts#L841) | Load the session workflow | { [session_index](../src/utils/session/params.ts#L10) } | { technique bundle } ∪ { [id](../src/tools/workflow-tools.ts#L869), [version](../src/tools/workflow-tools.ts#L870), [title](../src/tools/workflow-tools.ts#L871), [description](../src/tools/workflow-tools.ts#L872), [rules](../src/tools/workflow-tools.ts#L873)?, [variables](../src/tools/workflow-tools.ts#L878)?, [initialActivity](../src/tools/workflow-tools.ts#L879), [graph](../src/tools/workflow-tools.ts#L882), [activities](../src/tools/workflow-tools.ts#L883), [activity_load_errors](../src/tools/workflow-tools.ts#L887)?, [session_index](../src/tools/workflow-tools.ts#L888), [planning_folder_path](../src/tools/workflow-tools.ts#L894) } | [Orchestrator bundle](delivery.md#orchestrator-bundle)                            |
| [next_activity](../src/tools/workflow-tools.ts#L1223) | Advance to the next activity. The body stays with get_activity | { [session_index](../src/utils/session/params.ts#L10), [activity_id](../src/tools/workflow-tools.ts#L1226) } ∪ { [from_activity](../src/tools/workflow-tools.ts#L1229)?, [exit](../src/tools/workflow-tools.ts#L1232)?, [step_manifest](../src/tools/workflow-tools.ts#L1233)?, [activity_manifest](../src/tools/workflow-tools.ts#L1234)?, [variables_changed](../src/tools/workflow-tools.ts#L1235)?, [artifacts_produced](../src/tools/workflow-tools.ts#L1236)?, [agent_id](../src/tools/workflow-tools.ts#L1237)?, [context_tokens](../src/tools/workflow-tools.ts#L1240)?, [progress_published](../src/tools/workflow-tools.ts#L1243)? } | { [activity_id](../src/tools/workflow-tools.ts#L1715), [session_index](../src/tools/workflow-tools.ts#L1722) } ∪ { [name](../src/tools/workflow-tools.ts#L1712) ⊕ [outstanding](../src/tools/workflow-tools.ts#L1717) } ∪ { [trace_token](../src/tools/workflow-tools.ts#L1697)? } | [Choosing the next activity](state.md#choosing-the-next-activity)          |
| [get_activity](../src/tools/workflow-tools.ts#L1731) | Load the activity this context was dispatched for | { [session_index](../src/utils/session/params.ts#L10), [context_tokens](../src/utils/session/params.ts#L29) } ∪ { [agent_id](../src/utils/session/params.ts#L49)?, [activity_id](../src/tools/workflow-tools.ts#L1731)?, [bundle](../src/tools/workflow-tools.ts#L1734)? } | { activity body, [exit_destinations](../src/tools/workflow-tools.ts#L253)?, [batch](../src/tools/workflow-tools.ts#L2373) } ∪ { [dispatch](../src/tools/workflow-tools.ts#L2389), [batch](../src/tools/workflow-tools.ts#L2382), [artifact_prefix](../src/tools/workflow-tools.ts#L2388), [artifacts](../src/tools/workflow-tools.ts#L2388), [exit_destinations](../src/tools/workflow-tools.ts#L2390)?, [fan_instance](../src/tools/workflow-tools.ts#L2391)? } | [Worker bundle](delivery.md#worker-bundle)                                        |
| [yield_checkpoint](../src/tools/workflow-tools.ts#L2448) | Yield a checkpoint, or replay one already answered | { [session_index](../src/utils/session/params.ts#L10), [checkpoint_id](../src/tools/workflow-tools.ts#L2451) } ∪ { [message](../src/tools/workflow-tools.ts#L2448)?, [options](../src/tools/workflow-tools.ts#L2448)?, [variables_changed](../src/tools/workflow-tools.ts#L2458)? } | { [status](../src/tools/workflow-tools.ts#L2599), [checkpoint_id](../src/tools/workflow-tools.ts#L2587), [session_index](../src/tools/workflow-tools.ts#L2593), [variables_published](../src/tools/workflow-tools.ts#L2602)? } ⊕ { [status](../src/tools/workflow-tools.ts#L2550), [checkpoint_id](../src/tools/workflow-tools.ts#L2543), [session_index](../src/tools/workflow-tools.ts#L2552), [resolved_option](../src/tools/workflow-tools.ts#L2553), [exit](../src/tools/workflow-tools.ts#L2535)?, [effect](../src/tools/workflow-tools.ts#L2555)? } | [The worker pauses](checkpoint.md#worker-pauses)                                  |
| [resume_checkpoint](../src/tools/workflow-tools.ts#L2671) | Continue after the checkpoint is resolved                                   | { [session_index](../src/utils/session/params.ts#L10) } | [status](../src/tools/workflow-tools.ts#L2707), [session_index](../src/tools/workflow-tools.ts#L2708), [checkpoint](../src/tools/workflow-tools.ts#L2695), [option_id](../src/tools/workflow-tools.ts#L2710), [variables_changed](../src/tools/workflow-tools.ts#L2711), [exit](../src/tools/workflow-tools.ts#L2702)? | [Resume protocol](checkpoint.md#resume-protocol)                                  |
| [present_checkpoint](../src/tools/workflow-tools.ts#L2724) | Load the active checkpoint for the user                                     | { [session_index](../src/utils/session/params.ts#L10) } | { [message](../src/tools/workflow-tools.ts#L2756), [options](../src/tools/workflow-tools.ts#L2763), [session_index](../src/tools/workflow-tools.ts#L2787) } | [Presenting and resolving](checkpoint.md#user-facing-agent-presents-and-resolves) |
| [respond_checkpoint](../src/tools/workflow-tools.ts#L2798) | Clear the active checkpoint                                                 | { [session_index](../src/utils/session/params.ts#L10) } ∪ { [option_id](../src/tools/workflow-tools.ts#L2800) ∪ { [reply](../src/tools/workflow-tools.ts#L2801)? } ⊕ [auto_advance](../src/tools/workflow-tools.ts#L2800) ⊕ [condition_not_met](../src/tools/workflow-tools.ts#L2800) } | { [checkpoint_id](../src/tools/workflow-tools.ts#L2966), [resolved](../src/tools/workflow-tools.ts#L2977), [session_index](../src/tools/workflow-tools.ts#L2966) } ∪ { [resolved_option](../src/tools/workflow-tools.ts#L2980)?, [effect](../src/tools/workflow-tools.ts#L2981)?, [dismissed](../src/tools/workflow-tools.ts#L2982)?, [exit](../src/tools/workflow-tools.ts#L2983)? } | [Three ways to resolve one](checkpoint.md#resolving-a-pause)                  |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*
### Techniques and resources

Loading one technique, or one piece of reference material.

| Tool            | Purpose                                                       | Parameters                                                                                    | Returns                                      | Detail                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [get_technique](../src/tools/resource-tools.ts#L876) | Load one technique on demand | { [session_index](../src/utils/session/params.ts#L10) } ∪ { [technique_id](../src/tools/resource-tools.ts#L883)?, [step_id](../src/tools/resource-tools.ts#L886)?, [activity_id](../src/tools/resource-tools.ts#L887)?, [agent_id](../src/utils/session/params.ts#L49)?, [bundle](../src/tools/resource-tools.ts#L888)?, [full](../src/tools/resource-tools.ts#L889)? } | { [composed technique](../src/tools/resource-tools.ts#L1122) } ⊕ { [unchanged marker](../src/tools/resource-tools.ts#L1084) } | [Asking for one by name](delivery.md#asking-for-one-technique-by-name)                      |
| [get_resource](../src/tools/resource-tools.ts#L1141) | Load a resource | { [session_index](../src/utils/session/params.ts#L10), [resource_id](../src/tools/resource-tools.ts#L1148) } ∪ { [agent_id](../src/utils/session/params.ts#L49)?, [bundle](../src/tools/resource-tools.ts#L1149)?, [full](../src/tools/resource-tools.ts#L1150)? } | { [resource body](../src/tools/resource-tools.ts#L1193) } ⊕ { [unchanged marker](../src/tools/resource-tools.ts#L1223) } | [Loading a resource](resolution.md#loading-a-resource-when-it-is-needed) |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*
### Trace and accounting

Reading what the run did, and recording what it cost.

| Tool           | Purpose                                                        | Parameters                                                 | Returns          | Detail                                                               |
| -------------- | ---------------------------------------------------------- | ---------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- |
| [get_trace](../src/tools/workflow-tools.ts#L3001) | The session trace, from tokens or from memory | { [session_index](../src/utils/session/params.ts#L10) } ∪ { [trace_tokens](../src/tools/workflow-tools.ts#L3001)?, [agent_id](../src/tools/workflow-tools.ts#L3001)? } | { [traceId](../src/tools/workflow-tools.ts#L3029), [source](../src/tools/workflow-tools.ts#L3029), [event_count](../src/tools/workflow-tools.ts#L3029), [events](../src/tools/workflow-tools.ts#L3023), [session_index](../src/tools/workflow-tools.ts#L3011) } ∪ { [token_errors](../src/tools/workflow-tools.ts#L3030)? } | [Execution trace](fidelity.md#layer-7-the-execution-trace)  |
| [record_usage](../src/tools/workflow-tools.ts#L2615) | Record one completed activity's token usage | { [session_index](../src/utils/session/params.ts#L10), [activity](../src/tools/workflow-tools.ts#L2615), [usage](../src/tools/workflow-tools.ts#L2615), [basis](../src/tools/workflow-tools.ts#L2615) } ∪ { [agent_id](../src/tools/workflow-tools.ts#L2615)? } | [status](../src/tools/workflow-tools.ts#L2661), [activity](../src/tools/workflow-tools.ts#L2653), [session_index](../src/tools/workflow-tools.ts#L2663), [usage_events](../src/tools/workflow-tools.ts#L2664) | [Token usage](delivery.md#reported-cost) |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*
