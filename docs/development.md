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
│   │   ├── technique.schema.ts
│   │   ├── condition.schema.ts
│   │   ├── state.schema.ts
│   │   ├── resource.schema.ts
│   │   └── common.ts
│   ├── types/                # Re-export layer (types + schemas)
│   ├── loaders/              # File loaders (filesystem → validated objects)
│   │   ├── workflow-loader.ts
│   │   ├── activity-loader.ts
│   │   ├── technique-loader.ts          # Includes resolveTechniques (resolves techniques via :: paths)
│   │   ├── markdown-technique-loader.ts # Parses markdown technique files into Technique objects
│   │   ├── resource-loader.ts
│   │   ├── core-ops.ts       # CORE_ORCHESTRATOR_TECHNIQUES / CORE_WORKER_TECHNIQUES (core technique refs bundled into get_workflow / get_activity)
│   │   ├── schema-loader.ts
│   │   ├── schema-preamble.ts
│   │   ├── filename-utils.ts
│   │   └── index.ts          # Barrel exports
│   ├── tools/                # MCP tool implementations
│   │   ├── workflow-tools.ts # discover, list_workflows, get_workflow, next_activity, get_activity, yield_checkpoint, resume_checkpoint, present_checkpoint, respond_checkpoint, get_trace, health_check, get_workflow_status
│   │   ├── resource-tools.ts # start_session, dispatch_child, get_technique, get_resource
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
│   ├── technique.schema.json
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
│   │   └── techniques/
│   └── {workflow-id}/        # Each workflow folder
│       ├── workflow.toon
│       ├── activities/
│       ├── resources/
│       └── techniques/
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
| `mcp-server.test.ts` | All MCP tools, trace lifecycle, activity manifest, technique bundles |
| `activity-loader.test.ts` | Activity loading and dynamic index |
| `technique-loader.test.ts` | Technique loading, dynamic index, technique resolution |
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

Several layered checks validate workflow data:

```bash
# Structural / schema validation of TOON files
npx tsx scripts/validate-workflow.ts workflows/work-package/workflow.toon
npx tsx scripts/validate-workflow-toon.ts <workflow-path>   # whole-directory sweep

# Every step.technique reference resolves through the loader
npx tsx scripts/check-all-refs.ts

# Binding fidelity: every step.technique.inputs key is a declared input, and every
# interpolation/condition read resolves to a producer (declared id, $-local,
# workflow.toon variable, or set-target). Fails only on NEW drift beyond
# scripts/binding-fidelity-baseline.json (re-snapshot intentional changes with
# --update-baseline).
npm run check:binding
```

The binding-fidelity guard also runs as a Vitest test (`tests/binding-fidelity.test.ts`), so `npm test` fails on new binding drift.

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
3. Validate with: `npx tsx scripts/validate-workflow.ts <path>`, then run `npx tsx scripts/check-all-refs.ts` and `npm run check:binding` to confirm references resolve and no binding drift
4. Commit to the `workflows` branch

## Adding New Resources

Resources are stored in a `resources/` subdirectory within each workflow as slug-named markdown files:

1. Create `{slug}.md` in `workflows/{workflow-id}/resources/`
2. The filename slug is the resource id (the frontmatter `name:` should match)
3. Resources are auto-discovered - no manifest update needed
4. Access via: `get_resource` with the resource slug (referenced from a technique); cross-workflow refs use `{workflow}/{slug}`
5. Commit to the `workflows` branch

Note: For backwards compatibility, the loader also checks the `guides/` folder if `resources/` doesn't exist.

## Adding New Techniques

Techniques are markdown files. They can be **universal** (apply to all workflows, stored in `meta`) or **workflow-specific**. A technique lives at `techniques/{slug}.md`. A technique can contain nested techniques in its folder; a nested technique is itself a technique, addressed by appending its slug to the parent's path.

### Technique File Format

A technique file has:

- **YAML frontmatter** carrying `metadata.version`.
- **`## Capability`** — what the technique does.
- **`## Inputs`** / **`## Outputs`** (optional) — each `### entry` may carry `####` sub-section components, plus the reserved `#### artifact` (output persistence filename) and `#### default` (input default).
- **`## Protocol`** — ordered blocks `### N. Title` with step bullets, or a flat list. Failure handling is written inline in the protocol step that gives rise to it.
- **`## Rules`** — constraints the technique enforces.

### Universal Techniques

Universal techniques are stored in the `meta` workflow's `techniques/` subdirectory:

1. Create `techniques/{slug}.md` under `workflows/meta/`
2. Access via: `get_technique` (workflow- or activity-level first declared technique, optionally a step's technique via `step_id`)
3. Commit to the `workflows` branch

### Workflow-Specific Techniques

Workflow-specific techniques are stored in each workflow's `techniques/` subdirectory:

1. Create `techniques/{slug}.md` in `workflows/{workflow-id}/`
2. Techniques are auto-discovered - no manifest update needed
3. Access via: `get_technique { session_index, step_id: "{step-id}" }` (when referenced by a step)
4. Commit to the `workflows` branch

### Technique Resolution

Techniques are addressed by `::`-delimited paths: `[workflow::]technique[::nested…]`. A same-workflow reference omits the workflow prefix. A `{workflow}/{technique}` slash form is normalized to the `::` form.

When loading a technique, the workflow is determined from the session's `session.json` (resolved via `session_index`):
1. First checks the session's workflow (current-workflow-first)
2. Falls back to the `meta` layer (universal)
