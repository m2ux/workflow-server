# Test Suite Review — WP-08: Utils Hardening

**Date:** 2026-03-27
**Test results:** 187/187 passed (10 test files, 2.08s)

## Coverage Assessment

The utils layer does not have dedicated unit tests. Coverage comes through integration tests in `tests/mcp-server.test.ts` which exercise the full request pipeline including session token creation, decode, advance, and validation.

### Integration Coverage

| Module | Coverage Path | Status |
|--------|--------------|--------|
| crypto.ts | `getOrCreateServerKey` called during every session operation | Indirect |
| session.ts | `createSessionToken`, `decodeSessionToken`, `advanceToken` exercised by all tool tests | Indirect |
| validation.ts | `buildValidation`, `validateWorkflowConsistency`, `validateActivityTransition` called on every tool request | Indirect |
| toon.ts | `decodeToon` called by all loader tests | Indirect |
| index.ts | Barrel export — covered if any consumer imports from utils | Indirect |

### Gap Analysis

| # | Gap | Severity | Recommendation |
|---|-----|----------|----------------|
| 1 | No unit tests for `getOrCreateServerKey` ENOENT/corruption paths | Low | Defer to WP-09 (test infrastructure) |
| 2 | No unit tests for `buildErrorValidation` | Low | New function, not yet consumed — test when first consumer is added |
| 3 | No unit tests for `validateTransitionCondition` edge cases (undefined vs empty vs default) | Low | Defer to WP-09 |
| 4 | No tests for `timingSafeEqual` path in `hmacVerify` | Low | Behavioral equivalence verified by passing integration tests |

### Anti-Patterns

None detected. The existing integration tests are well-structured with clear assertions.

## Verdict

All 187 tests pass. The indirect coverage through integration tests is sufficient for this hardening WP. Dedicated unit tests for edge cases are appropriately deferred to WP-09 (test infrastructure).
