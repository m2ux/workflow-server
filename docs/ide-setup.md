# Workflow Server IDE Setup

Paste the following into your IDE rules location:

```
For all workflow execution user requests use the workflow-server MCP server. Before use you *must* call get_rules to load agent guidelines.
```

## How It Works

### Bootstrap Sequence

1. **Get rules** - Call `get_rules` to load agent guidelines
2. **Identify workflow** - Match user intent to workflow (or call `list_workflows` if unsure)
3. **Start workflow** - Call `nav_start { workflow_id: "{id}" }` to begin execution
4. **Follow navigation** - Execute actions from `availableActions` in response

### Available Workflows

| Workflow ID | Use When |
|-------------|----------|
| `work-package` | User mentions issue, ticket, PR, or implementation task |
| `work-packages` | User needs to plan multiple work packages |
| `meta` | Workflow management operations |

### Navigation Flow

```
nav_start → state token → nav_action → new state token → nav_action → ...
```

The server returns opaque state tokens that must be passed through without modification. Each response includes:
- **position**: Current location in workflow (activity, step)
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
| `list_workflows` | List available workflows (optional if workflow known) |
| `get_workflow` | Get specific workflow definition |

### Resource Tools

| Tool | Purpose |
|------|---------|
| `list_workflow_resources` | List resources for a workflow |
| `get_resource` | Get specific resource by index |

## Example Flow

```
User: "Start a new work package for issue #42"

Agent:
1. get_rules → Load guidelines
2. Recognize "work package" → workflow_id = "work-package"
3. nav_start { workflow_id: "work-package", initial_variables: { issue: 42 } }
4. Response shows:
   - position: { activity: "issue-management", step: "verify-issue" }
   - availableActions.required: [{ action: "complete_step", step: "verify-issue" }]
5. Execute step, then nav_action { state: "...", action: "complete_step", step_id: "verify-issue" }
6. Continue following navigation responses...
```
