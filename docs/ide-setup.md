# Workflow Server IDE Setup

Paste the following into your IDE rules location:

```
For all workflow execution user requests, call the `help` tool on the workflow-server MCP server to learn the bootstrap procedure.
```

## How It Works

1. **Call help** - Learn the bootstrap procedure and session protocol
2. **Discover workflows** - Call `list_workflows` to see available workflows and match the user's goal
3. **Start session** - Call `start_session(workflow_id)` to load agent rules and obtain an opaque session token
4. **Load workflow** - Call `get_workflow(workflow_id)` for the full definition
5. **Load activity** - Call `get_activity(workflow_id, activity_id)` for detailed flow
6. **Load skill** - Call `get_skill(workflow_id, skill_id)` referenced by the activity
7. **Execute** - Follow the skill's tool orchestration guidance. Pass `session_token` and explicit `workflow_id`/`activity_id` to every call. Use the updated token from `_meta.session_token`. Check `_meta.validation` for warnings.

## Available Resources

| URI | Purpose |
|-----|---------|
| `workflow-server://schemas` | All TOON schema definitions (workflow, activity, condition, skill, state) |

## Available Tools

| Tool | Purpose |
|------|---------|
| `help` | Bootstrap procedure and session protocol (no token required) |
| `list_workflows` | List all workflows (no token required) |
| `start_session` | Start session — returns rules, workflow metadata, and opaque token |
| `get_workflow` | Get workflow definition (use summary=true for lightweight metadata) |
| `get_activity` | Get activity details |
| `next_activity` | Get possible next activities with transition conditions |
| `get_checkpoint` | Get checkpoint details |
| `get_skills` | Get all skills and their referenced resources for an activity in one call |
| `get_skill` | Get a single skill with its referenced resources attached |
| `save_state` / `restore_state` | Persist/restore workflow state (encrypts token at rest) |
| `health_check` | Server health (no token required) |
