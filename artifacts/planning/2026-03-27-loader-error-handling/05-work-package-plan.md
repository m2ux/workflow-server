# Work Package Plan — Loader Error Handling and Validation

**Work Package:** WP-05  
**Date:** 2026-03-27

---

## Tasks

### T1: QC-005 — Log warning for corrupt skill TOON (skill-loader.ts)

**File:** `src/loaders/skill-loader.ts`  
**Function:** `tryLoadSkill` (line 78-88)  
**Change:** Add `logWarn` in the catch block instead of silently returning `null`. Import `logWarn`.  
**Risk:** Low — callers already handle `null` returns.  
**Estimate:** 5m

### T2: QC-006 — Stop using raw decoded objects on validation failure (workflow-loader.ts, activity-loader.ts)

**Files:** `src/loaders/workflow-loader.ts` (line 48-55), `src/loaders/activity-loader.ts` (line 120-125)  
**Change:** In `loadActivitiesFromDir`, skip activities that fail validation instead of using raw decoded objects. In `readActivityFromWorkflow`, same approach — return error instead of using unvalidated data.  
**Risk:** Medium — activities with minor validation issues will be skipped. Offset by: these are genuinely invalid and the workflow-level validation would reject them anyway.  
**Estimate:** 15m

### T3: QC-009 — Differentiate error types in activity-loader catch-all (activity-loader.ts)

**File:** `src/loaders/activity-loader.ts`  
**Function:** `readActivityFromWorkflow` (line 149)  
**Change:** Replace catch-all `catch { return err(new ActivityNotFoundError(...)) }` with typed error handling that preserves the original error. Log the error and let specific error types propagate.  
**Risk:** Low — callers check `result.success`, not error type.  
**Estimate:** 10m

### T4: QC-010 — Optimize listWorkflows to avoid full activity loading (workflow-loader.ts)

**File:** `src/loaders/workflow-loader.ts`  
**Function:** `listWorkflows` (line 131-157)  
**Change:** Read and decode only `workflow.toon` for manifest fields (id, title, version, description) instead of calling `loadWorkflow` which loads all activities.  
**Risk:** Low — listing only needs manifest-level data. Verified: callers (`help`, `list_workflows`, `health_check` tools) only use `{ id, title, version, description }`.  
**Estimate:** 15m

### T5: QC-011 — Skip invalid activities in workflow loading (workflow-loader.ts)

**File:** `src/loaders/workflow-loader.ts`  
**Function:** `loadActivitiesFromDir` (line 48-57)  
**Change:** When `safeValidateActivity` fails, skip the activity (continue) instead of embedding the raw object. Already addressed by T2's changes.  
**Risk:** Same as T2.  
**Estimate:** Included in T2.

### T6: QC-022 — Fix log level for parse errors (rules-loader.ts)

**File:** `src/loaders/rules-loader.ts`  
**Function:** `readRules` (line 47)  
**Change:** Change `logInfo` to `logWarn`. Import `logWarn`.  
**Estimate:** 2m

### T7: QC-023 — Add logging to empty catch in listWorkflows (workflow-loader.ts)

**File:** `src/loaders/workflow-loader.ts`  
**Function:** `listWorkflows` (line 156)  
**Change:** Add `logWarn` to the catch block.  
**Estimate:** 2m

### T8: QC-024 — Add logging to readResourceRaw catch (resource-loader.ts)

**File:** `src/loaders/resource-loader.ts`  
**Function:** `readResourceRaw` (line 150-152)  
**Change:** Add `logWarn` with error details.  
**Estimate:** 2m

### T9: QC-025 — Add Array.isArray guard to conditionToString (workflow-loader.ts)

**File:** `src/loaders/workflow-loader.ts`  
**Function:** `conditionToString` (line 204-217)  
**Change:** Add `Array.isArray` check before iterating `condition.conditions` for 'and'/'or' cases.  
**Estimate:** 5m

### T10: QC-026 — Return undefined for missing frontmatter fields (resource-loader.ts)

**File:** `src/loaders/resource-loader.ts`  
**Function:** `parseFrontmatter` (line 222-237)  
**Change:** Return `undefined` instead of `''` for missing `id` and `version`. Update `StructuredResource` interface to accept `string | undefined`.  
**Risk:** Low — values serialize to absent in JSON, which is fine. Callers don't check for empty string.  
**Estimate:** 5m

### T11: QC-028 — Make index activity filtering consistent (activity-loader.ts)

**File:** `src/loaders/activity-loader.ts`  
**Function:** `readActivityFromWorkflow` (line 92-152)  
**Change:** Add early return for `activityId === 'index'` in `readActivityFromWorkflow` to match `listActivitiesFromWorkflow`'s filtering.  
**Estimate:** 5m

### T12: QC-031 — Align error policy in resource-loader (resource-loader.ts)

**File:** `src/loaders/resource-loader.ts`  
**Functions:** `readResource` (line 108) vs `readResourceRaw` (line 150)  
**Change:** Add `logError` to `readResourceRaw`'s catch to match `readResource`'s policy. Already addressed by T8 (using logWarn for consistency with the fall-through-to-error pattern).  
**Estimate:** Included in T8.

---

## Dependency Order

Tasks are independent and can be implemented file-by-file:
1. **skill-loader.ts**: T1
2. **rules-loader.ts**: T6
3. **resource-loader.ts**: T8, T10, T12
4. **activity-loader.ts**: T2 (part), T3, T11
5. **workflow-loader.ts**: T2 (part), T4, T5, T7, T9

---

## Total Estimate

**Agentic time:** 45-60 minutes  
**Human review:** 20-30 minutes
