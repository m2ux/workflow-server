# API Reference

## MCP Tools

| Tool | Description |
|------|-------------|
| `list_workflows` | List all available workflow definitions with metadata |
| `get_workflow` | Get complete workflow definition by ID |
| `get_phase` | Get details of a specific phase within a workflow |
| `get_checkpoint` | Get checkpoint details including options and effects |
| `validate_transition` | Validate if a transition between phases is allowed |
| `health_check` | Check server health and available workflows |

## MCP Resources

| Resource | Description |
|----------|-------------|
| `workflow://intents` | Intent index - primary entry point for agents |
| `workflow://intents/{id}` | Get a specific workflow intent |
| `workflow://skills` | List all available workflow execution skills |
| `workflow://skills/{id}` | Get a specific workflow execution skill |
| `workflow://guides` | List all available guide documents |
| `workflow://guides/{name}` | Get content of a specific guide |

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
