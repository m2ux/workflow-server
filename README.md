# Workflow Registry

This orphan branch contains workflow definitions, effectivities, agent registries, skills, and resources for the MCP Workflow Server.

## Branch Structure

- **`main`** - Server code (TypeScript implementation)
- **`registry`** - Workflow data and agent configuration ← You are here

> Note: This branch was previously named `workflows` and is being renamed to `registry` to better reflect its expanded scope.

## Directory Structure

```
registry/                       # Worktree checkout
├── effectivities/              # Agent capability definitions
│   ├── code-review.toon        # Base effectivities
│   ├── code-review_rust.toon   # Extended effectivities
│   └── README.md
├── agents/                     # Agent registry configurations
│   ├── default.toon            # Default agent registry
│   ├── minimal.toon            # Minimal variant
│   └── README.md
├── skills/                     # All skills (universal + workflow-specific)
│   ├── 00-activity-resolution.toon
│   ├── 01-workflow-execution.toon
│   └── README.md
├── meta/                       # Bootstrap workflow
│   ├── README.md
│   ├── workflow.toon
│   ├── rules.toon
│   ├── activities/
│   └── resources/
├── {workflow-id}/              # Each workflow folder
│   ├── README.md
│   ├── workflow.toon
│   ├── activities/
│   └── resources/
```

## Components

### Effectivities ([effectivities/](effectivities/))

Declare agent capabilities for step-level delegation.

| Effectivity | Description |
|-------------|-------------|
| `code-review` | General code review capability |
| `code-review_rust` | Rust-specific code review |
| `code-review_rust_substrate` | Substrate framework review |
| `test-review` | Test suite quality assessment |
| `pr-review-response` | PR comment response handling |

### Agent Registry ([agents/](agents/))

Map effectivities to sub-agent configurations.

| Variant | Description |
|---------|-------------|
| `default.toon` | Full registry with specialized agents |
| `minimal.toon` | Minimal registry with consolidated agents |

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

### Workflows

| Workflow | Description |
|----------|-------------|
| [`meta`](meta/) | Bootstrap workflow - start, resume, and end other workflows |
| [`work-package`](work-package/) | Single work package implementation (issue → PR → merge) |
| [`work-packages`](work-packages/) | Multi-package planning for large initiatives |

## Agent-Side Consumption

Agents checkout registry content to `.engineering/`:

```bash
# In project root
mkdir -p .engineering/agents
cd .engineering/agents
git archive --remote=origin registry agents/ | tar -x --strip-components=1
```

Then load effectivities and agent registries:

```typescript
const registry = await loadDefaultAgentRegistry('.engineering/agents');
const agent = findAgentForEffectivity(registry, 'code-review_rust');
```

## Worktree Setup

This branch is checked out as a worktree inside the main repo:

```bash
git worktree add ./workflow-data registry
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
1. Create `{workflow-id}/` directory
2. Add `workflow.toon`, `README.md`, `activities/`, `resources/`

## Validation

Content is validated against Zod schemas at runtime. Invalid definitions will fail to load with descriptive error messages.
