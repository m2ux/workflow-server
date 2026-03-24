# API Reference

## MCP Tools

### Bootstrap Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `list_workflows` | - | List all available workflow definitions. Call before start_session to choose a workflow |
| `start_session` | `workflow_id` | Start a workflow session. Returns agent rules, workflow metadata, and an opaque session token |
| `health_check` | - | Check server health and available workflows |

### Workflow Tools

All workflow tools require `session_token` (from `start_session`). Each response includes an updated token in `_meta.session_token`.

| Tool | Parameters | Description |
|------|------------|-------------|
| `get_workflow` | `session_token` | Get the complete workflow definition (workflow_id from token) |
| `get_activity` | `session_token`, `activity_id` | Get activity details and update the session's current activity |
| `get_checkpoint` | `session_token`, `checkpoint_id` | Get checkpoint details (activity_id from token) |
| `validate_transition` | `session_token`, `from_activity`, `to_activity` | Validate if a transition between activities is allowed |

### Skill Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `get_skill` | `session_token`, `skill_id` | Get a skill (checks workflow-specific first, then universal) |

### Resource Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `list_workflow_resources` | `session_token` | List all resources for the session workflow |
| `get_resource` | `session_token`, `index` | Get a specific resource by index |

### Discovery Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `discover_resources` | `session_token` | Discover all available resources: workflows, resources, skills |

### State Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `save_state` | `session_token`, `state`, `planning_folder_path`, `description?` | Save workflow state (encrypts session token at rest) |
| `restore_state` | `session_token`, `file_path` | Restore workflow state (decrypts session token) |

## Session Token

The session token is an opaque string returned by `start_session`. It encodes the current workflow, activity, and a sequence counter. Agents should treat it as an opaque value — pass it to every tool call and use the updated token from each response's `_meta.session_token`.

### Lifecycle

1. Call `list_workflows` to see available workflows
2. Call `start_session(workflow_id)` to get rules + opaque token
3. Pass `session_token` to every subsequent tool call
4. Use the updated token from `_meta.session_token` in the next call
5. The counter increments on every call, enabling staleness detection

### Token exempt tools

- `list_workflows` — pre-session bootstrap
- `start_session` — creates the session
- `health_check` — operational

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

When calling `get_skill { skill_id }` (workflow_id is derived from the session token):
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
- **Start**: `list_workflows` → `start_session` → `get_workflow` → `list_workflow_resources`
- **Per-activity**: `get_activity` → `get_checkpoint` → `get_resource`
- **Transitions**: `validate_transition`
- **Triggers**: Suspend parent, execute child workflow, return to parent

#### activity-resolution (universal)

Bootstrap skill for agent initialization:
- **Bootstrap**: `help` → `list_workflows` → `start_session`
- **Skill loading**: `get_skill`

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
