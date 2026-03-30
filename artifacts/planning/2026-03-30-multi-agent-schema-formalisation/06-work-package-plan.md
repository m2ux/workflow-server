# Work Package Plan — Multi-Agent Schema Formalisation

**Activity:** plan-prepare (v1.4.0)  
**Date:** 2026-03-30  
**Issue:** [#84](https://github.com/m2ux/workflow-server/issues/84)

---

## 1. Approach

Add a required `executionModel` field to the workflow schema that declares the agent roles participating in workflow execution. The implementation is a single atomic change across schema definitions, JSON Schema, TOON files, tool projection, and tests.

### Guiding Principles

1. **Schema-first**: Define the Zod and JSON Schema types first; everything else follows from the type system.
2. **Atomic**: All changes ship together — schema, migration, tests, tool update — so the build stays green.
3. **Minimal surface**: 2 schema files + 1 JSON Schema + 1 tool line + 10 TOON files + tests. No loader, session, or state changes.

---

## 2. Task Breakdown

### Phase 1: Schema Definition

| # | Task | File(s) | Estimate | Dependencies |
|---|------|---------|----------|-------------|
| T1 | Define `AgentRoleSchema` and `ExecutionModelSchema` in Zod | `src/schema/workflow.schema.ts` | 10m | — |
| T2 | Add `executionModel` field to `WorkflowSchema` | `src/schema/workflow.schema.ts` | 5m | T1 |
| T3 | Add `.refine()` for unique role ID validation | `src/schema/workflow.schema.ts` | 10m | T2 |
| T4 | Verify `.refine()` doesn't break callers (`.shape`, `.extend()` usage) | `src/` grep | 5m | T3 |
| T5 | Export new types (`AgentRole`, `ExecutionModel`) from type barrel | `src/types/workflow.ts` | 2m | T1 |

### Phase 2: JSON Schema

| # | Task | File(s) | Estimate | Dependencies |
|---|------|---------|----------|-------------|
| T6 | Add `agentRole` definition to JSON Schema | `schemas/workflow.schema.json` | 10m | T1 |
| T7 | Add `executionModel` definition to JSON Schema | `schemas/workflow.schema.json` | 10m | T6 |
| T8 | Add `executionModel` to workflow `properties` and `required` | `schemas/workflow.schema.json` | 5m | T7 |

### Phase 3: TOON Migration

| # | Task | File(s) | Estimate | Dependencies |
|---|------|---------|----------|-------------|
| T9 | Add executionModel to work-package | `workflows/work-package/workflow.toon` | 5m | T2 |
| T10 | Add executionModel to prism | `workflows/prism/workflow.toon` | 5m | T2 |
| T11 | Add executionModel to prism-audit | `workflows/prism-audit/workflow.toon` | 3m | T2 |
| T12 | Add executionModel to prism-evaluate | `workflows/prism-evaluate/workflow.toon` | 3m | T2 |
| T13 | Add executionModel to prism-update | `workflows/prism-update/workflow.toon` | 3m | T2 |
| T14 | Add executionModel to substrate-node-security-audit | `workflows/substrate-node-security-audit/workflow.toon` | 8m | T2 |
| T15 | Add executionModel to cicd-pipeline-security-audit | `workflows/cicd-pipeline-security-audit/workflow.toon` | 5m | T2 |
| T16 | Add executionModel to meta | `workflows/meta/workflow.toon` | 3m | T2 |
| T17 | Add executionModel to workflow-design | `workflows/workflow-design/workflow.toon` | 3m | T2 |
| T18 | Add executionModel to work-packages | `workflows/work-packages/workflow.toon` | 3m | T2 |

### Phase 4: Tool Update

| # | Task | File(s) | Estimate | Dependencies |
|---|------|---------|----------|-------------|
| T19 | Add `executionModel` to get_workflow summary projection | `src/tools/workflow-tools.ts` | 2m | T2 |

### Phase 5: Tests

| # | Task | File(s) | Estimate | Dependencies |
|---|------|---------|----------|-------------|
| T20 | Update `makeWorkflow` helper with default executionModel | `tests/validation.test.ts` | 5m | T2 |
| T21 | Add ExecutionModel validation tests (valid, invalid, edge cases) | `tests/schema-validation.test.ts` | 20m | T3 |
| T22 | Add unique role ID validation test | `tests/schema-validation.test.ts` | 10m | T3 |
| T23 | Add summary executionModel assertion to MCP test | `tests/mcp-server.test.ts` | 5m | T19 |

### Phase 6: Verification

| # | Task | File(s) | Estimate | Dependencies |
|---|------|---------|----------|-------------|
| T24 | Run `npm run typecheck` | — | 2m | T1-T23 |
| T25 | Run `npm test` | — | 5m | T24 |
| T26 | Verify Zod ↔ JSON Schema consistency | Manual review | 10m | T8 |

---

## 3. Dependency Graph

```
T1 (AgentRole/ExecutionModel schemas)
├── T2 (add to WorkflowSchema)
│   ├── T3 (.refine() unique IDs)
│   │   ├── T4 (verify .refine() callers)
│   │   ├── T21 (validation tests)
│   │   └── T22 (unique ID test)
│   ├── T5 (type exports)
│   ├── T9-T18 (TOON migration, all parallel)
│   ├── T19 (summary projection)
│   │   └── T23 (MCP summary test)
│   └── T20 (makeWorkflow helper)
├── T6 (JSON agentRole)
│   └── T7 (JSON executionModel)
│       └── T8 (JSON properties + required)
│           └── T26 (Zod ↔ JSON consistency)
└── T24 (typecheck) → T25 (tests)
```

---

## 4. Implementation Order

Execute in this order for a clean build at each step:

1. **T1-T5**: Schema definition (Zod). TypeScript compilation now requires executionModel everywhere `Workflow` is used.
2. **T20**: Update test helper immediately (fixes TypeScript compilation in tests).
3. **T6-T8**: JSON Schema changes (independent of Zod, can be parallel).
4. **T9-T18**: TOON migration (fixes integration tests that load workflows from disk).
5. **T19**: Summary projection (one-line tool change).
6. **T21-T23**: New tests.
7. **T24-T26**: Verification.

---

## 5. Estimates Summary

| Phase | Tasks | Estimate |
|-------|-------|----------|
| Schema Definition | T1-T5 | 32m |
| JSON Schema | T6-T8 | 25m |
| TOON Migration | T9-T18 | 41m |
| Tool Update | T19 | 2m |
| Tests | T20-T23 | 40m |
| Verification | T24-T26 | 17m |
| **Total** | **26 tasks** | **~2.5h agentic** |

**Human review:** 30-60m for schema review and TOON migration spot-check.

---

## 6. Commit Strategy

Single commit with clear message:

```
feat: add executionModel schema for multi-agent workflow support (#84)

Add required executionModel field to WorkflowSchema with per-workflow
role declarations. Migrate all 10 workflows with appropriate roles.

- AgentRoleSchema: { id, description }
- ExecutionModelSchema: { roles[] } with unique ID validation
- JSON Schema: agentRole + executionModel definitions
- get_workflow summary: includes executionModel
- Tests: 8 new validation tests + helper updates
```

TOON file changes are in the `workflows` worktree — these must be committed and pushed to the `workflows` branch separately, then the worktree reference updated in the parent repo.
