# Workflow Server IDE Setup

Paste the following into your IDE rules location:

```
For all workflow execution user requests use the workflow-server MCP server. Before use you *must*:
1. Fetch the `workflow-server://schemas` resource to load TOON schema definitions
2. Call the `start_session` tool to load agent guidelines and obtain a session token

CRITICAL: When following the workflow you *must* respect workflow fidelity as defined in the TOON files' semantics
```

## How It Works

1. **Fetch schemas** - Fetch `workflow-server://schemas` resource to load TOON schema definitions
2. **Discover workflows** - Call `list_workflows` to see available workflows and match the user's goal
3. **Start session** - Call `start_session(workflow_id)` to load agent rules and obtain an opaque session token
4. **Load workflow** - Call `get_workflow` (workflow_id from token) for the full definition
5. **Load activity** - Call `get_workflow_activity { activity_id }` for detailed flow
6. **Load skill** - Call `get_skill { skill_id }` referenced by the activity
7. **Execute** - Follow the skill's tool orchestration and workflow interpretation guidance. Pass `session_token` to every call and use the updated token from `_meta.session_token`

## Available Resources

| URI | Purpose |
|-----|---------|
| `workflow-server://schemas` | All TOON schema definitions (workflow, activity, condition, skill, state) |

## Available Tools

| Tool | Purpose |
|------|---------|
| `list_workflows` | List all workflows (no token required) |
| `start_session` | Start session — returns rules, workflow metadata, and opaque token |
| `get_workflow` | Get workflow definition (workflow_id from token) |
| `get_workflow_activity` | Get activity details and update session activity |
| `get_checkpoint` | Get checkpoint details (activity from token) |
| `validate_transition` | Check if a transition is allowed |
| `get_skill` | Get specific skill (workflow from token) |
| `list_skills` | List skills for session workflow |
| `list_workflow_resources` | List resources for session workflow |
| `get_resource` | Get specific resource by index |
| `discover_resources` | Discover all available resources |
| `save_state` / `restore_state` | Persist/restore workflow state (encrypts token at rest) |
| `health_check` | Server health (no token required) |
