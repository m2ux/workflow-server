# WP-03: Zod Schema Alignment — COMPLETE

**Completed:** 2026-03-27
**PR:** [#70](https://github.com/m2ux/workflow-server/pull/70)
**Issue:** [#67](https://github.com/m2ux/workflow-server/issues/67)
**Branch:** `fix/wp03-zod-schema-alignment`
**Commit:** `a47a320`

## Findings Resolved

All 11 findings from the QC audit have been addressed:

| ID | Severity | Resolution |
|----|----------|-----------|
| QC-002 | Critical | Documented intentional `activities` divergence (TOON vs runtime) |
| QC-012 | High | Added `defaultOption`, `autoAdvanceMs` to `CheckpointSchema` |
| QC-040 | Medium | Added `action` enum to `ArtifactSchema` |
| QC-041 | Medium | Added `skipCheckpoints` to `ModeOverrideSchema` |
| QC-042 | Medium | Removed `.passthrough()` from all 15 skill sub-schemas |
| QC-043 | Medium | Changed `===`/`!==` to `==`/`!=` for loose equality |
| QC-044 | Medium | Verified `ActivitySchema` already strips unknowns |
| QC-101 | Low | Extracted `SemanticVersionSchema` to shared `common.ts` |
| QC-102 | Low | Documented `getVariableValue` silent undefined as intentional |
| QC-103 | Low | Documented `createInitialState` caller-validates `initialActivity` |
| QC-104 | Low | Documented `addHistoryEvent` type-safety via `Partial<Omit<...>>` |

## Files Changed

| File | Change |
|------|--------|
| `src/schema/common.ts` | New shared module |
| `src/schema/workflow.schema.ts` | Import shared schema, document divergence |
| `src/schema/activity.schema.ts` | Import shared schema, add 4 fields |
| `src/schema/skill.schema.ts` | Import shared schema, remove 15x `.passthrough()` |
| `src/schema/condition.schema.ts` | Fix equality operators, add JSDoc |
| `src/schema/state.schema.ts` | Add JSDoc to helper functions |

## Verification

- **Typecheck:** 0 errors
- **Tests:** 187/187 passed
- **Lint:** Clean
