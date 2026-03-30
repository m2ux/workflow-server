# Implementation Analysis — Multi-Agent Schema Formalisation

**Activity:** implementation-analysis (v2.5.0)  
**Date:** 2026-03-30  
**Issue:** [#84](https://github.com/m2ux/workflow-server/issues/84)

---

## 1. Current State Analysis

### 1.1 How Multi-Agent Requirements Are Currently Expressed

Multi-agent execution requirements exist only as prose strings in workflow-level `rules[]` arrays. There is no machine-readable representation.

**Example** (work-package/workflow.toon rule #9):
```
"EXECUTION MODEL: This workflow uses an orchestrator/worker pattern. The agent 
receiving the user request acts AS the orchestrator inline..."
```

**Problems with prose-only:**
- **No discoverability**: Agents must read and interpret free-text rules to determine if multi-agent execution is required
- **No validation**: The server cannot verify execution model requirements. Invalid or incomplete declarations pass silently.
- **Inconsistency**: Each workflow author writes rules differently. "orchestrator/worker" in work-package vs "orchestrator with disposable workers" in prism vs unnamed "sub-agents" in substrate-audit.
- **No tooling support**: IDE rules, session management, and summary responses have no structured execution model data.

### 1.2 Multi-Agent Rule Distribution

| Workflow | TOON Lines | Multi-Agent Rules | Execution Pattern |
|----------|-----------|-------------------|-------------------|
| substrate-node-security-audit | 110 | 14 | Named multi-agent (R, S, A1-7, B, D1-2, V, M) |
| prism | 115 | 10 | Orchestrator + disposable workers |
| cicd-pipeline-security-audit | 87 | 10 | Named multi-agent (S1-n, V, M) |
| prism-evaluate | 101 | 6 | Orchestrator + disposable workers |
| work-package | 252 | 5 | Orchestrator + persistent worker |
| prism-audit | 82 | 5 | Orchestrator + disposable workers |
| prism-update | 66 | 1 | Orchestrator + workers (minimal) |
| meta | 66 | 1 | Single-agent (false positive — "worker" in other context) |
| workflow-design | 126 | 0 | Single-agent |
| work-packages | 82 | 0 | Single-agent |
| **Total** | **1,087** | **52** | **3 distinct patterns** |

---

## 2. Integration Points

### 2.1 Files That Must Change

| # | File | Change | Complexity |
|---|------|--------|------------|
| 1 | `src/schema/workflow.schema.ts` | Add `AgentRoleSchema`, `ExecutionModelSchema`; add `executionModel` field to `WorkflowSchema`; add `.refine()` for unique role IDs | Low |
| 2 | `schemas/workflow.schema.json` | Add `agentRole` and `executionModel` definitions; add `executionModel` to workflow `properties` and `required` | Low |
| 3 | `src/tools/workflow-tools.ts` L95 | Add `executionModel: wf.executionModel` to summary projection | Trivial (1 line) |
| 4 | `tests/schema-validation.test.ts` | Add ExecutionModel validation tests (valid, invalid, edge cases) | Moderate |
| 5 | `tests/validation.test.ts` L30-55 | Update `makeWorkflow` helper to include `executionModel` | Low |
| 6 | `tests/mcp-server.test.ts` L722 | Optionally add `expect(wf.executionModel).toBeDefined()` to summary test | Trivial |
| 7-16 | 10 workflow TOON files | Add `executionModel:` block with roles | Moderate (bulk) |

### 2.2 Files That Must NOT Change

| File | Reason |
|------|--------|
| `src/loaders/workflow-loader.ts` | New field passes through `decodeToonRaw → safeValidateWorkflow` pipeline unchanged |
| `src/loaders/activity-loader.ts` | No activity-level execution model (A-02) |
| `src/schema/activity.schema.ts` | No activity-level changes |
| `src/schema/state.schema.ts` | State tracking out of scope (A-01) |
| `src/utils/session.ts` | Session out of scope (A-01) |
| `src/trace.ts` | Trace out of scope (A-01) |
| `schemas/activity.schema.json` | No activity-level changes |

### 2.3 Implementation Order Constraint

The implementation must be **atomic** — all changes must be in the same build:

```
1. Update Zod schema         → TypeScript requires executionModel in Workflow type
2. Update JSON Schema         → IDE validation changes
3. Update makeWorkflow helper → validation.test.ts compiles
4. Update all 10 TOON files   → integration tests (workflow-loader, schema-validation) pass
5. Update summary projection  → get_workflow includes executionModel
6. Add new schema tests       → verify executionModel validation
```

If any step is omitted, either TypeScript compilation or tests will fail. The TOON file migration (step 4) is the largest single step — 10 files across the workflows worktree.

---

## 3. Baselines

### 3.1 Schema Metrics (Before)

| Metric | Value |
|--------|-------|
| WorkflowSchema fields | 13 (4 required: id, version, title, activities) |
| JSON Schema workflow properties | 13 |
| JSON Schema workflow required | 4 |
| JSON Schema definitions in workflow.schema.json | 3 (variable, mode, artifactLocation) |
| workflow.schema.ts lines | 76 |
| workflow.schema.json lines | 188 |

### 3.2 Schema Metrics (After — Projected)

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| WorkflowSchema fields | 13 | 14 | +1 |
| Required fields | 4 | 5 | +1 |
| JSON Schema properties | 13 | 14 | +1 |
| JSON Schema required | 4 | 5 | +1 |
| JSON Schema definitions | 3 | 5 | +2 (agentRole, executionModel) |
| workflow.schema.ts lines | 76 | ~95 | ~+19 |
| workflow.schema.json lines | 188 | ~230 | ~+42 |

### 3.3 Test Metrics

| Test File | Cases (Before) | Projected New | Notes |
|-----------|---------------|---------------|-------|
| schema-validation.test.ts | 26 | +6-8 | ExecutionModel valid/invalid/edge cases |
| workflow-loader.test.ts | 26 | 0 | Integration tests auto-pass after TOON migration |
| validation.test.ts | 25 | 0 | Helper update only, no new test cases |
| mcp-server.test.ts | ~50 | +1 | Optional summary assertion |

### 3.4 Migration Metrics

| Metric | Value |
|--------|-------|
| TOON files to migrate | 10 |
| Total TOON lines | 1,087 |
| Lines to add per file | ~5-15 (depending on role count) |
| Workflows needing multi-agent roles | 7 |
| Workflows needing single-agent role | 3 |

---

## 4. Zod Schema Design

### 4.1 Proposed Schema (Exact Implementation)

```typescript
export const AgentRoleSchema = z.object({
  id: z.string().describe('Unique role identifier within this workflow'),
  description: z.string().describe('What this role does in the workflow execution'),
});
export type AgentRole = z.infer<typeof AgentRoleSchema>;

export const ExecutionModelSchema = z.object({
  roles: z.array(AgentRoleSchema).min(1).describe('Agent roles that participate in this workflow'),
});
export type ExecutionModel = z.infer<typeof ExecutionModelSchema>;
```

On WorkflowSchema (insert before `activities`):

```typescript
executionModel: ExecutionModelSchema.describe('Declares the agent roles that participate in workflow execution'),
```

### 4.2 Unique Role ID Validation

Add a `.refine()` to WorkflowSchema:

```typescript
export const WorkflowSchema = z.object({
  // ... existing fields ...
  executionModel: ExecutionModelSchema,
  activities: z.array(ActivitySchema).min(1),
}).refine(
  (wf) => {
    const ids = wf.executionModel.roles.map(r => r.id);
    return new Set(ids).size === ids.length;
  },
  { message: 'executionModel.roles must have unique IDs', path: ['executionModel', 'roles'] },
);
```

**Note:** Adding `.refine()` changes `WorkflowSchema` from a `ZodObject` to a `ZodEffects<ZodObject>`. This may affect code that uses `WorkflowSchema.shape` or extends the schema. Need to verify no callers depend on the `ZodObject` type specifically.

### 4.3 JSON Schema Design

New definitions in `workflow.schema.json`:

```json
"agentRole": {
  "type": "object",
  "description": "An agent role that participates in workflow execution",
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique role identifier within this workflow"
    },
    "description": {
      "type": "string",
      "description": "What this role does in the workflow execution"
    }
  },
  "required": ["id", "description"],
  "additionalProperties": false
},
"executionModel": {
  "type": "object",
  "description": "Declares agent roles that participate in workflow execution",
  "properties": {
    "roles": {
      "type": "array",
      "items": { "$ref": "#/definitions/agentRole" },
      "minItems": 1,
      "description": "Agent roles that participate in this workflow"
    }
  },
  "required": ["roles"],
  "additionalProperties": false
}
```

Add to workflow `properties`:
```json
"executionModel": { "$ref": "#/definitions/executionModel" }
```

Add `"executionModel"` to workflow `required` array.

**Note:** JSON Schema Draft-07 does not support `uniqueItems` on objects by property. Unique role ID validation is Zod-only (runtime). JSON Schema validates structure; Zod validates semantics.

---

## 5. Implementation Assumptions

All assumptions resolved through code analysis:

### IA-01: makeWorkflow helper requires executionModel

**Resolution:** CONFIRMED  
**Evidence:** `makeWorkflow` returns `Workflow` type (`z.infer<typeof WorkflowSchema>`). Adding a required field to WorkflowSchema makes TypeScript require it in the helper. The helper at `validation.test.ts:30-55` must be updated with a default executionModel.

### IA-02: workflow-loader tests use actual TOON files

**Resolution:** CONFIRMED  
**Evidence:** `workflow-loader.test.ts:14` sets `WORKFLOW_DIR = resolve(import.meta.dirname, '../workflows')`. Tests load `meta` and `work-package` from the actual workflows worktree. TOON migration must be in place before these tests pass.

### IA-03: schema-validation tests use actual TOON files

**Resolution:** CONFIRMED  
**Evidence:** `schema-validation.test.ts:270-277` loads `work-package` from the workflows directory and runs `safeValidateWorkflow`. TOON migration is required.

### IA-04: MCP server summary test doesn't verify executionModel

**Resolution:** CONFIRMED  
**Evidence:** `mcp-server.test.ts:711-728` checks `wf.rules`, `wf.variables`, `wf.activities` in summary but not `executionModel`. Adding an assertion is optional but recommended.

### IA-05: .refine() changes WorkflowSchema type

**Resolution:** NEEDS VERIFICATION during implementation  
**Evidence:** Adding `.refine()` to a `ZodObject` produces a `ZodEffects<ZodObject>`. If any code accesses `WorkflowSchema.shape` or uses `WorkflowSchema.extend()`, it will break. Quick grep shows no callers use `.shape` or `.extend()` on WorkflowSchema — `safeValidateWorkflow` and `validateWorkflow` use `.safeParse()` and `.parse()` which work on both `ZodObject` and `ZodEffects`. But this needs explicit verification during implementation.

---

## 6. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `.refine()` type change breaks callers | Low | Medium | Verify no `.shape`/`.extend()` usage before implementation |
| TOON migration misses a workflow | Low | High | Enumerate all 10 explicitly; run full test suite |
| Summary projection missing executionModel | Certain (without fix) | Medium | One-line fix in workflow-tools.ts |
| Test helper missing executionModel | Certain (without fix) | Medium | Update makeWorkflow helper |
| JSON Schema uniqueItems gap | N/A | Low | Unique ID validation is Zod-only; JSON Schema validates structure |
