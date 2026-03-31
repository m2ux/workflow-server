# Test Suite Review — #90 Eliminate rules.toon

**Date:** 2026-03-31  
**Branch:** `refactor/90-eliminate-rules-toon`  
**Test results:** 252 passed / 0 failed / 10 test files

---

## Summary

The test changes are proportional to the code changes: deleted the `rules-loader.test.ts` file (158 lines, 7 tests) and updated 2 tests in `mcp-server.test.ts`.

---

## Changes Reviewed

### Deleted: `tests/rules-loader.test.ts`

7 tests covering `readRules` and `readRulesRaw`:
- 3 happy-path tests against real workflow data
- 4 error-handling tests (missing file, empty dir, malformed TOON, missing fields, bad sections)

**Assessment:** Appropriate deletion. The code under test (`rules-loader.ts`, `rules.schema.ts`) was deleted. No replacement tests needed since the functionality was removed, not moved — behavioral rules are now delivered through the existing skill system which already has loader tests.

### Modified: `tests/mcp-server.test.ts`

**1. `start_session` test** (lines 79-93):
- Before: `expect(response.rules).toBeDefined(); expect(response.rules.id).toBe('agent-rules');`
- After: `expect(response.rules).toBeUndefined();`
- **Assessment:** Correct negative assertion. Verifies the rules payload is actually gone, not just ignored.

**2. `help` test** (lines 52-60):
- Before: Structural assertions on `bootstrap.step_1.tool`, `session_protocol.validation`
- After: Content assertions on `bootstrap_guide` string containing `start_session` and `get_skills`
- **Assessment:** Good adaptation — tests the externalized resource by checking it contains the essential keywords rather than asserting on JSON structure.

---

## Coverage Analysis

| Area | Coverage | Notes |
|------|----------|-------|
| `start_session` response shape | ✅ Covered | Explicit check that `rules` is undefined |
| `help` bootstrap guide content | ✅ Covered | Validates resource loaded and contains key terms |
| `help` graceful degradation | ⬚ Not covered | No test for when resource `09` is missing |
| New meta skills (TOON files) | ✅ Covered | Skill loader tests validate all skills in `meta/skills/` directory |
| Error code cleanup | ✅ Covered | No test references `RULES_NOT_FOUND` — confirmed no orphans |

---

## Gaps

| # | Gap | Severity | Recommendation |
|---|-----|----------|----------------|
| 1 | No test for `help` when bootstrap resource is missing | Low | The code handles this gracefully (omits field). A test would document the behavior but isn't blocking. |

---

## Verdict

Test coverage is adequate for the scope of changes. The one gap (missing resource graceful degradation) is low severity. **No blocking issues.**
