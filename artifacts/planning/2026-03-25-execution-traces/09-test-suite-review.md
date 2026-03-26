# Test Suite Review

**Work Package:** Execution Traces for Workflows (#63)  
**Reviewed:** 2026-03-25  
**Test Files:** 10 (2 new, 8 existing)  
**Total Tests:** 187 (151 existing + 36 new)

---

## Summary

Test suite quality is good. New tests cover the core trace infrastructure (TraceStore, trace tokens, session fields) and end-to-end trace lifecycle via MCP client integration. Coverage aligns well with acceptance criteria from issue #63.

## New Test Coverage

| File | Tests | Coverage Area |
|------|-------|---------------|
| `tests/trace.test.ts` (new) | 20 | TraceStore CRUD, cursor/segment, createTraceEvent, trace token round-trip/tampering/HMAC |
| `tests/session.test.ts` (+6) | 6 | sid UUID format/preservation, aid default/set/preserve |
| `tests/mcp-server.test.ts` (+10) | 10 | Trace lifecycle: init, token emission, resolution, self-exclusion, privacy, error capture, activity manifest |

## Coverage Assessment

| Area | Coverage | Notes |
|------|----------|-------|
| TraceStore core ops | ✅ Complete | init, append, get, list, isolation, uninitialized-session no-op |
| Cursor tracking | ✅ Complete | First call returns all, subsequent returns only new, empty when caught up |
| Trace token crypto | ✅ Complete | Round-trip, tamper rejection, invalid HMAC, missing signature |
| Session sid/aid | ✅ Complete | UUID format, preservation across advance, aid settable |
| Integration: trace init | ✅ Covered | start_session creates trace with session_started event |
| Integration: token emission | ✅ Covered | next_activity returns _meta.trace_token |
| Integration: token resolution | ✅ Covered | get_trace resolves accumulated tokens |
| Integration: self-exclusion | ✅ Covered | get_trace not in its own output |
| Integration: privacy | ✅ Covered | session_token string not in trace events |
| Integration: errors | ✅ Covered | Failed tool calls appear with status error |
| Integration: invalid tokens | ✅ Covered | Graceful handling with token_errors array |
| Integration: activity manifest | ✅ Covered | Accepted without error on next_activity |
| Validation warnings in trace | ◐ Indirect | Covered via integration flow but no dedicated test that triggers a specific warning and checks vw field |
| Multiple sequential tokens | ◐ Indirect | IT-8 tests two tokens but doesn't verify segment non-overlap explicitly |

## Recommendations

**R-1 (Low): Add dedicated validation warning test**  
Create a test that calls `next_activity` with a step_manifest that triggers a validation warning, then checks that the trace event's `vw` field contains the warning text. Current coverage catches warnings passively through the integration flow.

**R-2 (Low): Verify segment boundaries don't overlap**  
IT-8 confirms two tokens resolve correctly but doesn't assert that the events from token 1 and token 2 are disjoint (no duplicates). Add an assertion that checks event uniqueness by spanId.

## Anti-Patterns Check

| Anti-Pattern | Status |
|-------------|--------|
| Tests depend on execution order | ✅ No — each describe block has its own beforeAll setup |
| Tests share mutable state unsafely | ✅ No — traceSessionToken is scoped per describe; session tokens updated after each call |
| Tests assert implementation details | ✅ No — tests check observable behavior (response content, event presence) |
| Missing error path tests | ✅ Covered — IT-12 tests error events, IT-19 tests invalid tokens |
| Flaky timing assertions | ✅ No — no time-dependent assertions beyond "non-negative duration" |
