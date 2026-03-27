# WP-01: Security Hardening

## Scope

**In scope:**
- QC-003: Add path validation to `save_state` / `restore_state` — reject path traversal sequences, enforce workspace root or directory allowlist
- QC-004: Move `_session_token_encrypted` flag out of user-accessible `variables` namespace into dedicated metadata field

**Out of scope:**
- General authentication/authorization (not identified in audit)
- Encryption algorithm changes (key rotation is PR-7)

**Files:** `src/tools/state-tools.ts`

## Dependencies

None. This package has no prerequisites and should ship first.

## Effort

2 findings, 1 file. Small, focused change.

## Success Criteria

- `save_state` and `restore_state` reject paths containing `..` or absolute paths outside workspace
- `_session_token_encrypted` is stored in a field that agents cannot forge via `variables`
- Existing tests pass; new tests cover path traversal rejection
- `npm run typecheck` and `npm test` pass
