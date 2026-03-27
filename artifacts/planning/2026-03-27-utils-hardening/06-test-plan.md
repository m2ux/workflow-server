# Test Plan — WP-08: Utils Hardening

## Strategy

This WP modifies foundational utilities with many indirect consumers. The primary verification is:
1. **Type checking** (`npm run typecheck`) — ensures all consumers compile with the updated interfaces
2. **Existing integration tests** (`npm test`) — ensures no behavioral regression

## Verification Matrix

| Finding | Verification Method |
|---------|-------------------|
| QC-015 (ValidationResult error state) | typecheck: consumers compile with wider union |
| QC-045 (TOCTOU) | typecheck + integration: key generation works correctly |
| QC-046 (key size validation) | typecheck: new validation path compiles |
| QC-047/048 (session decode) | integration: session token round-trip works |
| QC-049 (timestamp update) | integration: advanceToken produces valid tokens |
| QC-050 (type assertions) | typecheck: no unsafe casts remain |
| QC-051 (Record cast) | typecheck: typed Activity access compiles |
| QC-052 (undefined guard) | typecheck: null check compiles |
| QC-053 (transition_condition) | typecheck: new validation logic compiles |
| QC-054 (decodeToon cast) | typecheck: signature change compiles |
| QC-055 (atomic rename) | typecheck + integration: key file operations work |
| QC-105 (encoding) | typecheck: explicit encoding parameter |
| QC-106 (timing) | typecheck: timingSafeEqual usage compiles |
| QC-107 (Zod usage) | covered by QC-047/048 fix |
| QC-108 (mutation) | typecheck: spread copy compiles |
| QC-109 (conflation) | typecheck: refined condition logic compiles |
| QC-110 (encodeToon) | typecheck: wider parameter type |
| QC-111 (barrel export) | typecheck: all exports resolve |
| QC-112 (step order) | typecheck: loop logic compiles |

## Pass Criteria

- `npm run typecheck` exits 0
- `npm test` exits 0
- No new lint errors introduced
