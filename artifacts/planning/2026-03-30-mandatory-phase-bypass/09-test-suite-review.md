# Test Suite Review: Mandatory Phase Bypass Fix

**PR:** [#87](https://github.com/m2ux/workflow-server/pull/87)  
**Date:** 2026-03-31

---

## Summary

261 tests across 11 files. 6 new tests added for workflow-level `get_skills`. 7 tests removed (dead code coverage). All pass.

---

## New Test Coverage

### `tests/mcp-server.test.ts` — Workflow-Level Skills (6 tests)

| Test | Coverage | Quality |
|------|----------|---------|
| Returns workflow-level skills when activity_id omitted | Happy path — core functionality | ✅ Good |
| Resolves via universal fallback | Verifies `orchestrate-workflow` and `execute-activity` present | ✅ Good |
| Includes resources for workflow-level skills | Resource attachment | ✅ Good |
| Returns updated token in _meta | Token advancement | ✅ Good |
| Errors when workflow has no skills declared | Error path — missing skills | ✅ Good |
| Preserves existing activity-level behavior | Regression — backward compatibility | ✅ Good |

### Assessment

- **Happy path:** Covered (workflow-level loading works)
- **Error path:** Covered (no skills declared → error)
- **Regression:** Covered (activity-level still works)
- **Token handling:** Covered (_meta.session_token returned)
- **Resource attachment:** Covered (resources array present)

---

## Removed Test Coverage

### `tests/skill-loader.test.ts` — Dead Code Tests (7 removed)

| Suite | Tests Removed | Rationale |
|-------|--------------|-----------|
| `listUniversalSkills` | 2 | Function removed |
| `listSkills` | 1 | Function removed |
| `readSkillIndex` | 4 | Function and type removed |

### Preserved Tests (11 kept)

| Suite | Tests Kept | Coverage |
|-------|-----------|----------|
| `readSkill` | 7 | Universal loading, workflow-specific, error handling, protocol sections |
| `malformed TOON handling` | 4 | Invalid TOON, empty file, minimal valid, non-existent |

---

## Coverage Gaps

### TSR-01: Schema validation tests not explicitly added

**Severity:** Low  
**Gap:** No explicit test for `WorkflowSchema` accepting/rejecting the `skills` field. However, the integration tests in `mcp-server.test.ts` implicitly cover this — the workflow loads successfully with the `skills` field declared in `workflow.toon`, which triggers Zod validation via `loadWorkflow()`.  
**Recommendation:** No action needed — implicit coverage is sufficient.

### TSR-02: No test for `activity_id` passed as empty string

**Severity:** Low  
**Gap:** The test suite covers `activity_id` as undefined (workflow-level) and as a valid string (activity-level). It does not test `activity_id: ""` (empty string). With `.optional()`, Zod would pass an empty string through, and `getActivity()` would return `undefined` → error.  
**Recommendation:** Edge case — low risk. Current error handling covers it via "Activity not found" error path.

---

## Verdict

Test coverage is adequate for the changes made. No critical gaps. The 6 new tests cover the core functionality, error path, and regression. The 7 removed tests correctly correspond to removed code.

**Recommend: all-acceptable.**
