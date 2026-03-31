# Code Review: Mandatory Phase Bypass Fix

**PR:** [#87](https://github.com/m2ux/workflow-server/pull/87)  
**Date:** 2026-03-31

---

## Summary

9 files changed: +96/-288 (net -192 lines). Clean implementation: schema addition, API extension, dead code removal, documentation, and tests. No critical or high-severity findings.

---

## Findings

### CR-01: response body `activity_id: null` for workflow-level calls

**Severity:** Low (informational)  
**File:** `src/tools/resource-tools.ts:138`  
**Finding:** When `activity_id` is omitted, the response body includes `activity_id: null`. This is explicit and unambiguous — callers can distinguish workflow-level from activity-level responses. No action needed.

### CR-02: Error message references workflow_id

**Severity:** Low (informational)  
**File:** `src/tools/resource-tools.ts:105`  
**Finding:** `throw new Error(\`No workflow-level skills declared for workflow '${workflow_id}'\`)` — clear, actionable error message. Includes workflow_id for debugging.

### CR-03: Dead code removal is clean

**Severity:** None (positive finding)  
**File:** `src/loaders/skill-loader.ts`  
**Finding:** Removed functions (`listUniversalSkills`, `listWorkflowSkills`, `listSkills`, `readSkillIndex`, `SkillIndex`, `SkillEntry`) had no external consumers. Unused imports (`stat`, `basename`) also removed. Remaining code (127 lines) is clean and focused: 5 private helpers + 1 exported function (`readSkill`).

### CR-04: Schema addition follows established patterns

**Severity:** None (positive finding)  
**Files:** `src/schema/workflow.schema.ts:67`, `schemas/workflow.schema.json:207-213`  
**Finding:** `skills` field uses `z.array(z.string()).optional()` — consistent with other optional array fields in the schema (`tags`, `rules`). JSON Schema mirrors the Zod definition. Placement between `executionModel` and `initialActivity` groups execution-related fields together.

### CR-05: Token advancement handles missing activity_id

**Severity:** Low (informational)  
**File:** `src/tools/resource-tools.ts:144`  
**Finding:** `act: activity_id ?? ''` — passes empty string when activity_id is undefined. Consistent with how other workflow-level operations (like `start_session`) set the `act` field.

---

## Verdict

No critical or high-severity findings. All changes follow established patterns, maintain backward compatibility, and include appropriate error handling. **Recommend: all-acceptable.**
