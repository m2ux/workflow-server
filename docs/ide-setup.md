# Workflow Server IDE Setup

Paste the following into your IDE rules location:

```
For all workflow execution user requests use the workflow-server MCP server. Before use you *must*:
1. Fetch the `workflow-server://schemas` resource to load TOON schema definitions
2. Call the `get_rules` tool to load agent guidelines

CRITICAL: When following the workflow you *must* respect workflow fidelity as defined in the TOON files' semantics
```

## How It Works

1. **Fetch schemas** - Fetch `workflow-server://schemas` resource to load TOON schema definitions
2. **Get rules** - Call `get_rules` to load agent behavioral guidelines
3. **Get activities** - Call `get_activities` to get the activity index with `quick_match` patterns
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
| `get_rules` | Get agent behavioral guidelines |
| `get_activities` | Get activity index - primary entry point |
| `get_activity` | Get specific activity by ID |
| `list_skills` | List available skills |
| `get_skill` | Get specific skill by ID |
| `list_workflows` | List all workflows |
| `get_workflow` | Get workflow definition |
| `list_workflow_resources` | List resources for a workflow |
| `get_resource` | Get specific resource by index |
| `list_templates` | List templates for a workflow |
| `get_template` | Get specific template by index |
| `discover_resources` | Discover all available resources |
