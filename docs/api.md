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
| [health_check](../src/tools/workflow-tools.ts#L3017) | Server health                          | ∅ | [status](../src/tools/workflow-tools.ts#L3021), [server](../src/tools/workflow-tools.ts#L3022), [version](../src/tools/workflow-tools.ts#L3023), [workflows_available](../src/tools/workflow-tools.ts#L3024), [uptime_seconds](../src/tools/workflow-tools.ts#L3025), [repo_binding](../src/tools/workflow-tools.ts#L3026) | [HTTP endpoints](#http-endpoints)                                       |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*

### Session

Opening a run, and reading where that run stands.

| Tool                  | Purpose                                               | Parameters                                                                                                                                       | Returns                                                                                                       | Detail                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------ |
| [start_session](../src/tools/resource-tools.ts#L166) | Open or resume a top-level session | { [agent_id](../src/tools/resource-tools.ts#L191)?, [workflow_id](../src/tools/resource-tools.ts#L184)?, [working_directory](../src/tools/resource-tools.ts#L186)?, [planning_folder](../src/tools/resource-tools.ts#L185)?, [repo](../src/tools/resource-tools.ts#L187)?, [context_mode](../src/tools/resource-tools.ts#L192)?, [user_request](../src/tools/resource-tools.ts#L188)?, [target_workflow_id](../src/tools/resource-tools.ts#L189)?, [fresh](../src/tools/resource-tools.ts#L190)? } | { [session_index](../src/tools/resource-tools.ts#L585), [planning_slug](../src/tools/resource-tools.ts#L586), [planning_folder_path](../src/tools/resource-tools.ts#L590)?, [workflow](../src/tools/resource-tools.ts#L579) { [id](../src/tools/resource-tools.ts#L580), [version](../src/tools/resource-tools.ts#L581), [title](../src/tools/resource-tools.ts#L582), [description](../src/tools/resource-tools.ts#L583) }, [execution_path](../src/tools/resource-tools.ts#L600), [repo](../src/tools/resource-tools.ts#L593)?, [client](../src/tools/resource-tools.ts#L608)? } ⊕ { [decision](../src/tools/resource-tools.ts#L332) } | [Opening a session](state.md#opening-a-session)         |
| [dispatch_child](../src/tools/resource-tools.ts#L617) | Start a nested workflow under this session | { [session_index](../src/utils/session/params.ts#L10), [workflow_id](../src/tools/resource-tools.ts#L629) } ∪ { [agent_id](../src/tools/resource-tools.ts#L630)?, [planning_slug](../src/tools/resource-tools.ts#L631)?, [repo](../src/tools/resource-tools.ts#L632)?, [context_mode](../src/tools/resource-tools.ts#L633)? } | { [session_index](../src/tools/resource-tools.ts#L782), [workflow](../src/tools/resource-tools.ts#L782) { [id](../src/tools/resource-tools.ts#L782), [version](../src/tools/resource-tools.ts#L782), [initialActivity](../src/tools/resource-tools.ts#L782) }, [planning_folder_path](../src/tools/resource-tools.ts#L782), [execution_path](../src/tools/resource-tools.ts#L782) } ∪ { [planning_slug](../src/tools/resource-tools.ts#L782)? } | [Spawning the orchestrator](dispatch.md#spawning-the-orchestrator) |
| [get_workflow_status](../src/tools/workflow-tools.ts#L3033) | Where the session stands                              | { [session_index](../src/utils/session/params.ts#L10) } | [status](../src/tools/workflow-tools.ts#L3057), [in_flight](../src/tools/workflow-tools.ts#L3062), [completed_activities](../src/tools/workflow-tools.ts#L3063), [variables](../src/tools/workflow-tools.ts#L3066), [workflow](../src/tools/workflow-tools.ts#L3067), [last_checkpoint](../src/tools/workflow-tools.ts#L3075)? | [Polling](dispatch.md#polling-a-dispatched-workflow)               |
| [inspect_session](../src/tools/workflow-tools.ts#L3094) | Read session state. A checkpoint does not block it | { [session_index](../src/utils/session/params.ts#L10) } ∪ { [view](../src/tools/workflow-tools.ts#L3098)?, [child_index](../src/tools/workflow-tools.ts#L3100)?, [variable](../src/tools/workflow-tools.ts#L3102)?, [agent_id](../src/tools/workflow-tools.ts#L3104)? } | The [projection](../src/tools/workflow-tools.ts#L3118) named by view | [Persistence](state.md#persistence)                     |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*
### Workflow navigation

Moving through the workflow, and pausing when a person has to decide.

| Tool                 | Purpose                                                                     | Parameters                                                                 | Returns                                                                             | Detail                                                                                      |
| -------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [get_workflow](../src/tools/workflow-tools.ts#L841) | Load the session workflow | { [session_index](../src/utils/session/params.ts#L10) } | { technique bundle } ∪ { [id](../src/tools/workflow-tools.ts#L869), [version](../src/tools/workflow-tools.ts#L870), [title](../src/tools/workflow-tools.ts#L871), [description](../src/tools/workflow-tools.ts#L872), [rules](../src/tools/workflow-tools.ts#L873)?, [variables](../src/tools/workflow-tools.ts#L878)?, [initialActivity](../src/tools/workflow-tools.ts#L879), [graph](../src/tools/workflow-tools.ts#L882), [activities](../src/tools/workflow-tools.ts#L883), [activity_load_errors](../src/tools/workflow-tools.ts#L887)?, [session_index](../src/tools/workflow-tools.ts#L888), [planning_folder_path](../src/tools/workflow-tools.ts#L894) } | [Orchestrator bundle](delivery.md#orchestrator-bundle)                            |
| [next_activity](../src/tools/workflow-tools.ts#L1223) | Advance to the next activity. The body stays with get_activity | { [session_index](../src/utils/session/params.ts#L10), [activity_id](../src/tools/workflow-tools.ts#L1226) } ∪ { [from_activity](../src/tools/workflow-tools.ts#L1229)?, [exit](../src/tools/workflow-tools.ts#L1232)?, [step_manifest](../src/tools/workflow-tools.ts#L1233)?, [activity_manifest](../src/tools/workflow-tools.ts#L1234)?, [variables_changed](../src/tools/workflow-tools.ts#L1235)?, [artifacts_produced](../src/tools/workflow-tools.ts#L1236)?, [agent_id](../src/tools/workflow-tools.ts#L1237)?, [context_tokens](../src/tools/workflow-tools.ts#L1240)?, [progress_published](../src/tools/workflow-tools.ts#L1243)? } | { [activity_id](../src/tools/workflow-tools.ts#L1683), [session_index](../src/tools/workflow-tools.ts#L1687) } ∪ { [name](../src/tools/workflow-tools.ts#L1686) ⊕ [outstanding](../src/tools/workflow-tools.ts#L1685) } ∪ { [trace_token](../src/tools/workflow-tools.ts#L1665)? } | [Choosing the next activity](state.md#choosing-the-next-activity)          |
| [get_activity](../src/tools/workflow-tools.ts#L1696) | Load the activity this context was dispatched for | { [session_index](../src/utils/session/params.ts#L10), [context_tokens](../src/utils/session/params.ts#L29) } ∪ { [agent_id](../src/utils/session/params.ts#L49)?, [activity_id](../src/tools/workflow-tools.ts#L1709)?, [bundle](../src/tools/workflow-tools.ts#L1712)? } | { activity body, [exit_destinations](../src/tools/workflow-tools.ts#L253)?, [batch](../src/tools/workflow-tools.ts#L2347) } ∪ { [dispatch](../src/tools/workflow-tools.ts#L2354), [batch](../src/tools/workflow-tools.ts#L2354), [artifact_prefix](../src/tools/workflow-tools.ts#L2353), [artifacts](../src/tools/workflow-tools.ts#L2353), [exit_destinations](../src/tools/workflow-tools.ts#L2355)?, [fan_instance](../src/tools/workflow-tools.ts#L2356)? } | [Worker bundle](delivery.md#worker-bundle)                                        |
| [yield_checkpoint](../src/tools/workflow-tools.ts#L2413) | Yield a checkpoint, or replay one already answered | { [session_index](../src/utils/session/params.ts#L10), [checkpoint_id](../src/tools/workflow-tools.ts#L2416) } ∪ { [message](../src/tools/workflow-tools.ts#L2417)?, [options](../src/tools/workflow-tools.ts#L2418)?, [variables_changed](../src/tools/workflow-tools.ts#L2423)? } | { [status](../src/tools/workflow-tools.ts#L2564), [checkpoint_id](../src/tools/workflow-tools.ts#L2565), [session_index](../src/tools/workflow-tools.ts#L2566), [variables_published](../src/tools/workflow-tools.ts#L2567)? } ⊕ { [status](../src/tools/workflow-tools.ts#L2515), [checkpoint_id](../src/tools/workflow-tools.ts#L2516), [session_index](../src/tools/workflow-tools.ts#L2517), [resolved_option](../src/tools/workflow-tools.ts#L2518), [exit](../src/tools/workflow-tools.ts#L2519)?, [effect](../src/tools/workflow-tools.ts#L2525)? } | [The worker pauses](checkpoint.md#worker-pauses)                                  |
| [resume_checkpoint](../src/tools/workflow-tools.ts#L2636) | Continue after the checkpoint is resolved                                   | { [session_index](../src/utils/session/params.ts#L10) } | [status](../src/tools/workflow-tools.ts#L2672), [session_index](../src/tools/workflow-tools.ts#L2673), [checkpoint](../src/tools/workflow-tools.ts#L2674), [option_id](../src/tools/workflow-tools.ts#L2675), [variables_changed](../src/tools/workflow-tools.ts#L2676), [exit](../src/tools/workflow-tools.ts#L2677)? | [Resume protocol](checkpoint.md#resume-protocol)                                  |
| [present_checkpoint](../src/tools/workflow-tools.ts#L2689) | Load the active checkpoint for the user                                     | { [session_index](../src/utils/session/params.ts#L10) } | { [message](../src/tools/workflow-tools.ts#L2721), [options](../src/tools/workflow-tools.ts#L2730), [session_index](../src/tools/workflow-tools.ts#L2756) } | [Presenting and resolving](checkpoint.md#user-facing-agent-presents-and-resolves) |
| [respond_checkpoint](../src/tools/workflow-tools.ts#L2763) | Clear the active checkpoint                                                 | { [session_index](../src/utils/session/params.ts#L10) } ∪ { [option_id](../src/tools/workflow-tools.ts#L2769) ∪ { [reply](../src/tools/workflow-tools.ts#L2770)? } ⊕ [auto_advance](../src/tools/workflow-tools.ts#L2771) ⊕ [condition_not_met](../src/tools/workflow-tools.ts#L2772) } | { [checkpoint_id](../src/tools/workflow-tools.ts#L2941), [resolved](../src/tools/workflow-tools.ts#L2942), [session_index](../src/tools/workflow-tools.ts#L2943) } ∪ { [resolved_option](../src/tools/workflow-tools.ts#L2945)?, [effect](../src/tools/workflow-tools.ts#L2946)?, [dismissed](../src/tools/workflow-tools.ts#L2947)?, [exit](../src/tools/workflow-tools.ts#L2953)? } | [Three ways to resolve one](checkpoint.md#resolving-a-pause)                  |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*
### Techniques and resources

Loading one technique, or one piece of reference material.

| Tool            | Purpose                                                       | Parameters                                                                                    | Returns                                      | Detail                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [get_technique](../src/tools/resource-tools.ts#L836) | Load one technique on demand | { [session_index](../src/utils/session/params.ts#L10) } ∪ { [technique_id](../src/tools/resource-tools.ts#L844)?, [step_id](../src/tools/resource-tools.ts#L847)?, [activity_id](../src/tools/resource-tools.ts#L848)?, [agent_id](../src/utils/session/params.ts#L49)?, [bundle](../src/tools/resource-tools.ts#L849)?, [full](../src/tools/resource-tools.ts#L850)? } | { [composed technique](../src/tools/resource-tools.ts#L1095) } ⊕ { [unchanged marker](../src/tools/resource-tools.ts#L1057) } | [Asking for one by name](delivery.md#asking-for-one-technique-by-name)                      |
| [get_resource](../src/tools/resource-tools.ts#L1101) | Load a resource | { [session_index](../src/utils/session/params.ts#L10), [resource_id](../src/tools/resource-tools.ts#L1109) } ∪ { [agent_id](../src/utils/session/params.ts#L49)?, [bundle](../src/tools/resource-tools.ts#L1110)?, [full](../src/tools/resource-tools.ts#L1111)? } | { [resource body](../src/tools/resource-tools.ts#L1166) } ⊕ { [unchanged marker](../src/tools/resource-tools.ts#L1196) } | [Loading a resource](resolution.md#loading-a-resource-when-it-is-needed) |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*
### Trace and accounting

Reading what the run did, and recording what it cost.

| Tool           | Purpose                                                        | Parameters                                                 | Returns          | Detail                                                               |
| -------------- | ---------------------------------------------------------- | ---------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- |
| [get_trace](../src/tools/workflow-tools.ts#L2966) | The session trace, from tokens or from memory | { [session_index](../src/utils/session/params.ts#L10) } ∪ { [trace_tokens](../src/tools/workflow-tools.ts#L2969)?, [agent_id](../src/tools/workflow-tools.ts#L2970)? } | { [traceId](../src/tools/workflow-tools.ts#L2994), [source](../src/tools/workflow-tools.ts#L2994), [event_count](../src/tools/workflow-tools.ts#L2994), [events](../src/tools/workflow-tools.ts#L2994), [session_index](../src/tools/workflow-tools.ts#L2994) } ∪ { [token_errors](../src/tools/workflow-tools.ts#L2995)? } | [Execution trace](fidelity.md#layer-7-the-execution-trace)  |
| [record_usage](../src/tools/workflow-tools.ts#L2580) | Record one completed activity's token usage | { [session_index](../src/utils/session/params.ts#L10), [activity](../src/tools/workflow-tools.ts#L2583), [usage](../src/tools/workflow-tools.ts#L2584), [basis](../src/tools/workflow-tools.ts#L2589) } ∪ { [agent_id](../src/tools/workflow-tools.ts#L2596)? } | [status](../src/tools/workflow-tools.ts#L2626), [activity](../src/tools/workflow-tools.ts#L2627), [session_index](../src/tools/workflow-tools.ts#L2628), [usage_events](../src/tools/workflow-tools.ts#L2629) | [Token usage](delivery.md#reported-cost) |

> *`{ a, b }` always present. `a?` optional. `∪` add. `⊕` exactly one. `∅` none.*
