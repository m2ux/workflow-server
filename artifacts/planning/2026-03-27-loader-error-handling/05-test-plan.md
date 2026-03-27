# Test Plan — Loader Error Handling and Validation

**Work Package:** WP-05  
**Date:** 2026-03-27

---

## Verification Strategy

All changes are behavioral corrections in error handling paths. The primary verification is:

1. **`npm run typecheck`** — ensures type changes (StructuredResource, parseFrontmatter) don't break callers
2. **`npm test`** — existing integration tests verify that valid workflows, activities, skills, and resources still load correctly
3. **Manual review** — verify log output changes are appropriate

## Test Coverage by Finding

| Finding | Verification Method | Existing Tests Cover? |
|---------|--------------------|-----------------------|
| QC-005 | Existing `readSkill` tests pass (null → logged null) | Yes — tests verify skill loading |
| QC-006 | Existing `loadWorkflow`, `readActivity` tests pass | Yes — tests verify valid content loads |
| QC-009 | Existing `readActivity` error test passes | Yes — `ActivityNotFoundError` test |
| QC-010 | Existing `listWorkflows` tests pass, faster | Yes — `listWorkflows` tests |
| QC-011 | Existing `loadWorkflow` tests pass | Yes — activity loading tests |
| QC-022 | No test (log level change only) | N/A — behavioral, not API |
| QC-023 | No test (logging in catch block) | N/A — behavioral, not API |
| QC-024 | No test (logging in catch block) | N/A — behavioral, not API |
| QC-025 | Existing transition tests pass | Yes — `getTransitionList` used indirectly |
| QC-026 | Typecheck validates interface change | Partial — type system catch |
| QC-028 | Existing `listActivities` test for index filtering | Yes — "should not include index.toon" |
| QC-031 | Same as QC-024 | N/A — behavioral, not API |

## Regression Risks

1. **T2/T5 (skip invalid activities):** If any existing workflow TOON files have minor validation issues, they will now be skipped. Mitigated by: existing tests load real workflow data and verify activity counts.
2. **T4 (listWorkflows optimization):** If the manifest-only decode misses a field, listings will be incomplete. Mitigated by: existing test checks for specific workflow entries.
3. **T10 (parseFrontmatter undefined):** If any caller compares `id === ''`, it will break. Mitigated by: grep confirmed no callers check for empty string.

## Pass Criteria

- `npm run typecheck` exits 0
- `npm test` all tests pass
- No new lint errors introduced
