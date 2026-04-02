# Workflow Server IDE Setup

Paste the following into your IDE rules location:

```
For all workflow execution user requests, call the `discover` tool on the workflow-server MCP server to learn the bootstrap procedure.
```

## How It Works

1. **Discover** — Call `discover` to learn available workflows and the bootstrap procedure
2. **Match workflow** — Call `list_workflows` to match the user's goal to a workflow
3. **Start session** — Call `start_session(workflow_id)` to obtain a session token (workflow is bound to the session)
4. **Load skills** — Call `get_skills` to load behavioral protocols (session-protocol, agent-conduct)
5. **Load workflow** — Call `get_workflow(summary=true)` to get the activity list and `initialActivity`
6. **Load activity** — Call `next_activity(activity_id)` with `initialActivity` to load the first activity definition
7. **Execute steps** — For each step with a skill, call `get_skill(step_id)` to load the skill. Call `get_resource(resource_index)` for each `_resources` entry. Follow the skill's protocol.
8. **Transition** — Read `transitions` from the activity response to determine the next activity. Call `next_activity(activity_id)` with a `step_manifest` summarizing completed steps.

## Available Resources

| URI | Purpose |
|-----|---------|
| `workflow-server://schemas` | All TOON schema definitions (workflow, activity, condition, skill, state) |

## Available Tools

| Tool | Purpose |
|------|---------|
| `discover` | Entry point — returns available workflows and bootstrap procedure (no token required) |
| `list_workflows` | List all workflows with metadata (no token required) |
| `start_session` | Start session — returns session token and basic workflow metadata |
| `get_skills` | Load workflow-level behavioral protocols with `_resources` refs |
| `get_workflow` | Load workflow definition — `initialActivity`, rules, variables, activity list |
| `next_activity` | Transition to an activity — returns complete activity definition with steps, checkpoints, transitions |
| `get_skill` | Load the skill for a specific step within the current activity |
| `get_skill` | Load a single skill by ID |
| `get_resource` | Load a resource's full content by index (from `_resources` refs) |
| `get_checkpoint` | Load full checkpoint details for presentation |
| `get_trace` | Resolve trace tokens into execution event data |
| `save_state` / `restore_state` | Persist/restore workflow state (encrypts token at rest) |
| `health_check` | Server health (no token required) |
