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
2. **Start session** - Call `start_session` to load agent behavioral guidelines and obtain a session token
3. **Match goal** - Call `match_goal` to get the activity index with `quick_match` patterns
4. **Match user goal** - Use `quick_match` patterns to identify the appropriate activity
5. **Load activity** - Call `get_activity { activity_id: "{id}" }` for detailed flow
6. **Load skill** - Call `get_skill { skill_id: "{skill}" }` referenced by the activity
7. **Execute** - Follow the skill's tool orchestration and workflow interpretation guidance

## Available Resources

| URI | Purpose |
|-----|---------|
| `workflow-server://schemas` | All TOON schema definitions (workflow, activity, condition, skill, state) |

## Available Tools

| Tool | Purpose |
|------|---------|
| `start_session` | Start session — returns agent guidelines and session token |
| `match_goal` | Match user goal to a workflow via activity index |
| `get_activity` | Get specific activity by ID |
| `list_skills` | List available skills |
| `get_skill` | Get specific skill by ID |
| `list_workflows` | List all workflows |
| `get_workflow` | Get workflow definition |
| `list_workflow_resources` | List resources for a workflow |
| `get_resource` | Get specific resource by index |
| `discover_resources` | Discover all available resources |
