# Workflow Server IDE Setup

Paste the following into your IDE rules location:

```
For all workflow execution user requests use the workflow-server MCP server. Before use you *must* call get_activities to get the activity index.
```

## How It Works

1. **Get activities** - Call `get_activities` to get the activity index with `quick_match` patterns
2. **Match user goal** - Use `quick_match` patterns to identify the appropriate activity
3. **Load activity** - Call `get_activity { activity_id: "{id}" }` for detailed flow
4. **Load skill** - Call `get_skill { skill_id: "{skill}" }` referenced by the activity
5. **Execute** - Follow the skill's tool orchestration and workflow interpretation guidance

## Available Tools

| Tool | Purpose |
|------|---------|
| `get_activities` | Get activity index - primary entry point |
| `get_activity` | Get specific activity by ID |
| `list_skills` | List available skills |
| `get_skill` | Get specific skill by ID |
| `list_workflows` | List all workflows |
| `get_workflow` | Get workflow definition |
| `list_guides` | List guides for a workflow |
| `get_guide` | Get specific guide by index |
| `list_templates` | List templates for a workflow |
| `get_template` | Get specific template by index |
| `list_resources` | Discover all available resources |
