# Workflow Server IDE Setup

Paste the following into your IDE rules location:

```
For all workflow execution user requests use the workflow-server MCP server. Before use you *must* call get_rules to load agent guidelines, then call get_activities to get the activity index.
```

## How It Works

### Bootstrap Sequence

1. **Get rules** - Call `get_rules` to load agent guidelines including navigation API and delegation rules
2. **Get activities** - Call `get_activities` to get activity index with `quick_match` patterns
3. **Match user goal** - Use `quick_match` patterns to identify the appropriate activity
4. **Start workflow** - Call `nav_start { workflow_id: "{id}" }` to begin execution
5. **Follow navigation** - Execute actions from `availableActions` in response

### Navigation Flow

```
nav_start → state token → nav_action → new state token → nav_action → ...
```

The server returns opaque state tokens that must be passed through without modification. Each response includes:
- **position**: Current location in workflow
- **availableActions**: What you can do next (required/optional/blocked)
- **checkpoint**: Blocking decision point requiring response
- **state**: Token to pass to next action

### Effectivity Delegation

When actions include an `effectivities` array:
1. Check if you have the required effectivity
2. If not, look up agent in `.engineering/agents/*.toml`
3. Spawn sub-agent with configuration from registry
4. Pass step description and context
5. Receive result and call `nav_action` to advance

## Available Tools

### Navigation Tools (Primary)

| Tool | Purpose |
|------|---------|
| `nav_start` | Start workflow execution, returns initial situation |
| `nav_situation` | Get current position and available actions |
| `nav_action` | Execute an action (complete_step, respond_to_checkpoint, transition) |
| `nav_checkpoint` | Get details of active checkpoint |

### Discovery Tools

| Tool | Purpose |
|------|---------|
| `get_rules` | **Bootstrap entry point** - Load agent guidelines |
| `get_activities` | Get activity index with quick_match patterns |
| `get_activity` | Get specific activity by ID |
| `get_skills` | Get skill index |
| `get_skill` | Get specific skill by ID |

### Workflow Tools

| Tool | Purpose |
|------|---------|
| `list_workflows` | List all workflows |
| `get_workflow` | Get workflow definition |
| `list_workflow_resources` | List resources for a workflow |
| `get_resource` | Get specific resource by index |

## Example Flow

```
User: "Start a new work package for issue #42"

Agent:
1. get_rules → Load guidelines
2. get_activities → Find "work-package" activity
3. nav_start { workflow_id: "work-package", initial_variables: { issue: 42 } }
4. Response shows:
   - position: { activity: "issue-management", step: "verify-issue" }
   - availableActions.required: [{ action: "complete_step", step: "verify-issue" }]
5. Execute step, then nav_action { state: "...", action: "complete_step", step_id: "verify-issue" }
6. Continue following navigation responses...
```
