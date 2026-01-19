# Workflow Definitions

This orphan branch contains workflow JSON definitions for the MCP Workflow Server.

## Branch Structure

- **`main`** - Server code (TypeScript implementation)
- **`workflows`** - Workflow data (JSON definitions) ← You are here

## Directory Structure

```
workflows/
├── example-workflow.json     # Example demonstrating all primitives
├── work-package.json         # Work package workflow (WP05)
└── ...                       # Additional workflows
```

## Usage

The server on `main` branch reads workflow files from this branch via:
- Direct file system access (local development)
- Git worktree (production deployment)

## Adding New Workflows

1. Create a new JSON file in `workflows/`
2. Follow the schema defined in `main:schemas/workflow.schema.json`
3. Commit to this branch

## Validation

Workflows are validated against the Zod schema at runtime. Invalid workflows will fail to load with descriptive error messages.
