# Workflow Data

This orphan branch contains workflow JSON definitions and guide markdown files for the MCP Workflow Server.

## Branch Structure

- **`main`** - Server code (TypeScript implementation)
- **`workflows`** - Workflow data (JSON + guides) ← You are here

## Directory Structure

```
workflow-data/              # Worktree checkout
├── workflows/              # Workflow JSON definitions
│   ├── example-workflow.json
│   └── work-package.json   # (WP05)
└── guides/                 # Guide markdown files
    └── project-setup.guide.md
```

## Worktree Setup

This branch is checked out as a worktree inside the main repo:

```bash
git worktree add ./workflow-data workflows
```

## Adding Content

**Workflows:**
1. Create a new JSON file in `workflows/`
2. Follow the schema defined in `main:schemas/workflow.schema.json`
3. Commit to this branch

**Guides:**
1. Create a new `.guide.md` file in `guides/`
2. Reference from workflow JSON via `guide.path`
3. Commit to this branch

## Workflow Origins

| Workflow | Source | Notes |
|----------|--------|-------|
| `work-package.json` | [`agent-resources/workflows/work-package/`](https://github.com/m2ux/agent-resources/tree/main/workflows/work-package) | 11 phases, 15 checkpoints |
| `example-workflow.json` | N/A | Created as schema demonstration |

### Guide References

The `work-package.json` workflow references guides via URL from the source repository:

```
https://raw.githubusercontent.com/m2ux/agent-resources/main/workflows/work-package/<guide>.md
```

Referenced guides (14 total):
- `work-package.md` - Main workflow document
- `requirements-elicitation.guide.md` - Phase 2
- `implementation-analysis.guide.md` - Phase 3
- `knowledge-base-research.guide.md` - Phase 4
- `plan.guide.md`, `design-framework.guide.md`, `test-plan.guide.md`, `pr-description.guide.md` - Phase 5
- `assumptions-review.guide.md`, `task-completion-review.guide.md`, `architecture-review.guide.md` - Phase 6
- `strategic-review.guide.md` - Phase 8
- `complete.guide.md` - Phase 9
- `workflow-retrospective.guide.md` - Phase 11

## Validation

Workflows are validated against the Zod schema at runtime. Invalid workflows will fail to load with descriptive error messages.
