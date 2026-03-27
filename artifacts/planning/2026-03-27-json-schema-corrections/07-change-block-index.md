# WP-02 Change Block Index

**Commit:** `e4fb4b3` — fix: correct 15 JSON Schema defects across 5 schema files
**Branch:** fix/wp02-json-schema-corrections
**Files changed:** 5 | **+76 −35** lines

---

## File Index

| # | File | Hunks | Lines | Findings |
|---|------|-------|-------|----------|
| 1 | schemas/condition.schema.json | 4 | +5 −3 | QC-013, QC-066, QC-068 |
| 2 | schemas/workflow.schema.json | 4 | +14 −3 | QC-001, QC-066, QC-069, QC-124 |
| 3 | schemas/activity.schema.json | 5 | +11 −5 | QC-061, QC-066, QC-067, QC-069, QC-122 |
| 4 | schemas/skill.schema.json | 17 | +22 −17 | QC-062, QC-066, QC-123, QC-127 |
| 5 | schemas/state.schema.json | 8 | +24 −7 | QC-065, QC-066, QC-125, QC-126 |

---

## Hunk Details

### 1. condition.schema.json (+5 −3)

| Hunk | Lines | Change |
|------|-------|--------|
| H1 | L2 | Add `$id: "condition.schema.json"` (QC-066) |
| H2 | L41-44 | Update `value` description to explain array/object exclusion (QC-068) |
| H3 | L62-84 | `and`/`or` conditions: `items: {}` → `items: { "$ref": "#/definitions/condition" }` (QC-013) |
| H4 | L105 | `not` condition: add `$ref` to `condition` property (QC-013) |

### 2. workflow.schema.json (+14 −3)

| Hunk | Lines | Change |
|------|-------|--------|
| H1 | L2 | Add `$id: "workflow.schema.json"` (QC-066) |
| H2 | L69-73 | `mode.defaults`: `additionalProperties: {}` → typed constraint (QC-124) |
| H3 | L142-145 | `rules` description: add type documentation and cross-reference (QC-069) |
| H4 | L168-181 | Add `activities` property (array, minItems: 1, `$ref` to activity); add to `required` (QC-001) |

### 3. activity.schema.json (+11 −5)

| Hunk | Lines | Change |
|------|-------|--------|
| H1 | L2 | Add `$id: "activity.schema.json"` (QC-066) |
| H2 | L87-91 | `setVariable`: `additionalProperties: {}` → typed constraint (QC-067) |
| H3 | L442-448 | `triggers`: single `$ref` → `type: "array"` with `items.$ref` (QC-122) |
| H4 | L491-494 | `rules` description: add type documentation and cross-reference (QC-069) |
| H5 | L555 | `activity.additionalProperties`: `true` → `false` (QC-061) |

### 4. skill.schema.json (+22 −17)

| Hunk | Lines | Change |
|------|-------|--------|
| H1 | L2 | Add `$id: "skill.schema.json"` (QC-066) |
| H2-H16 | Various | 15 `additionalProperties: true` → `false` across sub-definitions: toolDefinition, errorDefinition, executionPattern, architecture, matching, stateDefinition, interpretation, numericFormat, initialization (+ state inner), updatePattern, resumption, inputItemDefinition, protocolStep, outputArtifact, outputItemDefinition (QC-123) |
| H17 | L490 | `skill.additionalProperties`: `true` → `false` (QC-062) |
| — | L350 | `rulesDefinition` description: add type documentation and cross-reference (QC-127) |
| — | L264 | `initialization.state`: `additionalProperties: true` → typed constraint (QC-067 symmetric) |

### 5. state.schema.json (+24 −7)

| Hunk | Lines | Change |
|------|-------|--------|
| H1 | L2 | Add `$id: "state.schema.json"` (QC-066) |
| H2 | L19-21 | `passedContext`: `additionalProperties: {}` → typed (QC-126) |
| H3 | L82-84 | `returnedContext`: `additionalProperties: {}` → typed (QC-126) |
| H4 | L146 | `stateVersion`: add `maximum: 1000` (QC-125) |
| H5 | L223-225 | `variablesSet`: `additionalProperties: {}` → typed (QC-126) |
| H6 | L313-315 | `variables`: `additionalProperties: {}` → typed (QC-126) |
| H7 | L380-382 | `data`: `additionalProperties: {}` → typed (QC-126) |
| H8 | L456-466 | Remove `currentActivity` from `required`; add `if/then` conditional (QC-065) |
