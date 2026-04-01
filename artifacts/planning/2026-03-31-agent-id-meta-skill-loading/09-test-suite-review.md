# Test Suite Review — PR #93

**Date:** 2026-04-01  
**Test Framework:** Vitest  
**Test File:** `tests/mcp-server.test.ts`  
**Results:** 253/253 passing, 0 failures

---

## Coverage Assessment

### New Test Suites

| Suite | Tests | Coverage |
|-------|-------|----------|
| `agent_id meta-skill loading` | 4 | New agent, same agent, different agent, omitted agent_id |
| `cross-workflow resource resolution` | 2 | `meta/NN` prefix, bare index backward compat |
| `structured resources in skill responses` (updated) | 6 | Nesting, stripping, frontmatter, workflow-scope, token return |

### Requirement Coverage Matrix

| Requirement | Test(s) | Gap? |
|-------------|---------|------|
| `agent_id` parameter accepted | 1.1, 1.4 | No |
| New agent → meta skills included | 1.1 | No |
| Same agent → meta skills excluded | 1.2 | No |
| Different agent → meta re-included | 1.3 | No |
| Omitted → backward compatible | 1.4 | No |
| Cross-workflow prefix resolves | 2.1 | No |
| Bare index backward compat | 2.2 | No |
| `_resources` nesting on `get_skill` | 3.1 | No |
| `_resources` nesting on `get_skills` | 3.3 | No |
| Raw `resources` stripped | 3.2 | No |
| Frontmatter stripped | 3.4 | No |
| `token.aid` updated | 1.2 (indirect) | Minor |

---

## Findings

### TF-1 — No negative test for nonexistent cross-workflow references (LOW)

**Description:** No test verifies what happens when a skill references `nonexistent/99`. The behavior is "silent drop" (resource excluded from `_resources`), but this is not tested.  
**Impact:** If the silent-drop behavior changes (e.g., to throwing), no test would catch the regression.  
**Recommendation:** Consider adding a test that verifies a skill with a bad cross-workflow ref still loads successfully with the valid resources.

### TF-2 — `token.aid` tested only indirectly (INFO)

**Description:** No test decodes the token to verify `aid` was set. Test 1.2 indirectly proves it by relying on the behavioral consequence (second call returns `scope: 'activity'`).  
**Impact:** If `aid` was updated correctly but the comparison logic changed, the test would still pass. However, this is a theoretical concern — the behavioral test provides strong transitive evidence.  
**Recommendation:** No action needed. Behavioral assertions are sufficient.

### TF-3 — No test for `get_skills` with `agent_id` in workflow scope (INFO)

**Description:** All `agent_id` tests call `get_skills` after `next_activity` (activity scope). No test verifies behavior when `agent_id` is passed in workflow scope (`token.act` empty). In workflow scope, `isNewAgent` is irrelevant because the `!activityId` branch runs first.  
**Impact:** The code is correct by construction (the `!activityId` check precedes the `isNewAgent` check). But no test documents this priority.  
**Recommendation:** Consider adding a test that verifies `agent_id` has no effect in workflow scope — returns `scope: 'workflow'` regardless.

---

## Positive Observations

1. **Comprehensive happy-path coverage:** All 4 agent-id scenarios (new, same, different, omitted) are tested.
2. **End-to-end integration tests:** Tests use the full MCP transport, validating the entire stack including TOON decoding, skill resolution, and resource loading.
3. **Assertion quality:** Tests verify both presence (expected skills) and absence (excluded skills), providing strong contract assertions.
4. **Updated existing tests:** Pre-existing resource tests were updated to match the new `_resources` structure rather than left broken.

---

## Verdict

**Test quality is adequate.** One low-severity gap (TF-1: no negative test for bad cross-workflow refs). Two informational findings. No test improvements recommended for this PR.
