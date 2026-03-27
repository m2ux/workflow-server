# WP-02 Work Package Plan — JSON Schema Corrections

## Approach

Each finding maps to one or more localized schema changes. Changes are grouped by file for efficient editing. The Zod schemas are out of scope (WP-03) — only JSON Schema files in `schemas/` are modified.

---

## Task Breakdown

### Task 1: Add `activities` property to workflow schema (QC-001, Critical)

**File:** `schemas/workflow.schema.json`
**Change:** Add `activities` property to `definitions.workflow.properties`:

```json
"activities": {
  "type": "array",
  "items": {
    "$ref": "activity.schema.json"
  },
  "minItems": 1,
  "description": "Activities that comprise this workflow. Activities with transitions form sequences; activities without transitions are independent entry points."
}
```

Add `"activities"` to the `required` array alongside `id`, `version`, `title`.

**Impact:** Aligns JSON Schema with Zod schema which already has `activities: z.array(ActivitySchema).min(1)`. This is the highest-priority fix — without it the workflow schema rejects its own documented examples.

**Estimate:** 5 min

---

### Task 2: Fix condition recursive validation (QC-013, High)

**File:** `schemas/condition.schema.json`
**Changes:**
- `and` branch: change `"items": {}` → `"items": { "$ref": "#/definitions/condition" }`
- `or` branch: change `"items": {}` → `"items": { "$ref": "#/definitions/condition" }`
- `not` branch: change bare `"condition": { "description": "..." }` → add `"$ref": "#/definitions/condition"` alongside the description

**Impact:** Prevents arbitrary JSON from being accepted as sub-conditions.

**Estimate:** 5 min

---

### Task 3: Align `additionalProperties` policy (QC-061, QC-062, Medium) — STAKEHOLDER-DEPENDENT

**Files:** `schemas/activity.schema.json`, `schemas/skill.schema.json`

**Pending assumption A-001.** Two options:

**Option A — Strict (recommended):** Change `activity.activity.additionalProperties` from `true` to `false`. Keep `skill.skill.additionalProperties` as `true` (documented exception for extensibility). This is consistent with the principle that activities are structural workflow constructs (like conditions and state) while skills are extensible knowledge containers.

**Option B — Permissive:** Keep both as `true`, add documentation explaining why.

**Estimate:** 5 min (once decision made)

---

### Task 4: Make `currentActivity` optional for terminal states (QC-065, Medium)

**File:** `schemas/state.schema.json`
**Change:** Remove `"currentActivity"` from the `required` array in `definitions.state`. Add an `if`/`then` condition:

```json
"if": {
  "properties": { "status": { "enum": ["running", "paused", "suspended"] } },
  "required": ["status"]
},
"then": {
  "required": ["currentActivity"]
}
```

This makes `currentActivity` required for active states but optional for `completed`, `aborted`, and `error` states.

**Impact:** Allows valid state representations for completed workflows.

**Estimate:** 10 min

---

### Task 5: Add `$id` to all schema files (QC-066, Medium)

**Files:** All 5 schema files
**Change:** Add `$id` property to each schema root:

| File | `$id` |
|------|-------|
| workflow.schema.json | `workflow.schema.json` |
| activity.schema.json | `activity.schema.json` |
| skill.schema.json | `skill.schema.json` |
| condition.schema.json | `condition.schema.json` |
| state.schema.json | `state.schema.json` |

**Impact:** Makes relative `$ref` resolution explicit and validator-independent.

**Estimate:** 5 min

---

### Task 6: Type-constrain `setVariable` values (QC-067, Medium)

**File:** `schemas/activity.schema.json`
**Change:** In `definitions.checkpointOption.properties.effect.properties.setVariable`, replace:

```json
"additionalProperties": {}
```

with:

```json
"additionalProperties": {
  "type": ["string", "number", "boolean", "array", "object", "null"]
}
```

**Also apply to:** `schemas/state.schema.json` — `passedContext.additionalProperties`, `returnedContext.additionalProperties`, `variablesSet.additionalProperties`, `data.additionalProperties` (where currently `{}`).

**Impact:** Constrains variable values to JSON-compatible types without restricting the value space.

**Estimate:** 10 min

---

### Task 7: Document condition value type exclusion (QC-068, Medium)

**File:** `schemas/condition.schema.json`
**Change:** Do NOT expand `simple.value` to include `array`/`object`. The runtime condition evaluator uses strict equality (`===`) which cannot meaningfully compare arrays/objects by value. Instead, update the description:

```json
"description": "Value to compare against. Not required for exists/notExists operators. Array and object types are excluded because the runtime uses strict equality comparison."
```

**Impact:** Documents the intentional limitation rather than creating a false promise.

**Estimate:** 5 min

---

### Task 8: Document `rules` type difference (QC-069, QC-127, Medium)

**Files:** `schemas/workflow.schema.json`, `schemas/activity.schema.json`, `schemas/skill.schema.json`
**Change:** Enhance descriptions on all `rules` properties to explicitly call out the type difference:

- Workflow/activity `rules`: add `"Type: string array (ordered imperative directives). Note: skill schemas use object format for named rules."`
- Skill `rules`: add `"Type: object (named key→value pairs). Note: workflow/activity schemas use string array format for ordered rules."`

**Impact:** Makes the intentional type difference discoverable by tooling and authors.

**Estimate:** 5 min

---

### Task 9: Fix `triggers` singular/plural mismatch (QC-122, Low)

**File:** `schemas/activity.schema.json`
**Change:** Change `triggers` to accept an array of workflow triggers:

```json
"triggers": {
  "type": "array",
  "items": {
    "$ref": "#/definitions/workflowTrigger"
  },
  "description": "Workflows to trigger from this activity"
}
```

**Rationale:** The plural name implies multiple values; an activity could plausibly trigger multiple workflows. This aligns the type with the name.

**Alternative (lower risk):** Rename to `trigger` (singular). But since `additionalProperties: true` on activity means old documents with `triggers` as an object won't break validation, the array change is preferred.

**Estimate:** 5 min

---

### Task 10: Audit skill sub-definition `additionalProperties` (QC-123, Low) — STAKEHOLDER-DEPENDENT

**File:** `schemas/skill.schema.json`
**Change:** Pending assumption A-001. Recommended: keep `additionalProperties: true` on all skill sub-definitions with documented rationale (skills are extensible knowledge containers).

**Estimate:** 5 min (documentation only)

---

### Task 11: Type-constrain `mode.defaults` (QC-124, Low)

**File:** `schemas/workflow.schema.json`
**Change:** In `definitions.mode.properties.defaults`, replace:

```json
"additionalProperties": {}
```

with:

```json
"additionalProperties": {
  "type": ["string", "number", "boolean", "array", "object", "null"]
}
```

**Impact:** Symmetric with `setVariable` constraints (Task 6).

**Estimate:** 5 min

---

### Task 12: Bound `stateVersion` (QC-125, Low)

**File:** `schemas/state.schema.json`
**Change:** Add `"maximum": 1000` to `definitions.state.properties.stateVersion`.

**Impact:** Prevents absurdly large version numbers while leaving ample room for legitimate use.

**Estimate:** 5 min

---

### Task 13: Type-constrain state `variables` (QC-126, Low)

**File:** `schemas/state.schema.json`
**Change:** In `definitions.state.properties.variables`, replace:

```json
"additionalProperties": {}
```

with:

```json
"additionalProperties": {
  "type": ["string", "number", "boolean", "array", "object", "null"]
}
```

**Impact:** Consistent with workflow variable type constraints.

**Estimate:** 5 min

---

## Dependency Order

Tasks are independent and can be executed in any order. Suggested grouping by file for efficiency:

1. **condition.schema.json:** Tasks 2, 7
2. **workflow.schema.json:** Tasks 1, 8 (partial), 11
3. **activity.schema.json:** Tasks 3 (partial), 6, 8 (partial), 9
4. **skill.schema.json:** Tasks 3 (partial), 8 (partial), 10
5. **state.schema.json:** Tasks 4, 6 (partial), 12, 13
6. **All files:** Task 5

## Blocked Tasks

- **Task 3** (QC-061, QC-062) — blocked on assumption A-001 stakeholder decision
- **Task 10** (QC-123) — blocked on assumption A-001 stakeholder decision

## Total Estimate

~75 min agentic time (excluding blocked tasks and review)

---

## Success Criteria

1. Workflow schema accepts documents containing `activities` property
2. Condition schemas enforce recursive `$ref` for nested conditions
3. `additionalProperties` policy is consistent and documented
4. All schema files have `$id` for explicit `$ref` resolution
5. `setVariable`, `mode.defaults`, and state `variables` have type constraints
6. `currentActivity` is optional for terminal workflow states
7. `stateVersion` has an upper bound
8. `rules` type differences are documented in schema descriptions
9. `triggers` type matches its plural name
10. Existing tests pass (`npm test`)
