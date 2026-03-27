# WP-08: Utils Hardening

## Scope

**In scope:**
- QC-015: `ValidationResult` has no error/invalid state
- QC-045–QC-055: 11 Medium-severity utils findings (TOCTOU, key validation, type safety, session expiration, unsafe casts)
- QC-105–QC-112: 8 Low-severity utils findings (encoding, timing side-channel, barrel export, step validation)

**Out of scope:**
- Tools-level changes that consume utils (WP-07)
- Crypto algorithm changes

**Files:** `src/utils/validation.ts`, `src/utils/crypto.ts`, `src/utils/session.ts`, `src/utils/toon.ts`, `src/utils/index.ts`

## Dependencies

None.

## Effort

20 findings across 5 files. Medium-large scope.

## Success Criteria

- `ValidationResult` has an `'error'` or `'invalid'` state
- `getOrCreateServerKey` is atomic (no TOCTOU race)
- Key file validated as exactly 32 bytes on read
- Session decode boundary uses runtime validation instead of double cast
- `hmacVerify` uses constant-time comparison without early-return length check
- Barrel export re-exports all public modules
- `npm run typecheck` and `npm test` pass
