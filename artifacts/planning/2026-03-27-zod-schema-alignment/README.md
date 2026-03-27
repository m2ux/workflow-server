# WP-03: Zod Schema Alignment

## Problem Overview

The Zod runtime schemas in `src/schema/*.ts` have diverged from the JSON Schema definitions in `schemas/*.json` across 11 findings identified during audit. These mismatches cause runtime validation to accept data the JSON Schema rejects (or vice versa), missing fields that exist in JSON Schema but not Zod, inconsistent strictness policies (`.passthrough()` vs `additionalProperties: false`), and semantic bugs in condition evaluation.

## Scope

- **Files**: `src/schema/workflow.schema.ts`, `src/schema/activity.schema.ts`, `src/schema/skill.schema.ts`, `src/schema/condition.schema.ts`, `src/schema/state.schema.ts`
- **Findings**: 11 (1 Critical, 1 High, 4 Medium, 5 Low)
- **Issue**: #67
- **PR**: #70
- **Branch**: `fix/wp03-zod-schema-alignment`

## Findings Summary

| ID | Finding | Severity | File |
|----|---------|----------|------|
| QC-002 | Required-field mismatch between JSON Schema and Zod | Critical | workflow.schema.ts |
| QC-012 | CheckpointSchema missing `defaultOption`, `autoAdvanceMs` | High | activity.schema.ts |
| QC-040 | ArtifactSchema missing `action` field | Medium | activity.schema.ts |
| QC-041 | ModeOverrideSchema missing `skipCheckpoints` | Medium | activity.schema.ts |
| QC-042 | `.passthrough()` on skills but not activities | Medium | skill.schema.ts, activity.schema.ts |
| QC-043 | `evaluateSimpleCondition` uses `===` for `==` | Medium | condition.schema.ts |
| QC-044 | Activity JSON allows extras; Zod strips them | Medium | activity.schema.ts |
| QC-101 | SemanticVersionSchema defined 3 times | Low | workflow.schema.ts, skill.schema.ts, activity.schema.ts |
| QC-102 | `getVariableValue` silent `undefined` on missing path | Low | condition.schema.ts |
| QC-103 | `createInitialState` no `initialActivity` validation | Low | state.schema.ts |
| QC-104 | `addHistoryEvent` unvalidated `details` spread | Low | state.schema.ts |

## Status

- [x] Branch created
- [x] PR created (#70)
- [x] Planning artifacts written
- [x] Implementation complete
- [x] Tests passing (187/187)
- [x] PR review ready

**Status: ✅ Complete** — All 11 findings resolved. PR #70 ready for review.
