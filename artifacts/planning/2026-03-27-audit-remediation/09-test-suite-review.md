# Test Suite Review — WP-01: Security Hardening

## Current Test State

`tests/state-persistence.test.ts` — 11 tests, all passing. The existing tests were updated to include `sessionTokenEncrypted: false` in test fixtures to match the new required schema field.

## Coverage Analysis

### What IS tested

| Area | Tests | Coverage |
|------|-------|----------|
| `StateSaveFileSchema` validation | 1 test (L150-174) | Validates a complete save file with new field |
| TOON round-trip (flat) | 1 test (L178-192) | Encodes/decodes with `sessionTokenEncrypted: false` |
| TOON round-trip (nested) | 1 test (L194-250) | Encodes/decodes nested state with new field |
| Disk round-trip | 1 test (L252-277) | Write + read + validate with new field |
| Backward compat (base schema) | 2 tests (L280-299) | WorkflowState without nested state |

### What is NOT tested — Critical Gaps

| Gap | Severity | Test Needed |
|-----|----------|-------------|
| G1: Path traversal rejection | **High** | `validateStatePath` should reject `../../etc/passwd`, `/tmp/evil`, `valid/../../outside` |
| G2: Valid path acceptance | **High** | `validateStatePath` should accept workspace-relative paths, absolute paths within workspace |
| G3: Prefix-spoofing rejection | **High** | `validateStatePath` should reject `process.cwd() + "-evil/attack"` |
| G4: Schema backward compat | **Critical** | `StateSaveFileSchema` should accept objects WITHOUT `sessionTokenEncrypted` (currently would fail — see F1) |
| G5: Encryption flag in new location | **Medium** | Save file should have `sessionTokenEncrypted: true` when token is encrypted |
| G6: Legacy flag fallback on restore | **Medium** | Restore should decrypt when `_session_token_encrypted` is in variables (legacy) |
| G7: Legacy flag cleanup | **Medium** | Restore should delete `_session_token_encrypted` from variables |
| G8: No-flag case | **Medium** | Restore should NOT attempt decryption when no flag is set |

### Test Plan Alignment

The test plan (`06-test-plan.md`) specified 15 new tests across 3 categories:
- **T1 (path validation):** 7 tests — **0 implemented**
- **T2 (schema field):** 3 tests — **0 implemented** (existing tests updated but no new backward-compat tests)
- **T3 (flag migration):** 5 tests — **0 implemented**

**0 of 15 planned tests were added.** Existing tests were modified to accommodate the new field but no security-specific tests exist.

## Risk Assessment

The absence of path traversal tests means the core security fix (QC-003) has no regression protection. If `validateStatePath` is accidentally removed or weakened in a future change, no test will catch it.

The absence of backward-compatibility tests for the schema field means the F1 bug (required instead of optional) was not caught by the test suite.

## Recommendation

**Before merge:** Add at minimum the 7 path validation tests (T1.1-T1.7) and the 3 schema field tests (T2.1-T2.3). These are the tests that directly guard the security properties this PR is designed to establish. The 5 migration tests (T3) are important but lower priority.
