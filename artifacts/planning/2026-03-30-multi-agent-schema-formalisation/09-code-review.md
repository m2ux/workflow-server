# Code Review — Multi-Agent Schema Formalisation

**Activity:** post-impl-review (v1.7.0)  
**Date:** 2026-03-30  
**Scope:** `git diff main...HEAD` — 8 files, +220/-20 lines

---

## Findings

### Critical: None

### High: None

### Medium: None

### Low

**L-01: JSON Schema `$ref` with sibling `description` (informational divergence)**  
File: `schemas/workflow.schema.json` L203-206  
```json
"executionModel": {
  "$ref": "#/definitions/executionModel",
  "description": "Declares the agent roles that participate in workflow execution"
}
```
In JSON Schema Draft-07, sibling keywords next to `$ref` are technically ignored by the specification. The `description` here is dead metadata per the spec, though many tools (VS Code, IntelliJ) do display it. This is a documentation convenience, not a bug. No other property in this file combines `$ref` with `description` at the property level.  
**Recommendation:** Keep as-is. The documentation value outweighs the spec pedantry. Note for future: Draft 2019-09+ supports `$ref` siblings natively.

### Informational

**I-01: `.strict()` is inconsistent with ModeSchema**  
AgentRoleSchema and ExecutionModelSchema use `.strict()` while ModeSchema (the structural pattern they follow) does not. Both have `additionalProperties: false` in JSON Schema. The new code is more correct — `.strict()` makes Zod behavior match JSON Schema. The inconsistency is pre-existing (ModeSchema should also use `.strict()` but changing it is out of scope).

**I-02: No minLength on role `id` or `description`**  
Empty strings pass validation (`{ id: '', description: '' }`). This is consistent with how string fields are handled across all schema types (ModeSchema, StepSchema, etc.) — none have minLength constraints. Adding it would be a policy change across the codebase, not specific to this PR.

**I-03: Role ID format is unconstrained**  
Role IDs can contain any characters (spaces, special characters, unicode). All other ID fields in the schema (workflow.id, activity.id, mode.id) are similarly unconstrained. A format constraint (e.g., `^[a-z][a-z0-9-]*$`) could be added later if needed.

---

## Verification Checklist

| Check | Result |
|-------|--------|
| Zod ↔ JSON Schema field parity | ✅ All fields match |
| Zod ↔ JSON Schema required parity | ✅ Both require [id, description] on role, [roles] on executionModel, executionModel on workflow |
| Zod ↔ JSON Schema additionalProperties parity | ✅ Both use false / .strict() |
| `.refine()` doesn't break callers | ✅ No `.shape`/`.extend()` usage on WorkflowSchema |
| Type exports complete | ✅ AgentRole, ExecutionModel types + schemas exported |
| Summary projection includes executionModel | ✅ One-line addition at correct position |
| Existing tests updated | ✅ makeWorkflow helper, existing WorkflowSchema tests |
| New tests added | ✅ 14 new test cases |
| TypeScript compiles | ✅ `npm run typecheck` clean |
| All tests pass | ✅ 262/262 |

---

## Recommendation

**APPROVE** — No critical, high, or medium findings. Three informational observations are pre-existing patterns, not regressions. The implementation is clean, minimal, and well-tested.
