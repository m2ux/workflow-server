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
| [schemasDir](../src/transports/http.ts#L107), [workspaceDir](../src/transports/http.ts#L103) | Both directories exist                                            | [Process](configuration.md#process), [root binding](configuration.md#root-binding) |
| [engineeringDir](../src/transports/http.ts#L112) | It exists, where the `--repo` layout splits it from the workspace | [Root binding](configuration.md#root-binding)                                      |
| [sessionKeyWritable](../src/transports/http.ts#L104) | The signing-key directory is usable                               | [Signing key](configuration.md#signing-key)                                        |
| [corpusServes](../src/transports/http.ts#L110) | The mounted corpus holds at least one workflow                    | [Process](configuration.md#process)                                                |



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
| [discover](../src/tools/workflow-tools.ts#L813) | Entry point, before any other tool | ∅ | Server info and a bootstrap stub              | [Verify](setup.md#3-verify)                                             |
| [list_workflows](../src/tools/workflow-tools.ts#L831) | The catalog of available workflows     | ∅ | [ { [id](../src/loaders/workflow-loader.ts#L441), [title](../src/loaders/workflow-loader.ts#L441), [version](../src/loaders/workflow-loader.ts#L441), [tags](../src/loaders/workflow-loader.ts#L441)? } ] ⊕ { workflows, [load_errors](../src/tools/workflow-tools.ts#L835) } | [What a namespace is](resolution.md#what-a-namespace-is) |
| [health_check](../src/tools/workflow-tools.ts#L3037) | Server health                          | ∅ | [status](../src/tools/workflow-tools.ts#L3037), [server](../src/tools/workflow-tools.ts#L3037), [version](../src/tools/workflow-tools.ts#L3037), [workflows_available](../src/tools/workflow-tools.ts#L3044), [uptime_seconds](../src/tools/workflow-tools.ts#L3045), [repo_binding](../src/tools/workflow-tools.ts#L3046) | [HTTP endpoints](#http-endpoints)                                       |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*

### Session

Opening a run, and reading where that run stands.

| Tool                  | Purpose                                               | Parameters                                                                                                                                       | Returns                                                                                                       | Detail                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------ |
| [start_session](../src/tools/resource-tools.ts#L182) | Open or resume a top-level session | { [agent_id](../src/tools/resource-tools.ts#L209)?, [workflow_id](../src/tools/resource-tools.ts#L201)?, [working_directory](../src/tools/resource-tools.ts#L205)?, [planning_folder](../src/tools/resource-tools.ts#L203)?, [planning_slug](../src/tools/resource-tools.ts#L203)?, [repo](../src/tools/resource-tools.ts#L205)?, [context_mode](../src/tools/resource-tools.ts#L210)?, [user_request](../src/tools/resource-tools.ts#L206)?, [target_workflow_id](../src/tools/resource-tools.ts#L207)?, [fresh](../src/tools/resource-tools.ts#L208)? } | { [session_index](../src/tools/resource-tools.ts#L599), [planning_slug](../src/tools/resource-tools.ts#L606), [resumed](../src/tools/resource-tools.ts#L607), [planning_folder_path](../src/tools/resource-tools.ts#L611)?, [workflow](../src/tools/resource-tools.ts#L590) { [id](../src/tools/resource-tools.ts#L590), [version](../src/tools/resource-tools.ts#L591), [title](../src/tools/resource-tools.ts#L592), [description](../src/tools/resource-tools.ts#L593) }, [execution_path](../src/tools/resource-tools.ts#L616), [repo](../src/tools/resource-tools.ts#L614)?, [client](../src/tools/resource-tools.ts#L629)? } ⊕ { [decision](../src/tools/resource-tools.ts#L371) } | [Opening a session](state.md#opening-a-session)         |
| [dispatch_child](../src/tools/resource-tools.ts#L639) | Start a nested workflow under this session | { [session_index](../src/utils/session/params.ts#L10), [workflow_id](../src/tools/resource-tools.ts#L649) } ∪ { [agent_id](../src/tools/resource-tools.ts#L650)?, [repo](../src/tools/resource-tools.ts#L644)?, [context_mode](../src/tools/resource-tools.ts#L646)? } | { [session_index](../src/tools/resource-tools.ts#L743), [workflow](../src/tools/resource-tools.ts#L743) { [id](../src/tools/resource-tools.ts#L743), [version](../src/tools/resource-tools.ts#L743), [initialActivity](../src/tools/resource-tools.ts#L743) }, [planning_folder_path](../src/tools/resource-tools.ts#L743), [execution_path](../src/tools/resource-tools.ts#L743) } | [Spawning the orchestrator](dispatch.md#spawning-the-orchestrator) |
| [get_workflow_status](../src/tools/workflow-tools.ts#L3053) | Where the session stands                              | { [session_index](../src/utils/session/params.ts#L10) } | [status](../src/tools/workflow-tools.ts#L3068), [in_flight](../src/tools/workflow-tools.ts#L3082), [completed_activities](../src/tools/workflow-tools.ts#L3083), [variables](../src/tools/workflow-tools.ts#L3086), [workflow](../src/tools/workflow-tools.ts#L3066), [last_checkpoint](../src/tools/workflow-tools.ts#L3095)? | [Polling](dispatch.md#polling-a-dispatched-workflow)               |
| [inspect_session](../src/tools/workflow-tools.ts#L3114) | Read session state. A checkpoint does not block it | { [session_index](../src/utils/session/params.ts#L10) } ∪ { [view](../src/tools/workflow-tools.ts#L3118)?, [child_index](../src/tools/workflow-tools.ts#L3120)?, [variable](../src/tools/workflow-tools.ts#L3122)?, [agent_id](../src/tools/workflow-tools.ts#L3124)? } | The [projection](../src/tools/workflow-tools.ts#L3138) named by view | [Persistence](state.md#persistence)                     |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*
### Workflow navigation

Moving through the workflow, and pausing when a person has to decide.

| Tool                 | Purpose                                                                     | Parameters                                                                 | Returns                                                                             | Detail                                                                                      |
| -------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [get_workflow](../src/tools/workflow-tools.ts#L839) | Load the session workflow | { [session_index](../src/utils/session/params.ts#L10) } | { technique bundle } ∪ { [id](../src/tools/workflow-tools.ts#L867), [version](../src/tools/workflow-tools.ts#L868), [title](../src/tools/workflow-tools.ts#L869), [description](../src/tools/workflow-tools.ts#L870), [rules](../src/tools/workflow-tools.ts#L871)?, [variables](../src/tools/workflow-tools.ts#L876)?, [initialActivity](../src/tools/workflow-tools.ts#L877), [graph](../src/tools/workflow-tools.ts#L880), [activities](../src/tools/workflow-tools.ts#L881), [activity_load_errors](../src/tools/workflow-tools.ts#L885)?, [session_index](../src/tools/workflow-tools.ts#L886), [planning_folder_path](../src/tools/workflow-tools.ts#L890) } | [Orchestrator bundle](delivery.md#orchestrator-bundle)                            |
| [next_activity](../src/tools/workflow-tools.ts#L1206) | Advance to the next activity. The body stays with get_activity | { [session_index](../src/utils/session/params.ts#L10), [activity_id](../src/tools/workflow-tools.ts#L1209) } ∪ { [from_activity](../src/tools/workflow-tools.ts#L1210)?, [exit](../src/tools/workflow-tools.ts#L1213)?, [step_manifest](../src/tools/workflow-tools.ts#L1216)?, [activity_manifest](../src/tools/workflow-tools.ts#L1217)?, [variables_changed](../src/tools/workflow-tools.ts#L1218)?, [artifacts_produced](../src/tools/workflow-tools.ts#L1219)?, [agent_id](../src/tools/workflow-tools.ts#L1220)?, [context_tokens](../src/tools/workflow-tools.ts#L1223)?, [progress_published](../src/tools/workflow-tools.ts#L1226)? } | { [activity_id](../src/tools/workflow-tools.ts#L1700), [session_index](../src/tools/workflow-tools.ts#L1707) } ∪ { [name](../src/tools/workflow-tools.ts#L1697) ⊕ [outstanding](../src/tools/workflow-tools.ts#L1702) } ∪ { [trace_token](../src/tools/workflow-tools.ts#L1682)? } | [Choosing the next activity](state.md#choosing-the-next-activity)          |
| [get_activity](../src/tools/workflow-tools.ts#L1716) | Load the activity this context was dispatched for | { [session_index](../src/utils/session/params.ts#L10), [context_tokens](../src/utils/session/params.ts#L29) } ∪ { [agent_id](../src/utils/session/params.ts#L49)?, [activity_id](../src/tools/workflow-tools.ts#L1716)?, [bundle](../src/tools/workflow-tools.ts#L1716)? } | { activity body, [exit_destinations](../src/tools/workflow-tools.ts#L251)?, [batch](../src/tools/workflow-tools.ts#L2354) } ∪ { [dispatch](../src/tools/workflow-tools.ts#L2374), [batch](../src/tools/workflow-tools.ts#L2367), [artifact_prefix](../src/tools/workflow-tools.ts#L2373), [artifacts](../src/tools/workflow-tools.ts#L2373), [exit_destinations](../src/tools/workflow-tools.ts#L2375)?, [fan_instance](../src/tools/workflow-tools.ts#L2376)? } | [Worker bundle](delivery.md#worker-bundle)                                        |
| [yield_checkpoint](../src/tools/workflow-tools.ts#L2433) | Yield a checkpoint, or replay one already answered | { [session_index](../src/utils/session/params.ts#L10), [checkpoint_id](../src/tools/workflow-tools.ts#L2436) } ∪ { [message](../src/tools/workflow-tools.ts#L2433)?, [options](../src/tools/workflow-tools.ts#L2433)?, [variables_changed](../src/tools/workflow-tools.ts#L2443)? } | { [status](../src/tools/workflow-tools.ts#L2584), [checkpoint_id](../src/tools/workflow-tools.ts#L2572), [session_index](../src/tools/workflow-tools.ts#L2578), [variables_published](../src/tools/workflow-tools.ts#L2587)? } ⊕ { [status](../src/tools/workflow-tools.ts#L2535), [checkpoint_id](../src/tools/workflow-tools.ts#L2528), [session_index](../src/tools/workflow-tools.ts#L2537), [resolved_option](../src/tools/workflow-tools.ts#L2538), [exit](../src/tools/workflow-tools.ts#L2519)?, [effect](../src/tools/workflow-tools.ts#L2540)? } | [The worker pauses](checkpoint.md#worker-pauses)                                  |
| [resume_checkpoint](../src/tools/workflow-tools.ts#L2656) | Continue after the checkpoint is resolved                                   | { [session_index](../src/utils/session/params.ts#L10) } | [status](../src/tools/workflow-tools.ts#L2692), [session_index](../src/tools/workflow-tools.ts#L2693), [checkpoint](../src/tools/workflow-tools.ts#L2676), [option_id](../src/tools/workflow-tools.ts#L2695), [variables_changed](../src/tools/workflow-tools.ts#L2696), [exit](../src/tools/workflow-tools.ts#L2685)? | [Resume protocol](checkpoint.md#resume-protocol)                                  |
| [present_checkpoint](../src/tools/workflow-tools.ts#L2709) | Load the active checkpoint for the user                                     | { [session_index](../src/utils/session/params.ts#L10) } | { [message](../src/tools/workflow-tools.ts#L2741), [options](../src/tools/workflow-tools.ts#L2748), [session_index](../src/tools/workflow-tools.ts#L2772) } | [Presenting and resolving](checkpoint.md#user-facing-agent-presents-and-resolves) |
| [respond_checkpoint](../src/tools/workflow-tools.ts#L2783) | Clear the active checkpoint                                                 | { [session_index](../src/utils/session/params.ts#L10) } ∪ { [option_id](../src/tools/workflow-tools.ts#L2785) ∪ { [reply](../src/tools/workflow-tools.ts#L2786)? } ⊕ [auto_advance](../src/tools/workflow-tools.ts#L2785) ⊕ [condition_not_met](../src/tools/workflow-tools.ts#L2785) } | { [checkpoint_id](../src/tools/workflow-tools.ts#L2951), [resolved](../src/tools/workflow-tools.ts#L2962), [session_index](../src/tools/workflow-tools.ts#L2951) } ∪ { [resolved_option](../src/tools/workflow-tools.ts#L2965)?, [effect](../src/tools/workflow-tools.ts#L2966)?, [dismissed](../src/tools/workflow-tools.ts#L2967)?, [exit](../src/tools/workflow-tools.ts#L2968)? } | [Three ways to resolve one](checkpoint.md#resolving-a-pause)                  |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*
### Techniques and resources

Loading one technique, or one piece of reference material.

| Tool            | Purpose                                                       | Parameters                                                                                    | Returns                                      | Detail                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [get_technique](../src/tools/resource-tools.ts#L752) | Load one technique on demand | { [session_index](../src/utils/session/params.ts#L10) } ∪ { [technique_id](../src/tools/resource-tools.ts#L753)?, [step_id](../src/tools/resource-tools.ts#L760)?, [activity_id](../src/tools/resource-tools.ts#L763)?, [agent_id](../src/utils/session/params.ts#L49)?, [bundle](../src/tools/resource-tools.ts#L764)?, [full](../src/tools/resource-tools.ts#L764)? } | { [composed technique](../src/tools/resource-tools.ts#L1122) } ⊕ { [unchanged marker](../src/tools/resource-tools.ts#L1084) } | [Asking for one by name](delivery.md#asking-for-one-technique-by-name)                      |
| [get_resource](../src/tools/resource-tools.ts#L1017) | Load a resource | { [session_index](../src/utils/session/params.ts#L10), [resource_id](../src/tools/resource-tools.ts#L1024) } ∪ { [agent_id](../src/utils/session/params.ts#L49)?, [bundle](../src/tools/resource-tools.ts#L1019)?, [full](../src/tools/resource-tools.ts#L1019)? } | { [resource body](../src/tools/resource-tools.ts#L1193) } ⊕ { [unchanged marker](../src/tools/resource-tools.ts#L1223) } | [Loading a resource](resolution.md#loading-a-resource-when-it-is-needed) |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*
### Trace and accounting

Reading what the run did, and recording what it cost.

| Tool           | Purpose                                                        | Parameters                                                 | Returns          | Detail                                                               |
| -------------- | ---------------------------------------------------------- | ---------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- |
| [get_trace](../src/tools/workflow-tools.ts#L2986) | The session trace, from tokens or from memory | { [session_index](../src/utils/session/params.ts#L10) } ∪ { [trace_tokens](../src/tools/workflow-tools.ts#L2986)?, [agent_id](../src/tools/workflow-tools.ts#L2986)? } | { [traceId](../src/tools/workflow-tools.ts#L3014), [source](../src/tools/workflow-tools.ts#L3014), [event_count](../src/tools/workflow-tools.ts#L3014), [events](../src/tools/workflow-tools.ts#L3008), [session_index](../src/tools/workflow-tools.ts#L2994) } ∪ { [token_errors](../src/tools/workflow-tools.ts#L3015)? } | [Execution trace](fidelity.md#layer-7-the-execution-trace)  |
| [record_usage](../src/tools/workflow-tools.ts#L2600) | Record one completed activity's token usage | { [session_index](../src/utils/session/params.ts#L10), [activity](../src/tools/workflow-tools.ts#L2600), [usage](../src/tools/workflow-tools.ts#L2600), [basis](../src/tools/workflow-tools.ts#L2600) } ∪ { [agent_id](../src/tools/workflow-tools.ts#L2600)? } | [status](../src/tools/workflow-tools.ts#L2646), [activity](../src/tools/workflow-tools.ts#L2638), [session_index](../src/tools/workflow-tools.ts#L2648), [usage_events](../src/tools/workflow-tools.ts#L2649) | [Token usage](delivery.md#reported-cost) |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*
