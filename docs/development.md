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
```

## Project Structure

```
workflow-server/
├── src/
│   ├── index.ts              # Entry point: config → server → stdio transport
│   ├── server.ts             # MCP server creation and tool/resource registration
│   ├── config.ts             # ServerConfig: workflowDir, schemasDir, schemaPreamble, traceStore, minCheckpointResponseSeconds
│   ├── errors.ts             # Custom error classes (WorkflowNotFoundError, etc.)
│   ├── result.ts             # Result<T, E> monad for typed error handling
│   ├── logging.ts            # Structured JSON logging + audit event wrapper (withAuditLog)
│   ├── trace.ts              # TraceStore, TraceEvent, trace token encode/decode
│   ├── schema/               # Zod runtime schemas for validation
│   │   ├── workflow.schema.ts
│   │   ├── activity.schema.ts
│   │   ├── skill.schema.ts
│   │   ├── condition.schema.ts
│   │   ├── state.schema.ts
│   │   ├── resource.schema.ts
│   │   └── common.ts
│   ├── types/                # Re-export layer (types + schemas)
│   ├── loaders/              # File loaders (filesystem → validated objects)
│   │   ├── workflow-loader.ts
│   │   ├── activity-loader.ts
│   │   ├── skill-loader.ts   # Includes resolveOperations (skill::element ref resolver)
│   │   ├── resource-loader.ts
│   │   ├── core-ops.ts       # CORE_ORCHESTRATOR_OPS / CORE_WORKER_OPS (op refs bundled into get_workflow / get_activity)
│   │   ├── schema-loader.ts
│   │   ├── schema-preamble.ts
│   │   ├── filename-utils.ts
│   │   └── index.ts          # Barrel exports
│   ├── tools/                # MCP tool implementations
│   │   ├── workflow-tools.ts # discover, list_workflows, get_workflow, next_activity, get_activity, yield_checkpoint, resume_checkpoint, present_checkpoint, respond_checkpoint, get_trace, health_check, get_workflow_status
│   │   ├── resource-tools.ts # start_session, get_skills, get_skill, get_resource, resolve_operations
│   │   └── index.ts          # Tool registration entry point
│   ├── resources/            # MCP resource registration
│   │   └── schema-resources.ts # workflow-server://schemas
│   └── utils/                # Utility functions
│       ├── toon.ts           # TOON format parser wrapper
│       ├── session.ts        # Session token create/decode/advance (HMAC-SHA256)
│       ├── validation.ts     # Transition, manifest, and activity validation
│       ├── crypto.ts         # AES-256-GCM encryption, HMAC signing
│       └── index.ts          # Barrel exports
├── schemas/                  # JSON Schema files for IDE tooling
│   ├── workflow.schema.json
│   ├── activity.schema.json
│   ├── skill.schema.json
│   ├── condition.schema.json
│   └── state.schema.json
├── scripts/                  # Build scripts
│   ├── generate-schemas.ts
│   └── validate-workflow.ts
├── tests/                    # Test suites
├── workflows/                # Worktree (workflows branch)
│   ├── meta/                 # Bootstrap workflow
│   │   ├── workflow.toon
│   │   ├── activities/
│   │   └── skills/
│   └── {workflow-id}/        # Each workflow folder
│       ├── workflow.toon
│       ├── activities/
│       ├── resources/
│       └── skills/
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

| Test Suite | Coverage |
|------------|----------|
| `workflow-loader.test.ts` | Workflow loading, transitions, validation |
| `schema-validation.test.ts` | All Zod schemas |
| `schema-loader.test.ts` | JSON Schema loading and serving |
| `mcp-server.test.ts` | All MCP tools, trace lifecycle, activity manifest, operation bundles |
| `activity-loader.test.ts` | Activity loading and dynamic index |
| `skill-loader.test.ts` | Skill loading, dynamic index, `resolveOperations` |
| `session.test.ts` | Token create/decode/advance, sid, aid, parent context |
| `trace.test.ts` | TraceStore, trace token encode/decode |
| `validation.test.ts` | Transition, manifest, condition validation |
| `dispatch.test.ts` | Workflow dispatch, status, parent-child trace correlation |

Run `npm test -- --run` for the live count and pass/fail summary.

### Test Infrastructure

- **Framework:** [Vitest](https://vitest.dev/)
- **MCP Testing:** Uses `InMemoryTransport` for integration tests
- **Schema Validation:** Tests all Zod schemas with valid/invalid inputs

## Validating Workflows

Use the validation script to check workflow TOON files:

```bash
npx tsx scripts/validate-workflow.ts workflows/work-package/workflow.toon
```

## Branch Structure

| Branch | Content | Purpose |
|--------|---------|---------|
| `main` | TypeScript server code | Implementation |
| `workflows` | TOON workflows + resources | Data (orphan branch) |

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
2. Create `workflow.toon` workflow definition in that directory
3. Validate with: `npx tsx scripts/validate-workflow.ts <path>`
4. Commit to the `workflows` branch

## Adding New Resources

Resources are stored in a `resources/` subdirectory within each workflow:

1. Create `{NN}-{name}.toon` or `{NN}-{name}.md` in `workflows/{workflow-id}/resources/`
2. Use sequential index (00, 01, 02, etc.)
3. Resources are auto-discovered - no manifest update needed
4. Access via: `get_resource` with the resource index (referenced from skill `resources` arrays)
5. Commit to the `workflows` branch

Note: For backwards compatibility, the loader also checks the `guides/` folder if `resources/` doesn't exist.

## Adding New Skills

Skills can be **universal** (apply to all workflows) or **workflow-specific**. All skills use NN- indexed filenames.

### Universal Skills

Universal skills are stored in the `meta` workflow's `skills/` subdirectory:

1. Create `{NN}-{skill-id}.toon` in `workflows/meta/skills/`
2. Use sequential index (00, 01, 02, etc.)
3. Access via: `get_skills` (workflow-level primary skill) or `get_skill { session_token, step_id: "{step-id}" }` (step-level)
4. Commit to the `workflows` branch

### Workflow-Specific Skills

Workflow-specific skills are stored in each workflow's `skills/` subdirectory:

1. Create `{NN}-{skill-id}.toon` in `workflows/{workflow-id}/skills/`
2. Use sequential index (00, 01, 02, etc.)
3. Skills are auto-discovered - no manifest update needed
4. Access via: `get_skill { session_token, step_id: "{step-id}" }` (when referenced by a step)
5. Commit to the `workflows` branch

### Skill Resolution

When loading a skill, the workflow is determined from the session token:
1. First checks `{workflow}/skills/{NN}-{skill-id}.toon`
2. Falls back to `meta/skills/{NN}-{skill-id}.toon` (universal)
