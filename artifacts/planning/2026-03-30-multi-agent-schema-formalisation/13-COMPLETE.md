# Completion Summary — Multi-Agent Schema Formalisation

**Date:** 2026-03-30  
**Issue:** [#84](https://github.com/m2ux/workflow-server/issues/84)  
**PR:** [#85](https://github.com/m2ux/workflow-server/pull/85)  
**ADR:** [0002-execution-model-schema](../../adr/0002-execution-model-schema.md)

---

## Deliverables

| Deliverable | Status |
|-------------|--------|
| `AgentRoleSchema` (Zod) | ✅ Shipped |
| `ExecutionModelSchema` (Zod) | ✅ Shipped |
| `executionModel` field on `WorkflowSchema` | ✅ Shipped |
| `.refine()` for unique role IDs | ✅ Shipped |
| JSON Schema definitions (`agentRole`, `executionModel`) | ✅ Shipped |
| `get_workflow` summary projection | ✅ Shipped |
| Type barrel exports (`AgentRole`, `ExecutionModel`) | ✅ Shipped |
| TOON migration (10 workflows) | ✅ Shipped |
| 14 new test cases | ✅ Shipped |
| ADR-0002 | ✅ Shipped |

## Metrics

| Metric | Value |
|--------|-------|
| Source lines added | 27 |
| Test lines added | 172 |
| JSON Schema lines added | 38 |
| Files changed | 8 (+ 10 TOON files on workflows branch) |
| Tests passing | 262/262 |
| New schema types | 2 (`AgentRole`, `ExecutionModel`) |
| Workflows migrated | 10/10 |
| Assumptions tracked | 27 (0 open) |
| Activities completed | 13 |

## Test Coverage

| Requirement | Test Cases | File |
|-------------|-----------|------|
| FR-01: Required field | V1-V3, W2 | `tests/schema-validation.test.ts` |
| FR-02: AgentRole schema | I3-I6 | `tests/schema-validation.test.ts` |
| FR-03: Unique role IDs | U1-U2 | `tests/schema-validation.test.ts` |
| FR-04: Non-empty roles | I2 | `tests/schema-validation.test.ts` |
| FR-06: TOON migration | Integration (workflow-loader) | `tests/workflow-loader.test.ts` |
| FR-07: Summary inclusion | S1 | `tests/mcp-server.test.ts` |
| NFR-07: Strict schema | I5-I6 | `tests/schema-validation.test.ts` |

## Deferred Items

| Item | Tracking | Notes |
|------|----------|-------|
| Activity-level execution model overrides | Future WP | A-02: can add `executionModelOverride` to ActivitySchema |
| Worker persistence field | Future WP | A-04: can add optional `persistence` to AgentRoleSchema |
| Runtime enforcement | [#65](https://github.com/m2ux/workflow-server/issues/65) | A-06: server validates agent behaviour against declared roles |
| State/session agent tracking | Future WP | A-01: add agent identity to SessionPayload/WorkflowState |
| Mode-execution model interaction | Future WP | Q5: ModeSchema override for execution model |
| Dynamic role cardinality | Future WP | Q2: optional cardinality field |
| Structured behavioural constraints | Future WP | Q1/Q3: role-level constraints array |

## Known Limitations

1. **Semantic gap**: No machine-readable link between role declarations and prose behavioural rules. Agents must read both `executionModel.roles` and `rules[]`.
2. **No runtime tracking**: The server knows what roles a workflow declares but not which agent is currently filling which role.
3. **Strict evolution**: Adding any field to the execution model requires a schema version bump.
4. **Empty string IDs**: `{ id: '', description: '' }` passes validation. Consistent with codebase-wide string handling.
