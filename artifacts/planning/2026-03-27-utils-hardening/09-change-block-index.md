# Change Block Index — WP-08: Utils Hardening

**Generated:** 2026-03-27
**Base:** main
**Head:** fix/wp08-utils-hardening
**Files changed:** 5
**Total:** +98 / -59 lines

**Estimated review time:** ~3 minutes (18 change blocks × 10s/block)

| Row | File | Lines | Change Summary | Findings |
|-----|------|-------|----------------|----------|
| 1 | `src/utils/crypto.ts` | 1–5 | Import: add `timingSafeEqual`, `rename`; remove `existsSync`, `chmod` | QC-045, QC-055, QC-106 |
| 2 | `src/utils/crypto.ts` | 11–33 | `getOrCreateServerKey`: try/readFile instead of existsSync (TOCTOU fix), key length validation, atomic temp+rename write | QC-045, QC-046, QC-055 |
| 3 | `src/utils/crypto.ts` | 48–51 | `decryptToken`: explicit `'utf8'` encoding on `decipher.update` | QC-105 |
| 4 | `src/utils/crypto.ts` | 56–63 | `hmacVerify`: replace manual XOR loop with `timingSafeEqual` on Buffers | QC-106 |
| 5 | `src/utils/index.ts` | 1–4 | Barrel export: add re-exports for crypto, session, validation | QC-111 |
| 6 | `src/utils/session.ts` | 30–41 | New `SessionPayloadSchema` Zod object mirroring `SessionPayload` interface | QC-047, QC-048, QC-107 |
| 7 | `src/utils/session.ts` | 56–68 | `decode`: replace manual field checks + double cast with `SessionPayloadSchema.safeParse` | QC-047, QC-048 |
| 8 | `src/utils/session.ts` | 88–105 | `advanceToken`: spread-copy instead of mutate; update timestamp | QC-108, QC-049 |
| 9 | `src/utils/toon.ts` | 2–8 | `decodeToon`: updated JSDoc documenting caller validation responsibility | QC-054 |
| 10 | `src/utils/toon.ts` | 13–19 | `encodeToon`: widened parameter type from `Record<string, unknown>` to include arrays and unknown | QC-110 |
| 11 | `src/utils/validation.ts` | 5–8 | `ValidationResult`: add `'error'` to status union, add optional `errors` field | QC-015 |
| 12 | `src/utils/validation.ts` | 38–50 | `validateSkillAssociation`: destructure `skills`, use typed `primary`/`supporting` directly | QC-050 |
| 13 | `src/utils/validation.ts` | 70–73 | `validateStepManifest`: destructure `steps` from typed Activity instead of Record cast | QC-051 |
| 14 | `src/utils/validation.ts` | 90–93 | Step order loop: remove `break` to report all mismatches | QC-112 |
| 15 | `src/utils/validation.ts` | 97–98 | `entry.output` guard: add `typeof` check before `.trim()` | QC-052 |
| 16 | `src/utils/validation.ts` | 102–125 | `validateTransitionCondition`: distinguish undefined/empty/default with named booleans | QC-109 |
| 17 | `src/utils/validation.ts` | 148–165 | `validateActivityManifest`: validate `transition_condition` against workflow transitions; add output type guard | QC-053, QC-052 |
| 18 | `src/utils/validation.ts` | 178–187 | New `buildErrorValidation` helper for error-state `ValidationResult` | QC-015 |
