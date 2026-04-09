---
id: workflow-server-tools
version: 1.0.0
---

# Workflow Server MCP Tool Reference

Complete reference for the workflow-server MCP server tools used to manage workflow sessions, progress through activities, and load resources.

## Bootstrap Tools

These tools do not require a session token.

| Tool | When | Key Params | Returns |
|------|------|------------|---------|
| `discover` | First action to learn server usage and available workflows | none | Server info and bootstrap procedure |
| `list_workflows` | Matching user goal to a workflow | none | Available workflows |
| `health_check` | Verify server availability | none | Server status |

## Session & Navigation Tools

All of these tools require the `session_token` parameter, which encodes the current state and identity of the session.

| Tool | When | Key Params | Returns |
|------|------|------------|---------|
| `start_session` | First action on initial dispatch to start or inherit a session | `workflow_id`, optional `session_token` (from orchestrator), optional `agent_id` | Initial `session_token` and metadata |
| `get_workflow` | After `start_session` to load workflow structure | `session_token`, optional `summary` | Workflow details including `initialActivity` |
| `next_activity` | Transitioning to the first or next activity | `session_token`, `activity_id` (MUST use `initialActivity` ID from `get_workflow` on first call; transitions for subsequent calls), optional `step_manifest`, optional `transition_condition` | Activity definition, trace token, embedded checkpoints |
| `get_checkpoint` | Presenting a checkpoint to the user | `session_token`, `activity_id`, `checkpoint_id` | Checkpoint options and details |
| `respond_checkpoint` | Resolving a blocking or conditional checkpoint | `session_token`, `checkpoint_id`, optional `option_id`, optional `auto_advance`, optional `condition_not_met` | Effects, remaining checkpoints, updated token |
| `get_trace` | After each activity to resolve trace tokens | `session_token`, optional `trace_tokens` | Resolved mechanical trace events |

## Skill & Resource Loading Tools

| Tool | When | Key Params | Returns |
|------|------|------------|---------|
| `get_skills` | Session bootstrap to load workflow-level behavioral protocols | `session_token` | Universal and workflow-level skills |
| `get_skill` | Before executing a step that declares a skill | `session_token`, `step_id` | Skill details and resource references |
| `get_resource` | Loading content for entries in `_resources` | `session_token`, `resource_index` | Full resource text content |
