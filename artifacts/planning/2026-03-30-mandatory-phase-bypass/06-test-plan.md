# Test Plan: Mandatory Phase Bypass Fix

**Issue:** [#86](https://github.com/m2ux/workflow-server/issues/86)  
**Created:** 2026-03-30

---

## Test Strategy

This work package changes the schema layer, server tool handler, workflow TOON files, and removes dead code. Testing covers schema validation, API behavior (new and regression), and build integrity.

---

## Test Cases

### TC-1: Schema — `skills` field acceptance

**Type:** Unit  
**File:** `tests/schema-validation.test.ts` (or inline in existing)

| # | Case | Input | Expected |
|---|------|-------|----------|
| 1.1 | Workflow with `skills` array passes validation | `{ ..., skills: ["orchestrate-workflow"] }` | Validation success |
| 1.2 | Workflow without `skills` passes validation | `{ ..., }` (no skills field) | Validation success (optional) |
| 1.3 | Workflow with empty `skills` array passes | `{ ..., skills: [] }` | Validation success |
| 1.4 | Workflow with non-string `skills` items fails | `{ ..., skills: [123] }` | Validation failure |

---

### TC-2: `get_skills` with `activity_id` (regression)

**Type:** Unit / Integration  
**File:** `tests/mcp-server.test.ts`

| # | Case | Input | Expected |
|---|------|-------|----------|
| 2.1 | Returns activity-declared skills | `get_skills(workflow_id, activity_id)` | Skills from `activity.skills.primary + supporting` |
| 2.2 | Invalid activity_id returns error | `get_skills(workflow_id, "nonexistent")` | Error: "Activity not found" |
| 2.3 | Response includes `activity_id` in body | `get_skills(workflow_id, activity_id)` | `response.activity_id` matches input |

---

### TC-3: `get_skills` without `activity_id` (new behavior)

**Type:** Unit / Integration  
**File:** `tests/mcp-server.test.ts`

| # | Case | Input | Expected |
|---|------|-------|----------|
| 3.1 | Returns workflow-level skills | `get_skills(workflow_id)` (no activity_id) | Skills from `workflow.skills` |
| 3.2 | Skills resolve via universal fallback | `get_skills("work-package")` | Returns `execute-activity` and `orchestrate-workflow` from `meta/skills/` |
| 3.3 | No skills declared returns error | `get_skills(workflow_id_without_skills)` | Error: "No workflow-level skills declared" |
| 3.4 | Response includes `workflow_id` in body | `get_skills(workflow_id)` | `response.workflow_id` present, no `activity_id` |
| 3.5 | Resources attached to returned skills | `get_skills("work-package")` | Resources array populated for skills that declare them |
| 3.6 | Session token advanced correctly | `get_skills(workflow_id)` | Token `act` field is empty string |

---

### TC-4: Dead code removal integrity

**Type:** Build / Typecheck

| # | Case | Verification |
|---|------|-------------|
| 4.1 | Typecheck passes after removal | `npm run typecheck` exits 0 |
| 4.2 | All tests pass after removal | `npm test` exits 0 |
| 4.3 | No remaining imports of removed functions | Grep for `listUniversalSkills\|listSkills\|readSkillIndex\|SkillIndex\|SkillEntry` in `src/` returns no matches |

---

### TC-5: Workflow TOON validation

**Type:** Integration

| # | Case | Verification |
|---|------|-------------|
| 5.1 | work-package workflow loads with skills field | `loadWorkflow("work-package")` succeeds |
| 5.2 | `get_skills("work-package")` returns declared skills | Both `orchestrate-workflow` and `execute-activity` present in response |

---

### TC-6: Meta skill TOON validation

**Type:** Integration

| # | Case | Verification |
|---|------|-------------|
| 6.1 | orchestrate-workflow loads and validates | `readSkill("orchestrate-workflow")` succeeds |
| 6.2 | execute-activity loads and validates | `readSkill("execute-activity")` succeeds |

---

## Verification Commands

```bash
npm run typecheck    # Type safety after all changes
npm test             # All test suites pass
```

---

## Coverage Summary

| Area | Tests | Type |
|------|-------|------|
| Schema validation | 4 | Unit |
| get_skills regression | 3 | Integration |
| get_skills new behavior | 6 | Integration |
| Dead code removal | 3 | Build/Typecheck |
| TOON validation | 4 | Integration |
| **Total** | **20** | |
