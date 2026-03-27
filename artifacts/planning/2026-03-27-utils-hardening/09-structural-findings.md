# Structural Analysis — WP-08: Utils Hardening

**Date:** 2026-03-27
**Complexity:** Moderate (single-pass inline analysis)

## Conservation Law Analysis

### Invariant: Session token integrity

**Before:** Tokens decoded via manual field checks + `as unknown as SessionPayload` double cast. The type system provides no guarantee that the runtime value matches the compile-time type.

**After:** Tokens decoded via `SessionPayloadSchema.safeParse()`. The runtime validation and compile-time type are derived from compatible definitions. The invariant (every decoded token has all 9 required fields with correct types) is now enforced at the decode boundary.

**Conservation status:** Strengthened.

### Invariant: Key file consistency

**Before:** `existsSync` check followed by `readFile` creates a TOCTOU window. Concurrent processes can corrupt the key between check and read. `writeFile` without atomic rename can leave partial bytes.

**After:** `readFile` with ENOENT catch eliminates the race. Temp-file + `rename` ensures atomicity. Length validation rejects corrupted keys.

**Conservation status:** Established (was previously absent).

### Invariant: ValidationResult completeness

**Before:** Only `'valid'` and `'warning'` states. No way to express a fatal validation error.

**After:** `'error'` state added with dedicated `errors` field. `buildErrorValidation` helper provides consistent construction.

**Conservation status:** Extended (additive, backward-compatible).

## Meta-Law: Type safety at data boundaries

The changes follow a consistent meta-law: **replace unsafe casts at data boundaries with runtime validation that produces the same type**. This pattern appears in:
- Session decode: `as unknown as SessionPayload` → `SessionPayloadSchema.safeParse()`
- Validation skills: `as { primary: string }` → typed `activity.skills.primary`
- Validation steps: `as Record<string, unknown>` → typed `activity.steps`

## Classified Findings

| # | Category | Finding | Severity |
|---|----------|---------|----------|
| — | — | No structural bugs identified | — |

All changes are structurally sound. No conservation law violations detected.
