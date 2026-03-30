# Change Block Index — Multi-Agent Schema Formalisation

**Activity:** post-impl-review (v1.7.0)  
**Date:** 2026-03-30  
**Diff:** `git diff main...HEAD`

---

## File Summary

| # | File | +/- | Category |
|---|------|-----|----------|
| 1 | `.engineering` | 1/1 | Submodule ref (planning artifacts) |
| 2 | `schemas/workflow.schema.json` | 38/0 | JSON Schema definitions |
| 3 | `src/schema/workflow.schema.ts` | 22/1 | Zod schema definitions |
| 4 | `src/tools/workflow-tools.ts` | 1/0 | Summary projection |
| 5 | `src/types/workflow.ts` | 2/2 | Type barrel exports |
| 6 | `tests/mcp-server.test.ts` | 2/0 | MCP integration test |
| 7 | `tests/schema-validation.test.ts` | 151/16 | Schema validation tests |
| 8 | `tests/validation.test.ts` | 3/0 | Test helper update |
| **Total** | **8 files** | **220/20** | |

**Estimated review time:** 10-15 minutes

---

## Change Blocks

### Block 1: `.engineering` (submodule ref)
- Single line change: submodule commit pointer update
- Contains all planning artifacts (design philosophy, requirements, research, analysis, plan, test plan)
- **Review:** Skip — engineering artifacts reviewed during planning activities

### Block 2: `schemas/workflow.schema.json` (+38 lines)
**Hunk 2a** (L82): `agentRole` definition — id + description, both required, additionalProperties: false  
**Hunk 2b** (L98): `executionModel` definition — roles array with $ref to agentRole, minItems: 1, additionalProperties: false  
**Hunk 2c** (L200): `executionModel` property added to workflow definition  
**Hunk 2d** (L217): `executionModel` added to required array  
- **Review:** Verify JSON Schema mirrors Zod schema exactly. Check additionalProperties: false on both new definitions.

### Block 3: `src/schema/workflow.schema.ts` (+22/-1 lines)
**Hunk 3a** (L40): `AgentRoleSchema` — z.object with .strict(), two required string fields  
**Hunk 3b** (L47): `ExecutionModelSchema` — z.object with .strict(), roles array min(1)  
**Hunk 3c** (L66): `executionModel` field added to WorkflowSchema (required, no .optional())  
**Hunk 3d** (L70): `.refine()` added for unique role ID validation  
- **Review:** Core schema change. Verify .strict() matches JSON Schema additionalProperties: false. Verify .refine() error path.

### Block 4: `src/tools/workflow-tools.ts` (+1 line)
**Hunk 4a** (L94): `executionModel: wf.executionModel` added to summary projection  
- **Review:** One-line addition. Verify field is in the correct position in the summary object.

### Block 5: `src/types/workflow.ts` (+2/-2 lines)
**Hunk 5a** (L35-36): Added AgentRole, ExecutionModel type exports and AgentRoleSchema, ExecutionModelSchema schema exports  
- **Review:** Verify all new types and schemas are exported.

### Block 6: `tests/mcp-server.test.ts` (+2 lines)
**Hunk 6a** (L723-724): Two assertions: `wf.executionModel` and `wf.executionModel.roles` are defined in summary response  
- **Review:** Verify assertions are in the correct test case (summary mode test).

### Block 7: `tests/schema-validation.test.ts` (+151/-16 lines)
**Hunk 7a** (L3-8): Import AgentRoleSchema and ExecutionModelSchema  
**Hunk 7b** (L300-315): Extract shared test fixtures (minimalActivity, minimalExecutionModel)  
**Hunk 7c** (L316-370): Update 4 existing WorkflowSchema tests to include executionModel + add "reject without executionModel" test  
**Hunk 7d** (L372-454): New ExecutionModelSchema test suite (9 tests: 3 valid, 6 invalid)  
**Hunk 7e** (L456-500): New unique role ID test suite (2 tests: accept unique, reject duplicate)  
- **Review:** Verify test coverage: valid inputs, invalid inputs, strict mode, unique IDs, edge cases.

### Block 8: `tests/validation.test.ts` (+3 lines)
**Hunk 8a** (L34-36): Add default executionModel to makeWorkflow helper  
- **Review:** Verify minimal valid executionModel object.
