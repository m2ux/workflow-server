# Change Block Index — Loader Error Handling and Validation

**Work Package:** WP-05  
**Commit:** `b2ebea4` (fix: remediate 12 loader error handling and validation findings)  
**Date:** 2026-03-27

---

## Summary

5 files changed, 48 insertions(+), 30 deletions(-)

---

## File Index

| # | File | Hunks | Findings Addressed | Lines Changed |
|---|------|-------|-------------------|---------------|
| 1 | `src/loaders/skill-loader.ts` | 2 | QC-005 | +3/-2 |
| 2 | `src/loaders/rules-loader.ts` | 2 | QC-022 | +2/-2 |
| 3 | `src/loaders/resource-loader.ts` | 3 | QC-024, QC-026, QC-031 | +9/-9 |
| 4 | `src/loaders/activity-loader.ts` | 2 | QC-006, QC-009, QC-028 | +9/-4 |
| 5 | `src/loaders/workflow-loader.ts` | 4 | QC-006, QC-010, QC-011, QC-023, QC-025 | +25/-13 |

---

## Hunk Details

### 1. skill-loader.ts

**Hunk 1.1** (line 6): Import `logWarn` alongside existing `logInfo`.

**Hunk 1.2** (lines 82-87): QC-005 — Added error parameter to catch block and `logWarn('Failed to decode skill TOON', ...)`. Previously returned `null` silently.

### 2. rules-loader.ts

**Hunk 2.1** (line 6): Import `logWarn` alongside existing `logInfo`.

**Hunk 2.2** (line 47): QC-022 — Changed `logInfo('Rules parse error', ...)` to `logWarn('Rules parse error', ...)`.

### 3. resource-loader.ts

**Hunk 3.1** (line 6): Import `logWarn` alongside existing `logInfo, logError`.

**Hunk 3.2** (lines 150-152): QC-024/QC-031 — Replaced empty `catch {}` with `logWarn('Failed to read resource (raw)', ...)`. Aligns error policy with `readResource` which uses `logError`.

**Hunk 3.3** (lines 215-237): QC-026 — Changed `StructuredResource.id` and `.version` from `string` to `string | undefined`. Changed `parseFrontmatter` return type to match. Returns `undefined` instead of `''` when frontmatter fields are absent.

### 4. activity-loader.ts

**Hunk 4.1** (lines 112-130): QC-028 — Added early return for `activityId === 'index'` in `readActivityFromWorkflow`. QC-006 — Updated validation failure log message to clarify raw content is being used.

**Hunk 4.2** (lines 149-153): QC-009 — Replaced bare `catch` with `catch (error)`, added `logWarn` with error details, and passed `workflowId` to `ActivityNotFoundError` constructor for better diagnostics.

### 5. workflow-loader.ts

**Hunk 5.1** (line 3): Removed unused `basename` import.

**Hunk 5.2** (lines 46-57): QC-006/QC-011 — When `safeValidateActivity` fails, now skips the activity (`continue`) instead of embedding the raw decoded object. Log message changed from "Activity validation failed" to "Skipping invalid activity".

**Hunk 5.3** (lines 131-157): QC-010/QC-023 — Replaced `loadWorkflow()` calls in `listWorkflows` with direct `readFile` + `decodeToon<RawWorkflow>` to read only manifest fields. Added per-entry `try/catch` with `logWarn`. Replaced outer empty `catch {}` with `logWarn('Failed to list workflows', ...)`.

**Hunk 5.4** (lines 209-211): QC-025 — Added `Array.isArray(condition.conditions)` guard before iterating in 'and' and 'or' cases of `conditionToString`. Falls back to `String(condition)` if not an array.
