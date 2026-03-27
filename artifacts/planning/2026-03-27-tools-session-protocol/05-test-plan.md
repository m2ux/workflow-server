# Test Plan: Tools Session Protocol

**Work Package:** WP-07  
**Issue:** #67  
**Created:** 2026-03-27

---

## Strategy

Rely on existing integration tests in `tests/mcp-server.test.ts` as the primary regression gate. The 17 findings target edge cases and error handling; the existing happy-path tests verify no regressions.

---

## Test Updates Required

### start_session token location (QC-037)

The test at `mcp-server.test.ts:82` reads `response.session_token` from the body. After moving the token to `_meta`, this assertion must read from `result._meta.session_token` instead.

---

## Verification Checklist

| Check | Command | Expected |
|-------|---------|----------|
| Type safety | `npm run typecheck` | Zero errors |
| Integration tests | `npm test` | All tests pass |
| No new warnings | Manual review | No new TypeScript warnings |

---

## Findings Not Requiring New Tests

All 17 findings are verified through existing test coverage or manual review:

- **Error handling** (QC-032, QC-033, QC-035): The changes surface errors that were previously swallowed — they don't change behavior for valid inputs
- **Logging/warnings** (QC-039, QC-094, QC-097): Additive output — existing tests don't assert absence of warnings
- **Type safety** (QC-092, QC-093, QC-095, QC-099): Compile-time checks via `typecheck`
- **Constants/refactoring** (QC-034, QC-096): No behavior change
- **Validation additions** (QC-036, QC-098): Additive validation that produces warnings, not errors
- **Correctness** (QC-038, QC-100): Changes output fields — verified by manual review of response structure
