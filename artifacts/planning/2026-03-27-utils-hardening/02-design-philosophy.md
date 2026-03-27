# Design Philosophy — WP-08: Utils Hardening

## Problem Statement

The workflow server's utility layer (`src/utils/`) contains 20 findings spanning type safety gaps, race conditions, missing runtime guards, and incomplete exports. These modules — crypto, session, validation, and toon — form the foundational layer consumed by every loader, tool handler, and schema validator. Defects here propagate transitively to every endpoint.

**System understanding:** The utils layer provides session token management (HMAC-signed base64url payloads), server key generation, TOON format encoding/decoding, and validation logic for workflow consistency, activity transitions, and step manifests.

**Impact:** A corrupted key file produces invalid tokens server-wide. An undefined reaching `trim()` crashes validation mid-request. A timing side-channel in HMAC verification could enable token forgery. The double cast in session decode defeats TypeScript's type checking at the most security-sensitive boundary.

**Success criteria:** All 20 findings resolved, `npm run typecheck` and `npm test` pass, no new public API breakage for existing callers.

**Constraints:** Changes must be backward-compatible — callers checking `status === 'valid'` must continue to work. No crypto algorithm changes. No changes to tools-level consumers (WP-07 scope).

## Problem Classification

**Type:** Specific problem — cause known. Each finding identifies a concrete code-level defect with a clear fix strategy.

**Complexity:** Moderate. The 20 findings span 5 files with some interconnection (session.ts depends on crypto.ts, validation.ts is consumed by all tool handlers), but each fix is independently scoped. The key risk is the `ValidationResult` error state addition (QC-015) which changes a public interface type, but analysis shows callers only check `status === 'valid'` or `status === 'warning'`, and the new `'error'` state adds a third possibility without breaking existing comparisons.

## Workflow Path

**Selected:** Skip optional activities (elicitation and research).

**Rationale:** All 20 findings come from a completed structural audit with precise file/line references. The fixes are well-defined code-level changes with no ambiguity in requirements. No external research is needed — the fixes use standard Node.js APIs (`timingSafeEqual`, `rename`, `z.object` Zod validation) and established patterns (atomic file writes, constant-time comparison).

## Design Decisions

1. **ValidationResult error state (QC-015):** Add `'error'` to the status union. Callers that match on `'valid'` or `'warning'` are unaffected — `'error'` is an additive variant. The `buildValidation` function can accept `Error` objects alongside string warnings to produce error-state results.

2. **Session decode validation (QC-047, QC-048):** Replace manual field-by-field type checking and the `as unknown as SessionPayload` double cast with a Zod schema that mirrors the `SessionPayload` interface. The Zod import is already present (QC-107 notes it's used for `sessionTokenParam`), so extending its use for decode validation is natural.

3. **HMAC timing safety (QC-106):** Replace the manual character-by-character comparison with `crypto.timingSafeEqual` on Buffers. This eliminates both the early-return length check and the manual XOR loop.

4. **Atomic key writes (QC-045, QC-055):** Write key to a temporary file then rename, avoiding the TOCTOU window between `existsSync` check and `writeFile`. Use `readFile` with error handling instead of `existsSync` to eliminate the race entirely.

5. **Barrel export (QC-111):** Re-export all public modules (crypto, session, validation, toon) from index.ts.
