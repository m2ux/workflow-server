# Work Package Plan — WP-08: Utils Hardening

## Approach

Apply 20 targeted fixes across 5 utility files. Changes are grouped by file to minimize context switching. Each file's changes are internally ordered by dependency (type definitions before functions that use them).

## Implementation Order

### 1. validation.ts (7 findings)

| Order | Finding | Change |
|-------|---------|--------|
| 1a | QC-015 | Add `'error'` to `ValidationResult.status` union; add `buildErrorValidation` helper |
| 1b | QC-050 | Replace unsafe `as { primary: string }` casts in `validateSkillAssociation` with proper type narrowing |
| 1c | QC-051 | Replace `as Record<string, unknown>` cast with typed Activity access to `steps` field |
| 1d | QC-052 | Add null/undefined guard before `entry.output.trim()` |
| 1e | QC-053 | Validate `transition_condition` in `validateActivityManifest` against workflow transitions |
| 1f | QC-109 | Distinguish empty string, undefined, and `'default'` in `validateTransitionCondition` |
| 1g | QC-112 | Report all step order mismatches, not just the first |

### 2. crypto.ts (5 findings)

| Order | Finding | Change |
|-------|---------|--------|
| 2a | QC-045 | Eliminate TOCTOU: use try/readFile instead of existsSync+readFile |
| 2b | QC-046 | Validate key length is exactly 32 bytes after reading |
| 2c | QC-055 | Atomic write: writeFile to temp path, then rename |
| 2d | QC-105 | Explicit `'utf8'` encoding in `decryptToken` Buffer conversion |
| 2e | QC-106 | Replace manual comparison with `crypto.timingSafeEqual` |

### 3. session.ts (4 findings)

| Order | Finding | Change |
|-------|---------|--------|
| 3a | QC-047/048 | Replace manual field checking + double cast with Zod schema parse |
| 3b | QC-049 | Update timestamp on advance; add optional expiration check |
| 3c | QC-107 | Zod already imported; extend usage is the fix (via 3a) |
| 3d | QC-108 | Spread-copy decoded payload instead of mutating |

### 4. toon.ts (2 findings)

| Order | Finding | Change |
|-------|---------|--------|
| 4a | QC-054 | Document the unsafe cast, add runtime validation option |
| 4b | QC-110 | Widen `encodeToon` parameter type to accept arrays and primitives |

### 5. index.ts (1 finding)

| Order | Finding | Change |
|-------|---------|--------|
| 5a | QC-111 | Re-export all public modules: crypto, session, validation, toon |

## Risk Mitigation

- **QC-015 (ValidationResult):** Callers only pass through to `_meta`; no branching on status values. Adding `'error'` is additive.
- **QC-045/055 (crypto race):** Atomic rename ensures no partial writes. readFile-first pattern eliminates check-then-read race.
- **QC-047/048 (session decode):** Zod schema mirrors SessionPayload interface exactly; parse errors produce clear messages.

## Verification

1. `nice -n 19 npm run typecheck` — type safety across all consumers
2. `nice -n 19 npm test` — existing integration tests pass
