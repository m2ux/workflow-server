# WP06: Integration Testing

## Overview

Implement comprehensive unit and integration tests for the MCP Workflow Server.

## Status: ✅ Complete

## Test Infrastructure

- **Framework:** Vitest
- **MCP Testing:** InMemoryTransport for integration tests
- **Configuration:** `vitest.config.ts`

## Test Suites

### Unit Tests

#### `workflow-loader.test.ts` (17 tests)

| Category | Tests |
|----------|-------|
| `listWorkflows` | List available workflows, empty directory handling |
| `loadWorkflow` | Valid workflow loading, error handling |
| `getPhase` | Phase retrieval, non-existent handling |
| `getCheckpoint` | Checkpoint retrieval |
| `getValidTransitions` | Transition discovery from phases, decisions |
| `validateTransition` | Valid/invalid transition validation |

#### `schema-validation.test.ts` (23 tests)

| Category | Tests |
|----------|-------|
| `ConditionSchema` | Simple, AND, OR, NOT, exists operators |
| `StepSchema` | Minimal, with guide, validation |
| `CheckpointSchema` | Options, effects, validation |
| `DecisionSchema` | Branches, conditions |
| `LoopSchema` | forEach, while types |
| `PhaseSchema` | Minimal, full features |
| `WorkflowSchema` | Complete workflow validation |

### Integration Tests

#### `mcp-server.test.ts` (12 tests)

| Tool/Resource | Tests |
|---------------|-------|
| `list_workflows` | Lists available workflows |
| `get_workflow` | Retrieves workflow, error handling |
| `get_phase` | Retrieves phase, error handling |
| `get_checkpoint` | Retrieves checkpoint |
| `validate_transition` | Valid/invalid transitions |
| `health_check` | Server health status |
| `workflow://guides` | List guides resource |
| `workflow://guides/{name}` | Read guide content |

## Coverage

| Test File | Tests | Status |
|-----------|-------|--------|
| `workflow-loader.test.ts` | 17 | ✅ Pass |
| `schema-validation.test.ts` | 23 | ✅ Pass |
| `mcp-server.test.ts` | 12 | ✅ Pass |
| **Total** | **52** | ✅ All Pass |

## Running Tests

```bash
# Run all tests (watch mode)
npm test

# Run tests once
npm test -- --run

# Run specific file
npm test -- --run tests/mcp-server.test.ts

# With coverage
npm test -- --run --coverage
```

## Key Fixes During Testing

1. **Resource Registration:** Fixed MCP SDK `resource()` call signature
2. **Error Handling:** MCP tools return `isError: true` instead of throwing
3. **Schema Validation:** Fixed `z.discriminatedUnion` with explicit type literals
