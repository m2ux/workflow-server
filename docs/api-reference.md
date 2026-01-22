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
| `get_skills` | - | Get skill index - summary of all skills with capabilities |
| `list_skills` | `workflow_id?` | List all skills (universal + workflow-specific if workflow_id provided) |
| `get_skill` | `skill_id`, `workflow_id?` | Get a skill (checks workflow-specific first, then universal) |

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

Skills provide structured guidance for agents to consistently execute workflows. Skills can be **universal** (apply globally) or **workflow-specific**.

### Universal Skills

Universal skills are stored in the `meta` workflow and apply to all workflows.

| Skill | Location | Description |
|-------|----------|-------------|
| `intent-resolution` | `meta/skills/` | Bootstraps agent interaction by resolving user goals to intents and loading appropriate skills |
| `workflow-execution` | `meta/skills/` | Guides agents through workflow execution with tool orchestration, state management, and error recovery |

### Workflow-Specific Skills

Workflow-specific skills are stored in each workflow's `skills/` directory. Currently no workflow-specific skills are defined.

### The Meta Workflow

The `meta` workflow is the bootstrap workflow for the workflow-server. It contains:
- **Intents** (`meta/intents/`): All user intents for workflow operations
- **Universal skills** (`meta/skills/`): Skills that apply to all workflows

### Skill Resolution

When calling `get_skill { skill_id, workflow_id }`:
1. First checks `{workflow_id}/skills/{NN}-{skill_id}.toon`
2. Falls back to `meta/skills/{NN}-{skill_id}.toon` (universal)

All skills use NN- indexed filenames (e.g., `00-intent-resolution.toon`, `01-workflow-execution.toon`).

### Skill Contents

Each skill provides:

- **Execution pattern** - Tool sequence for workflow stages
- **Tool guidance** - When to use each tool, parameters, what to preserve
- **State management** - What to track in memory during execution
- **Interpretation rules** - How to evaluate transitions, checkpoints, decisions
- **Error recovery** - Common error scenarios and recovery patterns

#### workflow-execution (universal)

Primary skill for workflow navigation:
- **Start**: `list_workflows` → `get_workflow` → `list_guides`
- **Per-phase**: `get_phase` → `get_checkpoint` → `get_guide`
- **Transitions**: `validate_transition`
- **Artifacts**: `list_templates` → `get_template`

#### intent-resolution (universal)

Bootstrap skill for agent initialization:
- **Bootstrap**: `get_intents` → `get_intent`
- **Skill loading**: `get_skill`
- **Discovery**: `list_resources`

## Available Workflows

| Workflow | Phases | Description |
|----------|--------|-------------|
| `meta` | 2 | Bootstrap workflow - manages intents and universal skills |
| `work-package` | 11 | Full work package lifecycle from issue to PR |
