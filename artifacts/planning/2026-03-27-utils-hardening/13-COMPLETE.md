# WP-08: Utils Hardening — COMPLETE

**Completed:** 2026-03-27
**PR:** [#75](https://github.com/m2ux/workflow-server/pull/75)
**Issue:** [#67](https://github.com/m2ux/workflow-server/issues/67)

## Delivery Summary

All 20 findings from the quality & consistency audit's utils module scope have been addressed across 5 files (+98/-59 lines).

## Findings Resolved

| ID | Finding | Resolution |
|----|---------|------------|
| QC-015 | `ValidationResult` has no error/invalid state | Added `'error'` status and `errors` field with `buildErrorValidation` helper |
| QC-045 | TOCTOU race in `getOrCreateServerKey` | Replaced `existsSync` + `readFile` with try/readFile + ENOENT catch |
| QC-046 | No validation that key is exactly 32 bytes | Added length check after read, throws on mismatch |
| QC-047 | Manual field type checking | Replaced with Zod `SessionPayloadSchema.safeParse()` |
| QC-048 | Double cast `as unknown as SessionPayload` | Eliminated — Zod parse returns typed `SessionPayload` directly |
| QC-049 | Session timestamp never updated | `advanceToken` now updates `ts` to current time |
| QC-050 | Unsafe type assertions in `validateSkillAssociation` | Destructured typed `activity.skills` directly |
| QC-051 | Cast to `Record<string, unknown>` for steps | Destructured typed `activity.steps` directly |
| QC-052 | `entry.output.trim()` throws on undefined | Added `typeof` guard before `trim()` |
| QC-053 | `validateActivityManifest` ignores `transition_condition` | Added validation against workflow transition definitions |
| QC-054 | `decodeToon<T>` unsafe `as T` cast | Documented caller responsibility for runtime validation |
| QC-055 | Key generation writes without atomic rename | Write to temp file + `rename()` for atomicity |
| QC-105 | Implicit Buffer encoding conversion | Explicit `'utf8'` encoding in `decryptToken` |
| QC-106 | `hmacVerify` timing side-channel | Replaced manual XOR loop with `crypto.timingSafeEqual` |
| QC-107 | Zod imported but used for single descriptor | Extended Zod usage for session decode validation |
| QC-108 | `advanceToken` mutates decoded payload | Spread-copy creates new object |
| QC-109 | `validateTransitionCondition` conflates empty/undefined/default | Named booleans distinguish undefined, empty, and 'default' |
| QC-110 | `encodeToon` silently narrows library capability | Widened parameter type to accept arrays and unknown |
| QC-111 | Barrel export re-exports only toon.ts | Added re-exports for crypto, session, validation |
| QC-112 | Step order validation stops at first mismatch | Removed `break` to report all mismatches |

## Verification

- `npm run typecheck`: 0 errors
- `npm test`: 187/187 passed
- Code review: No blocking findings
- Structural analysis: No conservation law violations
