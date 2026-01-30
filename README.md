# Workflow Registry

This orphan branch contains workflow definitions, effectivities, agent registries, skills, and resources for the MCP Workflow Server.

## Branch Structure

- **`main`** - Server code (TypeScript implementation)
- **`registry`** - Workflow data and agent configuration ← You are here

## Directory Structure

```
registry/                       # Worktree checkout
├── agents/                     # Agent registry configurations
│   ├── default.toon            # Default agent registry
│   ├── minimal.toon            # Minimal variant
│   └── README.md
├── effectivities/              # Agent capability definitions
│   ├── code-review.toon        # Base effectivities
│   ├── code-review_rust.toon   # Extended effectivities
│   └── README.md
├── skills/                     # All skills (universal + workflow-specific)
│   ├── 00-activity-resolution.toon
│   ├── 01-workflow-execution.toon
│   └── README.md
├── workflows/                  # Workflow definitions
│   ├── meta/                   # Bootstrap workflow
│   │   ├── workflow.toon
│   │   ├── rules.toon
│   │   ├── activities/
│   │   └── resources/
│   ├── work-package/           # Single work package workflow
│   │   ├── workflow.toon
│   │   ├── activities/
│   │   └── resources/
│   └── work-packages/          # Multi-package planning workflow
│       ├── workflow.toon
│       └── activities/
```

## Components

### Agents ([agents/](agents/))

Map effectivities to sub-agent configurations.

| Variant | Description |
|---------|-------------|
| `default.toon` | Full registry with specialized agents |
| `minimal.toon` | Minimal registry with consolidated agents |

### Effectivities ([effectivities/](effectivities/))

Declare agent capabilities for step-level delegation.

| Effectivity | Description |
|-------------|-------------|
| `code-review` | General code review capability |
| `code-review_rust` | Rust-specific code review |
| `code-review_rust_substrate` | Substrate framework review |
| `test-review` | Test suite quality assessment |
| `pr-review-response` | PR comment response handling |

### Skills ([skills/](skills/))

Provide execution guidance for agents.

| Skill | Description |
|-------|-------------|
| `activity-resolution` | Resolve user goals to activities |
| `workflow-execution` | Execute workflows following schema patterns |
| `state-management` | Manage workflow state across sessions |
| `artifact-management` | Manage planning artifact folder structure |
| `code-review` | Rust/Substrate code review patterns |
| `test-review` | Test suite quality assessment |
| `pr-review-response` | PR comment response strategy |

### Workflows ([workflows/](workflows/))

| Workflow | Description |
|----------|-------------|
| [`meta`](workflows/meta/) | Bootstrap workflow - start, resume, and end other workflows |
| [`work-package`](workflows/work-package/) | Single work package implementation (issue → PR → merge) |
| [`work-packages`](workflows/work-packages/) | Multi-package planning for large initiatives |

## Server Configuration

The server's `workflowDir` should point to the `workflows/` subdirectory:

```bash
# Environment variable
WORKFLOW_DIR=./registry/workflows

# Or in code
const config = { workflowDir: './registry/workflows' };
```

## Worktree Setup

This branch is checked out as a worktree inside the main repo:

```bash
git worktree add ./registry registry
```

## Adding Content

**Effectivities:**
1. Create `{id}.toon` in `effectivities/`
2. Use `_` delimiter for extensions (e.g., `code-review_rust.toon`)
3. Include parent effectivities via `includes[]`

**Agent Registry:**
1. Add agent entry to `agents/default.toon`
2. List effectivities the agent can handle
3. Define model, instructions, and tools

**Skills:**
1. Create `{NN}-{skill-id}.toon` in `skills/`
2. Prefix with two-digit index

**Workflows:**
1. Create `{workflow-id}/` directory in `workflows/`
2. Add `workflow.toon`, `README.md`, `activities/`, `resources/`

## Validation

Content is validated against Zod schemas at runtime. Invalid definitions will fail to load with descriptive error messages.
