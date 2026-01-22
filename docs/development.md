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
git worktree add ./workflow-data workflows
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
│   │   ├── intent-loader.ts
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
├── workflow-data/            # Worktree (workflows branch)
│   └── workflows/            # Workflow directories
│       └── {workflow-id}/    # Each workflow folder contains:
│           ├── {workflow-id}.toon    # Workflow definition
│           ├── {NN}-*.guide.toon     # Guides (indexed)
│           └── {NN}-*.template.md    # Templates (indexed)
└── docs/                     # Documentation
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `WORKFLOW_DIR` | `./workflow-data/workflows` | Path to workflow directories |
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
| `mcp-server.test.ts` | 18 | All MCP tools |
| `intent-loader.test.ts` | 10 | Intent loading and index |
| `skill-loader.test.ts` | 8 | Skill loading |
| **Total** | **76** | ✅ All passing |

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
npx tsx scripts/validate-workflow.ts workflow-data/workflows/work-package.json
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
git worktree add ./workflow-data workflows

# Update workflow data
cd workflow-data
git pull origin workflows

# Commit workflow changes
cd workflow-data
git add -A
git commit -m "feat: update workflow"
git push origin workflows
```

## Adding New Workflows

1. Create a new directory in `workflow-data/workflows/{workflow-id}/`
2. Create `{workflow-id}.toon` workflow definition in that directory
3. Validate with: `npx tsx scripts/validate-workflow.ts <path>`
4. Commit to the `workflows` branch

## Adding New Guides

Guides are stored alongside workflows using indexed filenames:

1. Create `{NN}-{name}.guide.toon` in `workflow-data/workflows/{workflow-id}/`
2. Use sequential index (00, 01, 02, etc.)
3. Guides are auto-discovered - no manifest update needed
4. Access via: `get_guide { workflow_id: "{id}", index: "{NN}" }`
5. Commit to the `workflows` branch

## Adding New Templates

Templates are Markdown files for document generation:

1. Create `{NN}-{name}.template.md` in `workflow-data/workflows/{workflow-id}/`
2. Use sequential index (01, 02, 03, etc.)
3. Templates are auto-discovered - no manifest update needed
4. Access via: `get_template { workflow_id: "{id}", index: "{NN}" }`
5. Commit to the `workflows` branch
