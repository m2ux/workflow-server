# WP-03: Zod Schema Alignment

## Scope

**In scope:**
- QC-002: Align required fields between JSON Schema and Zod (Critical)
- QC-012: Add `defaultOption` and `autoAdvanceMs` to CheckpointSchema
- QC-040: Add `action` field to ArtifactSchema
- QC-041: Add `skipCheckpoints` to ModeOverrideSchema
- QC-042: Audit `.passthrough()` usage — skills vs activities consistency
- QC-043: Fix `evaluateSimpleCondition` strict equality (`===` for `==` operator)
- QC-044: Align activity schema `additionalProperties` behavior with JSON Schema
- QC-101: Consolidate SemanticVersionSchema (defined 3 times)
- QC-102: `getVariableValue` silent `undefined` on missing path segment
- QC-103: `createInitialState` validate `initialActivity` exists in workflow
- QC-104: `addHistoryEvent` validate `details` spread

**Out of scope:**
- JSON Schema changes (WP-02)
- Cross-schema sync tooling (WP-04)

**Files:** `src/schema/activity.schema.ts`, `src/schema/skill.schema.ts`, `src/schema/workflow.schema.ts`, `src/schema/condition.schema.ts`, `src/schema/state.schema.ts`

## Dependencies

None. Zod changes are independent of JSON Schema changes.

## Effort

11 findings across 5 schema files. Medium scope.

## Success Criteria

- Zod and JSON Schema agree on required fields for workflow definitions
- Missing fields added to Zod schemas match JSON Schema definitions
- `evaluateSimpleCondition` handles type coercion for `==` operator
- SemanticVersionSchema defined once and imported
- `npm run typecheck` and `npm test` pass
