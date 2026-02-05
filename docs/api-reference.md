# API Reference

## MCP Tools

### Workflow Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `list_workflows` | - | List all available workflow definitions with metadata |
| `get_workflow` | `workflow_id` | Get complete workflow definition by ID |
| `get_workflow_activity` | `workflow_id`, `activity_id` | Get details of a specific activity within a workflow |
| `get_checkpoint` | `workflow_id`, `activity_id`, `checkpoint_id` | Get checkpoint details including options and effects |
| `validate_transition` | `workflow_id`, `from_activity`, `to_activity` | Validate if a transition between activities is allowed |
| `health_check` | - | Check server health and available workflows |

### Activity Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `get_activities` | - | Get activity index - primary entry point for agents |
| `get_activity` | `activity_id` | Get a specific workflow activity |

### Rules Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `get_rules` | - | Get global agent rules - behavioral guidelines for workflow execution |

### Skill Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `get_skills` | - | Get skill index - summary of all skills with capabilities |
| `list_skills` | `workflow_id?` | List all skills (universal + workflow-specific if workflow_id provided) |
| `get_skill` | `skill_id`, `workflow_id?` | Get a skill (checks workflow-specific first, then universal) |

### Resource Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `list_workflow_resources` | `workflow_id` | List all resources for a workflow |
| `get_resource` | `workflow_id`, `index` | Get content of a specific resource by index |

### Discovery Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `discover_resources` | - | Discover all available resources: workflows, resources, activities, skills |

## Activities

Activities define user goals and map them to skills. They are the primary entry point for agent interaction.

| Activity | Problem | Primary Skill |
|----------|---------|---------------|
| `start-workflow` | Begin executing a new workflow | `workflow-execution` |
| `resume-workflow` | Continue a previously started workflow | `workflow-execution` |
| `end-workflow` | Complete and finalize a workflow | `workflow-execution` |

## Skills

Skills provide structured guidance for agents to consistently execute workflows. Skills can be **universal** (apply globally) or **workflow-specific**.

### Universal Skills

Universal skills are stored in the `meta` workflow and apply to all workflows.

| Skill | Location | Description |
|-------|----------|-------------|
| `activity-resolution` | `meta/skills/` | Bootstraps agent interaction by resolving user goals to activities and loading appropriate skills |
| `workflow-execution` | `meta/skills/` | Guides agents through workflow execution with tool orchestration, state management, and error recovery |

### Workflow-Specific Skills

Workflow-specific skills are stored in each workflow's `skills/` directory. Currently no workflow-specific skills are defined.

### The Meta Workflow

The `meta` workflow is the bootstrap workflow for the workflow-server. It contains:
- **Activities** (`meta/activities/`): All user activities for workflow operations
- **Universal skills** (`meta/skills/`): Skills that apply to all workflows

### Skill Resolution

When calling `get_skill { skill_id, workflow_id }`:
1. First checks `{workflow_id}/skills/{NN}-{skill_id}.toon`
2. Falls back to `meta/skills/{NN}-{skill_id}.toon` (universal)

All skills use NN- indexed filenames (e.g., `00-activity-resolution.toon`, `01-workflow-execution.toon`).

### Skill Contents

Each skill provides:

- **Execution pattern** - Tool sequence for workflow stages
- **Tool guidance** - When to use each tool, parameters, what to preserve
- **State management** - What to track in memory during execution (activity IDs, step indices)
- **Interpretation rules** - How to evaluate transitions, checkpoints, decisions, triggers
- **Error recovery** - Common error scenarios and recovery patterns

#### workflow-execution (universal)

Primary skill for workflow navigation:
- **Start**: `list_workflows` → `get_workflow` → `list_workflow_resources`
- **Per-activity**: `get_workflow_activity` → `get_checkpoint` → `get_resource`
- **Transitions**: `validate_transition`
- **Triggers**: Suspend parent, execute child workflow, return to parent

#### activity-resolution (universal)

Bootstrap skill for agent initialization:
- **Bootstrap**: `get_activities` → `get_activity`
- **Skill loading**: `get_skill`
- **Discovery**: `discover_resources`

## Available Workflows

| Workflow | Activities | Description |
|----------|------------|-------------|
| `meta` | 3 | Bootstrap workflow - independent activities for workflow lifecycle |
| `work-package` | 11 | Single work package from issue to merged PR |
| `work-packages` | 7 | Plan and coordinate multiple related work packages |

### Workflow Types

**Sequential workflows** (e.g., `work-package`, `work-packages`):
- Activities connected by transitions
- Require `initialActivity`
- Follow a defined flow

**Independent activities** (e.g., `meta`):
- Activities matched via recognition patterns
- No transitions between activities
- Each is a self-contained entry point

### Cross-Workflow Triggering

Activities can trigger other workflows using the `triggers` property. When triggered:
1. Parent workflow state is suspended
2. Child workflow executes to completion
3. Parent workflow resumes with returned context

Example: `work-packages` implementation activity triggers `work-package` for each planned package.
