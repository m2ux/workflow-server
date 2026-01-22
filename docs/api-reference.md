# API Reference

## MCP Tools

### Workflow Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `list_workflows` | - | List all available workflow definitions with metadata |
| `get_workflow` | `workflow_id` | Get complete workflow definition by ID |
| `get_phase` | `workflow_id`, `phase_id` | Get details of a specific phase within a workflow |
| `get_checkpoint` | `workflow_id`, `phase_id`, `checkpoint_id` | Get checkpoint details including options and effects |
| `validate_transition` | `workflow_id`, `from_phase`, `to_phase` | Validate if a transition between phases is allowed |
| `health_check` | - | Check server health and available workflows |

### Intent Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `get_intents` | - | Get intent index - primary entry point for agents |
| `get_intent` | `intent_id` | Get a specific workflow intent |

### Skill Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `list_skills` | - | List all available workflow execution skills |
| `get_skill` | `skill_id` | Get a specific workflow execution skill |

### Guide Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `list_guides` | `workflow_id` | List all guides for a workflow |
| `get_guide` | `workflow_id`, `index` | Get content of a specific guide by index |

### Template Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `list_templates` | `workflow_id` | List all templates for a workflow |
| `get_template` | `workflow_id`, `index` | Get content of a specific template by index |

### Discovery Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `list_resources` | - | Discover all available resources |

## Intents

Intents define user goals and map them to skills. They are the primary entry point for agent interaction.

| Intent | Problem | Primary Skill |
|--------|---------|---------------|
| `start-workflow` | Begin executing a new workflow | `workflow-execution` |
| `resume-workflow` | Continue a previously started workflow | `workflow-execution` |
| `end-workflow` | Complete and finalize a workflow | `workflow-execution` |

## Skills

Skills provide structured guidance for agents to consistently execute workflows.

| Skill | Description |
|-------|-------------|
| `workflow-execution` | Guides agents through workflow execution with tool orchestration, state management, and error recovery |

### Skill Contents

The `workflow-execution` skill provides:

- **Execution pattern** - Tool sequence for workflow stages (start, per-phase, transitions)
- **Tool guidance** - When to use each tool, what to preserve from results
- **State management** - What to track in memory during execution
- **Interpretation rules** - How to evaluate transitions, checkpoints, decisions
- **Error recovery** - Common error scenarios and recovery patterns

## Available Workflows

| Workflow | Phases | Description |
|----------|--------|-------------|
| `work-package` | 11 | Full work package lifecycle from issue to PR |
| `example-workflow` | 3 | Example demonstrating schema features |
