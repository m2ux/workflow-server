# Development Guide

This guide covers development setup, commands, and testing for the MCP Workflow Server.

## Prerequisites

- Node.js 18+
- npm or yarn
- Git (for worktree setup)

## Setup

```bash
# Clone the repository
git clone https://github.com/m2ux/workflow-server.git
cd workflow-server

# Install dependencies
npm install

# Set up workflow data (worktree for orphan branch)
git worktree add ./workflows workflows
```

## Development Commands

```bash
# Install dependencies
npm install

# Type check
npm run typecheck

# Build for production
npm run build

# Run in development mode (with hot reload via tsx)
npm run dev

# Generate JSON schemas from Zod definitions
npm run build:schemas
```

## Project Structure

```
workflow-server/
├── src/
│   ├── index.ts              # Entry point
│   ├── server.ts             # MCP server setup
│   ├── config.ts             # Configuration loading
│   ├── errors.ts             # Custom error classes
│   ├── result.ts             # Result type for error handling
│   ├── logging.ts            # Audit logging
│   ├── schema/               # Zod schemas
│   │   ├── workflow.schema.ts
│   │   ├── state.schema.ts
│   │   └── condition.schema.ts
│   ├── types/                # Generated TypeScript types
│   ├── loaders/              # File loaders
│   │   ├── workflow-loader.ts
│   │   ├── guide-loader.ts
│   │   ├── template-loader.ts
│   │   ├── activity-loader.ts
│   │   └── skill-loader.ts
│   ├── tools/                # MCP tool implementations
│   │   ├── workflow-tools.ts
│   │   └── resource-tools.ts
│   └── utils/                # Utility functions
│       └── toon.ts           # TOON format parser
├── schemas/                  # Generated JSON schemas
├── scripts/                  # Build scripts
│   ├── generate-schemas.ts
│   └── validate-workflow.ts
├── tests/                    # Test suites
├── workflows/                # Worktree (workflows branch)
│   ├── meta/                 # Bootstrap workflow (manages other workflows)
│   │   ├── meta.toon             # Meta workflow definition
│   │   ├── intents/              # All activities (indexed, no separate index file)
│   │   │   └── {NN}-{id}.toon    # Individual activities (01-start-workflow, etc.)
│   │   └── skills/               # Universal skills (indexed)
│   │       └── {NN}-{id}.toon    # Skills that apply to all workflows
│   └── {workflow-id}/        # Each workflow folder contains:
│       ├── {workflow-id}.toon    # Workflow definition
│       ├── guides/               # Guide subdirectory
│       │   └── {NN}-{name}.toon  # Guides (indexed)
│       ├── templates/            # Template subdirectory
│       │   └── {NN}-{name}.md    # Templates (indexed)
│       └── skills/               # Workflow-specific skills (indexed)
│           └── {NN}-{id}.toon    # Skills for this workflow
└── docs/                     # Documentation
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `WORKFLOW_DIR` | `./workflows` | Path to workflow directories |
| `SERVER_NAME` | `workflow-server` | Server name in health check |
| `SERVER_VERSION` | `1.0.0` | Server version in health check |

## Testing

### Running Tests

```bash
# Run all tests (watch mode)
npm test

# Run tests once (no watch)
npm test -- --run

# Run specific test file
npm test -- --run tests/mcp-server.test.ts

# Run with coverage
npm test -- --run --coverage
```

### Test Suites

| Test Suite | Tests | Coverage |
|------------|-------|----------|
| `workflow-loader.test.ts` | 17 | Workflow loading, transitions, validation |
| `schema-validation.test.ts` | 23 | All Zod schemas |
| `mcp-server.test.ts` | 19 | All MCP tools |
| `activity-loader.test.ts` | 10 | Activity loading and dynamic index |
| `skill-loader.test.ts` | 13 | Skill loading and dynamic index |
| **Total** | **82** | ✅ All passing |

### Test Infrastructure

- **Framework:** [Vitest](https://vitest.dev/)
- **MCP Testing:** Uses `InMemoryTransport` for integration tests
- **Schema Validation:** Tests all Zod schemas with valid/invalid inputs

## Schema Generation

The project uses Zod as the source of truth for schemas. JSON Schema files are generated for external tooling:

```bash
# Generate JSON schemas from Zod
npm run build:schemas
```

This creates:
- `schemas/workflow.schema.json`
- `schemas/state.schema.json`
- `schemas/condition.schema.json`

## Validating Workflows

Use the validation script to check workflow JSON files:

```bash
npx tsx scripts/validate-workflow.ts workflows/work-package/work-package.toon
```

## Branch Structure

| Branch | Content | Purpose |
|--------|---------|---------|
| `main` | TypeScript server code | Implementation |
| `workflows` | JSON workflows + guides | Data (orphan branch) |

### Working with the Workflows Branch

The `workflows` branch is an orphan branch with separate history. Access it via worktree:

```bash
# Add worktree (one-time setup)
git worktree add ./workflows workflows

# Update workflow data
cd workflows
git pull origin workflows

# Commit workflow changes
cd workflows
git add -A
git commit -m "feat: update workflow"
git push origin workflows
```

## Adding New Workflows

1. Create a new directory in `workflows/{workflow-id}/`
2. Create `{workflow-id}.toon` workflow definition in that directory
3. Validate with: `npx tsx scripts/validate-workflow.ts <path>`
4. Commit to the `workflows` branch

## Adding New Guides

Guides are stored in a `guides/` subdirectory within each workflow:

1. Create `{NN}-{name}.toon` in `workflows/{workflow-id}/guides/`
2. Use sequential index (00, 01, 02, etc.)
3. Guides are auto-discovered - no manifest update needed
4. Access via: `get_guide { workflow_id: "{id}", index: "{NN}" }`
5. Commit to the `workflows` branch

## Adding New Templates

Templates are stored in a `templates/` subdirectory within each workflow:

1. Create `{NN}-{name}.md` in `workflows/{workflow-id}/templates/`
2. Use sequential index (01, 02, 03, etc.)
3. Templates are auto-discovered - no manifest update needed
4. Access via: `get_template { workflow_id: "{id}", index: "{NN}" }`
5. Commit to the `workflows` branch

## Adding New Skills

Skills can be **universal** (apply to all workflows) or **workflow-specific**. All skills use NN- indexed filenames.

### Universal Skills

Universal skills are stored in the `meta` workflow's `skills/` subdirectory:

1. Create `{NN}-{skill-id}.toon` in `workflows/meta/skills/`
2. Use sequential index (00, 01, 02, etc.)
3. Access via: `get_skill { skill_id: "{skill-id}" }`
4. Examples: `00-activity-resolution`, `01-workflow-execution`
5. Commit to the `workflows` branch

### Workflow-Specific Skills

Workflow-specific skills are stored in each workflow's `skills/` subdirectory:

1. Create `{NN}-{skill-id}.toon` in `workflows/{workflow-id}/skills/`
2. Use sequential index (00, 01, 02, etc.)
3. Skills are auto-discovered - no manifest update needed
4. Access via: `get_skill { skill_id: "{skill-id}", workflow_id: "{workflow-id}" }`
5. Commit to the `workflows` branch

### Skill Resolution

When loading a skill with `workflow_id`:
1. First checks `{workflow-id}/skills/{NN}-{skill-id}.toon`
2. Falls back to `meta/skills/{NN}-{skill-id}.toon` (universal)
