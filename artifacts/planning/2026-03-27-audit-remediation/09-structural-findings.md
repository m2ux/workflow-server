# Structural Findings — WP-01: Security Hardening

Lightweight single-pass structural analysis of the security hardening changes.

## Path Validation (QC-003) — Sound

The `validateStatePath` function provides a correct, fail-closed path sandbox:

1. **Normalization**: `path.resolve()` canonicalizes `..`, `.`, multiple separators, and resolves relative paths against `process.cwd()`.
2. **Prefix check**: `startsWith(root + sep)` prevents both traversal and prefix-spoofing.
3. **Root inclusion**: `resolved === root` allows the workspace root as a valid path.
4. **Placement**: Validation runs before any I/O operation in both handlers.

**Residual risk (accepted):** Symlinks within the workspace that point outside it are not caught. This was documented in assumption A4 as acceptable for the current threat model.

**Edge case — empty string input:** `resolve('')` returns `process.cwd()`, which passes the `resolved === root` check. This means `save_state` with `planning_folder_path: ""` would write to the workspace root. This is benign (not a security issue) but could be confusing for users. Not a blocker.

## Encryption Flag (QC-004) — Three Gaps

### Gap 1: Schema requires field — breaks old files

The `sessionTokenEncrypted` field on `StateSaveFileSchema` is `z.boolean()` (required). Old state files that predate this change do not contain this field. `safeParse()` will fail, causing `restore_state` to throw.

**Impact:** Any previously saved workflow state becomes unrestorable.

### Gap 2: No legacy fallback — encrypted tokens lost

Without checking `variables['_session_token_encrypted']` as a fallback, old state files with legitimately encrypted session tokens will not have them decrypted. The encrypted ciphertext would be returned verbatim as a "session token," causing downstream authentication failures.

### Gap 3: Legacy flag survives restore

The `_session_token_encrypted` key is not removed from `variables` on restore. This means the flag persists in the returned state object, and if the state is subsequently re-saved with the new code, the flag would survive in `variables` alongside the new schema-level field — exactly the dual-location problem QC-004 was intended to eliminate.

## Dependency Analysis

No new runtime dependencies introduced. The fix uses only `node:path` built-ins (`resolve`, `sep`), which were already partially imported.

## Summary

| Area | Finding | Severity |
|------|---------|----------|
| Path validation | Sound, no gaps | — |
| Schema field | Required instead of optional (F1) | Critical |
| Legacy fallback | Missing `??` fallback (F2) | High |
| Legacy cleanup | Flag not deleted (F3) | Medium |
