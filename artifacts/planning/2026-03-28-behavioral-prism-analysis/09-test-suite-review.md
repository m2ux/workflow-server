# Test Suite Review — PR #83

**PR:** [#83](https://github.com/m2ux/workflow-server/pull/83) — fix: resolve behavioral prism findings  
**Date:** 2026-03-29

---

## Summary

PR #83 modifies 2 test files with 4 test case changes covering 2 of 14 findings. **12 findings have no dedicated test coverage.** The test changes that exist are well-constructed but the overall coverage is insufficient for the scope of behavioral changes.

**Verdict:** improve-tests — Additional test coverage recommended for high-risk behavioral changes.

---

## Test Changes in PR

### tests/skill-loader.test.ts (BF-01, BF-16)

| Test | Pre-PR Behavior | Post-PR Behavior | Quality |
|------|----------------|-----------------|---------|
| `should reject non-skill TOON content as validation failure` | `expect(result.success).toBe(true)` | `expect(result.success).toBe(false)` | ✅ Good — verifies the core behavioral change |
| `should handle empty TOON file without crashing` | `expect(result.success).toBe(true)` | `expect(result.success).toBe(false)` | ✅ Good — covers empty-file edge case |
| `should handle TOON with minimal valid fields` | Minimal fields: `id`, `version` | Minimal + `capability` (required by SkillSchema) | ✅ Good — verifies minimum valid skill |

**Assessment:** These tests correctly verify the BF-01 behavioral change: invalid TOON content now fails validation instead of passing silently. The tests will need updating when RC-02 (.strict()) is implemented — the `capability` field will be the minimum rather than the current set.

### tests/trace.test.ts (BF-05)

| Test | Pre-PR Behavior | Post-PR Behavior | Quality |
|------|----------------|-----------------|---------|
| `append to uninitialized session auto-initializes and stores the event` | `expect(store.getEvents('unknown')).toEqual([])` | `expect(store.getEvents('unknown').map(e => e.name)).toEqual(['auto-init'])` | ✅ Good — directly verifies auto-initialization |

**Assessment:** Directly tests the BF-05 behavioral change. Clear, focused, correct.

---

## Coverage Gaps

### High Priority (Behavioral Changes Without Tests)

| Finding | Sev | What Changed | Recommended Test |
|---------|-----|-------------|-----------------|
| BF-04 | High | `validateSkillAssociation` returns warning strings instead of `null` for missing data | Test each missing-data case returns descriptive warning string, not `null` |
| BF-09 | Medium | First `next_activity` enforces `initialActivity` | Test that requesting non-initial activity on empty `token.act` returns warning containing `initialActivity` name |
| BF-06 | High | `readRules` validates against `RulesSchema`; parse errors distinguished from not-found | Test valid rules → success. Test malformed TOON → parse error (not NotFoundError). Test missing file → NotFoundError. |
| BF-08 | Medium | `readActivityFromWorkflow` returns `err()` on validation failure | Test that TOON file with invalid content returns `result.success === false` with `ActivityNotFoundError` |
| BF-12 | Medium | `getTransitionList` includes decisions + checkpoints | Test that activity with decisions/checkpoints includes their targets in transition list |

### Medium Priority (Defensive Changes Without Tests)

| Finding | Sev | What Changed | Recommended Test |
|---------|-----|-------------|-----------------|
| BF-10 | Medium | Key length validation on EEXIST fallback | Test that truncated key file on concurrent write is detected (mock EEXIST + short read) |
| BF-13 | Low | String-to-number coercion for comparisons | Test `evaluateSimpleCondition` with string `"5"` > number `3` → `true` |
| BF-11 | Medium | `validateStatePath` accepts `workspaceRoot` | Test custom root restricts path; test default uses `process.cwd()` |

### Low Priority (Observable Changes Without Tests)

| Finding | Sev | What Changed | Recommended Test |
|---------|-----|-------------|-----------------|
| BF-02 | Critical | 13 catch blocks add `logWarn` | Verifiable through code inspection. Testing console.error output is fragile. |
| BF-14 | Low | `restore_state` preserves decrypt error | Test that decrypt failure message includes original error, not generic "key rotation" |
| BF-15 | Low | Compact JSON serialization | Verifiable through code inspection. Compact output is the absence of whitespace. |

---

## Test Infrastructure Observations

1. **No test file for validation.ts**: `validateActivityTransition`, `validateSkillAssociation`, and `evaluateSimpleCondition` have no dedicated test file. These are pure functions ideal for unit testing.

2. **No test file for rules-loader**: Rules loading is tested only indirectly through integration paths. The new `RulesSchema` validation is untested.

3. **Existing test pattern**: The skill-loader and trace tests use `vitest` with `describe`/`it` blocks, temporary directories, and file system fixtures. This pattern could be extended to rules-loader and validation.ts.

4. **Test runner**: `vitest` (v1.6.1) configured via `vitest.config.ts`.

---

## Recommendations

1. **Add `tests/validation.test.ts`** covering BF-04/BF-09 (warning strings for missing data, initialActivity enforcement) and BF-13 (string-to-number coercion). These are pure functions — tests are straightforward.

2. **Add `tests/rules-loader.test.ts`** covering BF-06 (valid rules, malformed TOON, missing file). Follows the same temp-directory pattern as skill-loader.test.ts.

3. **Add test cases to `tests/skill-loader.test.ts`** or a new file for BF-08 (activity validation return path) and BF-12 (transition scope).

4. **Consider test cases for BF-10** (crypto key length on EEXIST) — this is a race condition fix that's hard to reproduce but critical for correctness.
