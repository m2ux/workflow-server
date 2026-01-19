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

## Validation

Workflows are validated against the Zod schema at runtime. Invalid workflows will fail to load with descriptive error messages.
