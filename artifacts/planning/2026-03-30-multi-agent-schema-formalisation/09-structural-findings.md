# Structural Analysis — Multi-Agent Schema Formalisation

**Activity:** post-impl-review (v1.7.0)  
**Date:** 2026-03-30  
**Method:** Inline L12 structural analysis (lightweight, in lieu of full prism dispatch)

---

## 1. Cohesion Analysis

**All new code is in a single file** (`workflow.schema.ts`), which is the correct location. The new types follow the existing pattern: schema definition → type export → function re-export. No new files were created. No new modules were introduced.

| Construct | Location | Cohesion |
|-----------|----------|----------|
| AgentRoleSchema | workflow.schema.ts L42-46 | ✅ High — co-located with other schema definitions |
| ExecutionModelSchema | workflow.schema.ts L49-52 | ✅ High — references AgentRoleSchema defined 3 lines above |
| executionModel field | WorkflowSchema L66 | ✅ High — at correct level in the schema |
| .refine() | WorkflowSchema L71-77 | ✅ High — validates cross-field concern within the same schema |

## 2. Coupling Analysis

**New coupling introduced:** Zero new module dependencies. The change is entirely self-contained within the existing module boundary.

| From | To | Type | Pre-existing? |
|------|----|------|---------------|
| workflow.schema.ts | zod | Import | Yes |
| workflow.schema.ts | activity.schema.js | Import | Yes |
| workflow.schema.ts | common.js | Import | Yes |
| types/workflow.ts | workflow.schema.js | Re-export | Yes (expanded) |

No new imports. No new files. No cross-module dependencies introduced.

## 3. Complexity Analysis

**Cyclomatic complexity of .refine() callback:** 1 (single path — map + Set comparison). No branching logic.

**Schema nesting depth:** AgentRole (depth 0) → ExecutionModel.roles[] (depth 1) → WorkflowSchema.executionModel (depth 2). This matches the nesting pattern of Mode (depth 0) → WorkflowSchema.modes[] (depth 1).

## 4. Consistency Analysis

| Dimension | New Code | Existing Pattern | Consistent? |
|-----------|----------|------------------|-------------|
| Schema naming | `AgentRoleSchema`, `ExecutionModelSchema` | `ModeSchema`, `VariableDefinitionSchema` | ✅ Yes — PascalCase + "Schema" suffix |
| Type naming | `AgentRole`, `ExecutionModel` | `Mode`, `VariableDefinition` | ✅ Yes |
| `.describe()` usage | On all fields | On most fields | ✅ Yes |
| `.strict()` usage | On AgentRole and ExecutionModel | On SkillSchema only | ⚠️ Stricter than ModeSchema (which lacks .strict()) |
| `.refine()` usage | On WorkflowSchema | On WorkflowStateSchema | ✅ Yes — established pattern |
| JSON Schema placement | Definitions before `workflow` | Same order | ✅ Yes |

## 5. Surface Area Assessment

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Exported types from workflow.schema.ts | 4 | 6 | +2 |
| Exported schemas from workflow.schema.ts | 4 | 6 | +2 |
| WorkflowSchema field count | 13 | 14 | +1 |
| JSON Schema definitions | 3 | 5 | +2 |
| Total schema file LOC | 76 | 97 | +21 |

The public API surface grows by 4 exports (2 types + 2 schemas). This is proportional to the feature scope.

## 6. Risk Assessment

**Regression risk:** LOW. The change is additive — new types, new field, new tests. No existing behavior is modified. The only modification to existing code is the `makeWorkflow` test helper (adding a default field) and the summary projection (adding one field).

**Evolution risk:** MEDIUM. The `.strict()` on ExecutionModelSchema means adding any new field requires a schema version bump. This is intentional (user decision Q8) but means future extensions (constraints, cardinality, metadata) require coordinated schema changes.
