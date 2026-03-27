# WP-02: JSON Schema Corrections

## Scope

**In scope:**
- QC-001: Add `activities` property to workflow schema (Critical)
- QC-013: Fix condition `and`/`or` recursive validation (`items: {}` → `$ref`)
- QC-061, QC-062: Align `additionalProperties` policy across activity/skill schemas
- QC-065: Make `currentActivity` optional for completed/aborted workflows
- QC-066: Address relative `$ref` resolution fragility
- QC-067: Type-constrain `setVariable` values
- QC-068: Condition `simple.value` type gap with array/object variables
- QC-069: `rules` naming collision (string arrays vs key-value objects)
- QC-122: `triggers` plural naming vs single-object type
- QC-123: Skill sub-definition `additionalProperties: true` audit
- QC-124: `mode.defaults` asymmetric validation depth
- QC-125: `stateVersion` unbounded
- QC-126: State `variables` untyped
- QC-127: Cross-schema `rules` type inconsistency

**Out of scope:**
- Zod schema changes (WP-03)
- README documentation updates (WP-12)

**Files:** `schemas/workflow.schema.json`, `schemas/activity.schema.json`, `schemas/skill.schema.json`, `schemas/condition.schema.json`, `schemas/state.schema.json`

## Dependencies

None. JSON schema changes are independent.

## Effort

15 findings across 5 schema files. Medium scope — most changes are property additions or type constraint tightening.

## Success Criteria

- Workflow schema accepts documents containing `activities` property
- Condition schemas enforce recursive `$ref` for nested conditions
- `additionalProperties` policy is consistent across all schemas (document exceptions)
- Schema validation tests pass with updated schemas
- `npm test` passes
