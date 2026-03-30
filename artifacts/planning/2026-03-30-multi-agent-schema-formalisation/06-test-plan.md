# Test Plan — Multi-Agent Schema Formalisation

**Activity:** plan-prepare (v1.4.0)  
**Date:** 2026-03-30  
**Issue:** [#84](https://github.com/m2ux/workflow-server/issues/84)

---

## 1. Test Scope

### In Scope
- ExecutionModel Zod schema validation (valid, invalid, edge cases)
- Unique role ID refinement validation
- Integration with existing workflow loading pipeline
- get_workflow summary projection includes executionModel

### Out of Scope
- Runtime enforcement of execution model (A-06: descriptive only)
- Activity-level execution model overrides (A-02: workflow-level only)
- State/session agent tracking (A-01: definition schemas only)

---

## 2. Schema Validation Tests

### 2.1 ExecutionModel — Valid Inputs

| # | Test Case | Input | Expected |
|---|-----------|-------|----------|
| V1 | Minimal valid model | `{ roles: [{ id: "agent", description: "Single agent" }] }` | Pass |
| V2 | Two-role model | `{ roles: [{ id: "orchestrator", description: "..." }, { id: "worker", description: "..." }] }` | Pass |
| V3 | Many roles | 7+ roles (substrate-audit pattern) | Pass |

### 2.2 ExecutionModel — Invalid Inputs

| # | Test Case | Input | Expected Error |
|---|-----------|-------|----------------|
| I1 | Missing roles | `{}` | Required: roles |
| I2 | Empty roles array | `{ roles: [] }` | Array must contain at least 1 element |
| I3 | Role missing id | `{ roles: [{ description: "..." }] }` | Required: id |
| I4 | Role missing description | `{ roles: [{ id: "agent" }] }` | Required: description |
| I5 | Extra property on role | `{ roles: [{ id: "x", description: "...", goal: "..." }] }` | Unrecognized key (strict) |
| I6 | Extra property on executionModel | `{ roles: [...], type: "orchestrator" }` | Unrecognized key (strict) |

### 2.3 Unique Role ID Refinement

| # | Test Case | Input | Expected |
|---|-----------|-------|----------|
| U1 | Unique IDs pass | `{ roles: [{ id: "a", ... }, { id: "b", ... }] }` | Pass |
| U2 | Duplicate IDs fail | `{ roles: [{ id: "worker", ... }, { id: "worker", ... }] }` | Refinement error: unique IDs |

### 2.4 Workflow-Level Integration

| # | Test Case | Input | Expected |
|---|-----------|-------|----------|
| W1 | Workflow with executionModel passes | Full workflow object with executionModel | Pass |
| W2 | Workflow without executionModel fails | Full workflow object, no executionModel | Required: executionModel |
| W3 | Loaded work-package passes validation | `loadWorkflow('work-package')` → `safeValidateWorkflow` | Pass (existing integration test, auto-passes after TOON migration) |

---

## 3. Tool Tests

### 3.1 get_workflow Summary

| # | Test Case | Method | Expected |
|---|-----------|--------|----------|
| S1 | Summary includes executionModel | Call get_workflow with summary=true, assert `wf.executionModel` is defined | `executionModel` present with roles array |
| S2 | Full mode includes executionModel | Call get_workflow with summary=false, assert `wf.executionModel` is defined | `executionModel` present (auto — JSON.stringify) |

---

## 4. Test Helper Updates

### 4.1 makeWorkflow (validation.test.ts)

Update the `makeWorkflow` factory function to include a default `executionModel`:

```typescript
function makeWorkflow(overrides: Partial<Workflow> = {}): Workflow {
  return {
    id: 'test-wf',
    version: '1.0.0',
    title: 'Test Workflow',
    executionModel: {
      roles: [{ id: 'agent', description: 'Default test agent' }],
    },
    activities: [/* existing */],
    ...overrides,
  };
}
```

This ensures all 11 existing test calls continue to work without modification.

---

## 5. Coverage Matrix

| Requirement | Test Cases | Coverage |
|-------------|-----------|----------|
| FR-01: ExecutionModel field | W1, W2 | ✅ |
| FR-02: AgentRole schema | V1-V3, I3-I6 | ✅ |
| FR-03: Unique role IDs | U1, U2 | ✅ |
| FR-04: Non-empty roles | I2 | ✅ |
| FR-05: JSON Schema sync | T26 (manual) | ✅ |
| FR-06: TOON migration | W3 (integration) | ✅ |
| FR-07: Summary inclusion | S1, S2 | ✅ |
| NFR-07: Strict schema | I5, I6 | ✅ |

---

## 6. Test Count Summary

| Category | New Tests | Updated Tests |
|----------|-----------|---------------|
| ExecutionModel valid | 3 (V1-V3) | — |
| ExecutionModel invalid | 6 (I1-I6) | — |
| Unique role ID | 2 (U1-U2) | — |
| Workflow integration | 1 (W2) | 1 (W1 — existing auto-passes) |
| Summary projection | 1 (S1) | — |
| **Total** | **13 new** | **1 updated** |

Plus: `makeWorkflow` helper update (affects 11 existing tests, no new test code).
