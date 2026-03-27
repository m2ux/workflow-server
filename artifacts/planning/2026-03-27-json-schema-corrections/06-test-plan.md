# WP-02 Test Plan — JSON Schema Corrections

## Strategy

JSON Schema changes are validated at two levels:
1. **Structural validation** — Zod schema tests in `tests/schema-validation.test.ts` confirm that the runtime Zod schemas accept/reject the same inputs the JSON Schemas should.
2. **Regression** — Full test suite (`npm test`) ensures no existing functionality breaks.

Since WP-02 only modifies JSON Schema files (not Zod schemas — that's WP-03), the primary verification is that existing tests still pass and that new test cases are added to cover the corrected constraints.

---

## Test Cases by Finding

### TC-001: Workflow `activities` property (QC-001)

| # | Input | Expected |
|---|-------|----------|
| 1 | Workflow with `activities: [{ id, version, name, skills }]` | Valid |
| 2 | Workflow with `activities: []` | Invalid (minItems: 1) |
| 3 | Workflow without `activities` property | Invalid (required) |

**Existing coverage:** `schema-validation.test.ts` lines 264-329 already test workflows with `activities`. The test at line 302 (`should reject workflow without activities`) tests the empty array case. These tests use the Zod schema which already has this property.

**New tests needed:** None for Zod (already covered). JSON Schema validation should be verified manually or via a JSON Schema validator test.

---

### TC-002: Condition recursive validation (QC-013)

| # | Input | Expected |
|---|-------|----------|
| 1 | `and` with valid nested conditions | Valid |
| 2 | `and` with `conditions: ["not-a-condition", 123]` | Invalid |
| 3 | `or` with valid nested conditions | Valid |
| 4 | `or` with `conditions: [null, {}]` | Invalid |
| 5 | `not` with valid nested condition | Valid |
| 6 | `not` with `condition: "string"` | Invalid |
| 7 | Deeply nested: `and → or → not → simple` | Valid |

**Existing coverage:** Lines 17-80 cover basic valid cases. No negative test for non-condition items in `and`/`or` arrays.

**New tests needed:** Add negative tests for invalid sub-condition types in `and`, `or`, and `not`.

---

### TC-003: `additionalProperties` policy (QC-061, QC-062)

| # | Input | Expected |
|---|-------|----------|
| 1 | Activity with only known properties | Valid |
| 2 | Activity with unknown property `"foo": "bar"` | Depends on A-001 |
| 3 | Skill with unknown property `"foo": "bar"` | Valid (extensible) |
| 4 | Workflow with unknown property `"foo": "bar"` | Invalid (strict) |

**Existing coverage:** Not explicitly tested.

**New tests needed:** Add tests once A-001 is resolved.

---

### TC-004: `currentActivity` optional for terminal states (QC-065)

| # | Input | Expected |
|---|-------|----------|
| 1 | State with `status: "running"` and `currentActivity` | Valid |
| 2 | State with `status: "running"` without `currentActivity` | Invalid |
| 3 | State with `status: "completed"` without `currentActivity` | Valid |
| 4 | State with `status: "aborted"` without `currentActivity` | Valid |
| 5 | State with `status: "error"` without `currentActivity` | Valid |
| 6 | State with `status: "completed"` with `currentActivity` | Valid |

**Existing coverage:** Not explicitly tested.

**New tests needed:** Add state validation tests for terminal status without `currentActivity`.

---

### TC-005: `$id` resolution (QC-066)

| # | Verification | Expected |
|---|-------------|----------|
| 1 | All 5 schema files have `$id` property | Present |
| 2 | Activity schema `$ref: "condition.schema.json"` resolves | Valid |
| 3 | Workflow schema `$ref: "activity.schema.json"` resolves (new) | Valid |

**New tests needed:** Manual verification or schema loader test.

---

### TC-006: `setVariable` type constraints (QC-067)

| # | Input | Expected |
|---|-------|----------|
| 1 | `setVariable: { "flag": true }` | Valid |
| 2 | `setVariable: { "count": 5 }` | Valid |
| 3 | `setVariable: { "items": [1,2,3] }` | Valid |
| 4 | `setVariable: { "config": { "key": "val" } }` | Valid |
| 5 | `setVariable: { "x": null }` | Valid |

**New tests needed:** Covered by existing checkpoint option tests if `setVariable` is present.

---

### TC-007: Condition value description (QC-068)

| # | Verification | Expected |
|---|-------------|----------|
| 1 | `simple.value` type remains `["string", "number", "boolean", "null"]` | Unchanged |
| 2 | Description mentions array/object exclusion rationale | Updated |

**New tests needed:** None — documentation-only change.

---

### TC-008: `rules` descriptions (QC-069, QC-127)

| # | Verification | Expected |
|---|-------------|----------|
| 1 | Workflow `rules` description mentions type difference | Updated |
| 2 | Activity `rules` description mentions type difference | Updated |
| 3 | Skill `rules` description mentions type difference | Updated |

**New tests needed:** None — documentation-only change.

---

### TC-009: `triggers` array type (QC-122)

| # | Input | Expected |
|---|-------|----------|
| 1 | Activity with `triggers: [{ workflow: "wf-1" }]` | Valid |
| 2 | Activity with `triggers: [{ workflow: "wf-1" }, { workflow: "wf-2" }]` | Valid |
| 3 | Activity with `triggers: []` | Valid (optional) |

**New tests needed:** Add test for activity with array-typed triggers.

---

### TC-010: `mode.defaults` type constraints (QC-124)

| # | Input | Expected |
|---|-------|----------|
| 1 | Mode with `defaults: { "verbose": true }` | Valid |
| 2 | Mode with `defaults: { "count": 5 }` | Valid |

**New tests needed:** Minimal — already implicitly tested by workflow validation.

---

### TC-011: `stateVersion` bound (QC-125)

| # | Input | Expected |
|---|-------|----------|
| 1 | `stateVersion: 1` | Valid |
| 2 | `stateVersion: 1000` | Valid |
| 3 | `stateVersion: 1001` | Invalid |
| 4 | `stateVersion: 0` | Invalid (exclusiveMinimum: 0) |

**New tests needed:** Add stateVersion boundary tests.

---

### TC-012: State `variables` type constraints (QC-126)

| # | Input | Expected |
|---|-------|----------|
| 1 | `variables: { "name": "value" }` | Valid |
| 2 | `variables: { "count": 5 }` | Valid |
| 3 | `variables: { "items": [1,2] }` | Valid |
| 4 | `variables: {}` | Valid |

**New tests needed:** Minimal — already implicitly tested.

---

## Regression Plan

1. Run `npm test` — all existing tests must pass
2. Run `npm run typecheck` — no new type errors
3. Validate each modified schema file with a JSON Schema draft-07 validator
4. Verify the schema loader test (`tests/schema-loader.test.ts`) still loads all schemas

---

## Priority

| Priority | Test Cases |
|----------|-----------|
| Must-have | TC-001, TC-002, TC-004, TC-011 |
| Should-have | TC-003 (after A-001), TC-005, TC-009 |
| Nice-to-have | TC-006, TC-007, TC-008, TC-010, TC-012 |
