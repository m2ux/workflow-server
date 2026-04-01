# Code Review — Optimize Skill Delivery

**PR:** [#97](https://github.com/m2ux/workflow-server/pull/97)  
**Date:** 2026-04-01  
**Scope:** `src/tools/resource-tools.ts`, `scripts/validate-*.ts`, workflow TOON files

---

## Summary

The core change replaces the `skill_id` parameter on `get_skill` with `step_id`, adding server-side step→skill resolution. Management skills are consolidated from 5 to 2 role-based skills. Validation scripts receive a bug fix for `decodeToon` usage.

**Overall Assessment:** Clean implementation with clear error handling. No critical or high-severity findings.

---

## Findings

### F-01: Step lookup logic — edge case with loop steps found in regular steps
**Severity:** Low  
**File:** `src/tools/resource-tools.ts:189`  
**Finding:** The condition `if (!step && !skillId)` conflates two states: (1) step not found anywhere, and (2) step found in a loop but has no skill. If a loop step with `id: "X"` exists but has no `skill` field, `skillId` would be `undefined` but `step` would also be `undefined` (since `step` is only set from `activity.steps?.find`). The code would then enter the "step not found" branch with an error listing available step IDs — technically correct but the error message would be misleading since the step does exist.  
**Impact:** Edge case only. All current workflow definitions have skills on loop steps with skill declarations. The subsequent `!skillId` check (line 197) would catch the "no skill" case correctly if the code reached it.  
**Recommendation:** Consider refactoring to track whether the step was found separately from the skill lookup, for future-proofing. Not blocking.

### F-02: `validateSkillAssociation` is now dead code
**Severity:** Informational  
**File:** `src/utils/validation.ts:41-73`  
**Finding:** The function is still exported but no longer called by any production code. The import was removed from `resource-tools.ts`. It's still tested in `tests/validation.test.ts`.  
**Impact:** None — dead code doesn't affect runtime. Test coverage for dead code wastes test execution time but is harmless.  
**Recommendation:** Consider removing `validateSkillAssociation` and its tests in a follow-up cleanup, or mark as deprecated. Not blocking for this PR.

### F-03: Validation script bug fix — correct approach
**Severity:** Positive  
**File:** `scripts/validate-activities.ts:16`, `scripts/validate-workflow-toon.ts:10`  
**Finding:** Replacing `decodeToon` (which requires a schema parameter) with `decodeToonRaw` (which returns raw parsed TOON without type validation) is the correct fix. The scripts perform their own Zod validation afterward via `safeValidateActivity` and `safeValidateSkill`. The rename-as-import (`decodeToonRaw as decodeToon`) minimizes code churn while fixing the type mismatch.  
**Impact:** Positive — fixes a pre-existing bug that would have caused validation script failures.

### F-04: Consolidated management skills — well-structured
**Severity:** Positive  
**File:** `workflows/meta/skills/10-orchestrator-management.toon`, `11-worker-management.toon`  
**Finding:** The consolidated skills are well-organized with clear section boundaries. The `get_skill` tool reference in `worker-management.toon` correctly documents `step_id` (not `skill_id`). Resources are referenced with explicit cross-workflow prefixes (`meta/05`, `meta/06`, `meta/10`).  
**Impact:** Positive — reduces bootstrap from 5 skill loads to 2.

---

## Severity Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 1 (F-01) |
| Informational | 1 (F-02) |
| Positive | 2 (F-03, F-04) |

---

**Verdict:** No blocking findings. Implementation is clean and follows established patterns.
