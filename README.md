# Workflows

This orphan branch contains workflow definitions, activities, skills, and resources for the MCP Workflow Server.

## Branch Structure

- **`main`** - Server code (TypeScript implementation)
- **`workflows`** - Workflow data (TOON definitions) ← You are here

## Directory Structure

```
workflows/                    # Worktree checkout
├── meta/                     # Bootstrap workflow (manages other workflows)
│   ├── README.md             # Workflow documentation with Mermaid diagrams
│   ├── workflow.toon         # Meta workflow definition
│   ├── rules.toon            # Agent rules for workflow execution
│   ├── activities/           # All activities (indexed)
│   │   └── {NN}-{id}.toon    # 01-start-workflow, 02-resume-workflow, etc.
│   └── skills/               # Universal skills (indexed)
│       └── {NN}-{id}.toon    # 00-activity-resolution, 01-workflow-execution, etc.
├── {workflow-id}/            # Each workflow folder
│   ├── README.md             # Workflow documentation with Mermaid diagrams
│   ├── workflow.toon         # Workflow definition
│   ├── activities/           # Activity subdirectory (indexed)
│   │   └── {NN}-{id}.toon    # Activities for this workflow
│   ├── resources/            # Resource subdirectory (indexed)
│   │   └── {NN}-{name}.md    # Guidance resources
│   └── skills/               # Workflow-specific skills (indexed)
│       └── {NN}-{id}.toon    # Skills for this workflow
```

## Available Workflows

| Workflow | Description |
|----------|-------------|
| `meta` | Bootstrap workflow - start, resume, and end other workflows |
| `work-package` | Single work package implementation (issue → PR → merge) |
| `work-packages` | Multi-package planning for large initiatives |

## Universal Skills (meta/skills/)

| Skill | Description |
|-------|-------------|
| `00-activity-resolution` | Resolve user goals to activities |
| `01-workflow-execution` | Execute workflows following schema patterns |
| `02-state-management` | Manage workflow state across sessions |
| `03-artifact-management` | Manage planning artifact folder structure |

## Worktree Setup

This branch is checked out as a worktree inside the main repo:

```bash
git worktree add ./workflows workflows
```

## Adding Content

**New Workflow:**
1. Create `{workflow-id}/` directory
2. Add `workflow.toon` workflow definition
3. Add `README.md` with Mermaid diagrams documenting the workflow
4. Add `activities/`, `resources/`, `skills/` subdirectories as needed
5. Commit to this branch

**Activities:**
1. Create `{NN}-{activity-id}.toon` in `{workflow-id}/activities/`
2. Prefix with two-digit index (01, 02, 03, etc.)
3. For meta activities, include `recognition[]` patterns for intent matching
4. Commit to this branch

**Resources:**
1. Create `{NN}-{name}.md` in `{workflow-id}/resources/`
2. Prefix with two-digit index (00, 01, 02, etc.)
3. Commit to this branch

**Skills:**
1. Create `{NN}-{skill-id}.toon` with two-digit index
2. Universal: Create in `meta/skills/` (e.g., `00-activity-resolution.toon`)
3. Workflow-specific: Create in `{workflow-id}/skills/`
4. Commit to this branch

## Validation

Workflows are validated against the Zod schema at runtime. Invalid workflows will fail to load with descriptive error messages.
