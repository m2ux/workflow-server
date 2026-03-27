# Test Plan — WP-10: Server Core Cleanup

**Created:** 2026-03-27

---

## Verification Strategy

All changes are verified through the existing test suite (`npm test`) and type checker (`npm run typecheck`). No new test files are needed — the fixes are correctness improvements to internal infrastructure that is exercised by existing integration tests.

---

## Verification Matrix

| Finding | Verification Method |
|---------|-------------------|
| QC-056: Config mutation | Typecheck (clone usage); existing tests pass |
| QC-057: Session eviction | Typecheck (constructor param); behavior verified by trace tests |
| QC-058: Token validation | Typecheck (field checks); existing token round-trip tests |
| QC-059: Double-append | Code structure review; existing audit log tests |
| QC-060: Key race | Code review (promise cache pattern); existing crypto tests |
| QC-113: Optional fields | Typecheck (`ResolvedServerConfig` type) |
| QC-114: Double error handler | Code structure review |
| QC-115: Truncated UUID | Code review (full UUID) |
| QC-116: Empty env var | Code review (trim + fallback) |
| QC-117: Error codes | Typecheck (typed union) |
| QC-118: Unbounded log | Code review (truncation guard) |
| QC-119: unwrap loses props | Code review (property copy) |
| QC-120: Hardcoded tool list | Code review (dynamic or removed) |
| QC-121: Timestamp redundancy | Code review (single source of truth) |

---

## Pass Criteria

- `npm run typecheck` exits 0
- `npm test` exits 0 with all tests passing
- No new lint warnings introduced
