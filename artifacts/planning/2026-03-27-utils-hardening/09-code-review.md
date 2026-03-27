# Code Review — WP-08: Utils Hardening

**Reviewer:** Automated
**Date:** 2026-03-27
**Scope:** `src/utils/` (crypto.ts, session.ts, validation.ts, toon.ts, index.ts)

## Summary

20 findings addressed across 5 files with +98/-59 lines changed. All changes are backward-compatible with existing consumers.

## Findings

### Positive

| # | Observation | Severity |
|---|------------|----------|
| 1 | `getOrCreateServerKey` now uses try/readFile pattern eliminating TOCTOU race entirely | — |
| 2 | Atomic temp-file-then-rename prevents partial key writes | — |
| 3 | Zod schema parse in session decode provides structured error messages with field paths | — |
| 4 | `timingSafeEqual` is the canonical Node.js constant-time comparison | — |
| 5 | Spread-copy in `advanceToken` prevents reference leaks | — |
| 6 | `ValidationResult` error state is additive — no existing callers affected | — |
| 7 | Typed Activity access for `skills` and `steps` eliminates all unsafe casts in validation | — |

### Informational

| # | Observation | Severity | Recommendation |
|---|------------|----------|----------------|
| 1 | `hmacVerify` still has an early-return length check before `timingSafeEqual` | Info | Acceptable — `timingSafeEqual` requires equal-length buffers; the length check is a precondition, not a timing leak since HMAC outputs are fixed-length |
| 2 | `encodeToon` parameter type uses `unknown` as fallback | Info | Acceptable — the underlying library handles serialization; the cast is contained within the wrapper |
| 3 | `decodeToon` still uses `as T` cast | Info | Expected — documented that callers are responsible for validation. Changing this would require all 6+ callers to handle `unknown` return types |
| 4 | `SessionPayloadSchema` duplicates the `SessionPayload` interface fields | Info | Acceptable trade-off — maintaining a single source of truth via `z.infer` would require refactoring all consumers of the interface |

### No issues found at severity High, Medium, or Low.

## Verdict

All changes acceptable. No blocking findings.
