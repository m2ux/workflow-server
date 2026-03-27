# Code Review — WP-01: Security Hardening

**Commit:** `51dc35e` on `fix/wp01-security-hardening`
**Reviewer:** post-impl-review (automated)

## QC-003: Path Validation — Correct

The `validateStatePath` function (L17-24) is well-implemented:

- Uses `resolve()` to normalize the input path (handles `..`, `.`, redundant separators).
- Checks `resolved !== root && !resolved.startsWith(root + sep)` — the `+ sep` prevents prefix-spoofing (e.g., `/workspace-evil` won't match `/workspace`).
- The `resolved === root` case correctly allows the workspace root itself.
- Applied to both `save_state` (L53) and `restore_state` (L106), before any filesystem operations.
- Exported for direct unit testing with `@internal` JSDoc tag.

**Verdict:** No issues.

## QC-004: Encryption Flag — Three Issues Found

### F1 (Critical): Schema field is required, not optional

`state.schema.ts` L160:
```typescript
sessionTokenEncrypted: z.boolean(),  // ← required
```

The plan specified `z.boolean().optional()`. The field is required, which means any existing saved state file on disk that lacks `sessionTokenEncrypted` will fail `StateSaveFileSchema.safeParse()` during `restore_state`. This is a **backward-compatibility break**.

The tests pass because they were updated to include `sessionTokenEncrypted: false` in all test fixtures, but real legacy state files on disk won't have this field.

**Fix:** Change to `z.boolean().optional()` or `z.boolean().default(false)`.

### F2 (High): Missing legacy fallback on restore

`state-tools.ts` L115:
```typescript
if (restored.sessionTokenEncrypted && typeof restored.state.variables['session_token'] === 'string') {
```

The plan specified a `??` fallback:
```typescript
const isEncrypted = restored.sessionTokenEncrypted
  ?? restored.state.variables['_session_token_encrypted'];
```

Without this fallback, even if F1 is fixed (making the field optional), old state files that stored `_session_token_encrypted: true` in `variables` will not have their encrypted tokens decrypted. The encrypted ciphertext would be returned as the session token.

**Fix:** Add the `??` fallback to check the legacy `variables` location.

### F3 (Medium): Legacy flag not cleaned on restore

The plan specified cleaning up the legacy `_session_token_encrypted` from `variables` after restore:
```typescript
delete restored.state.variables['_session_token_encrypted'];
```

This line is absent. If a legacy file is restored, the underscore-prefixed flag will remain in `variables`, which is the exact forgery vector QC-004 was designed to close.

**Fix:** Add `delete restored.state.variables['_session_token_encrypted'];` after the decryption block.

## General Quality

| Aspect | Assessment |
|--------|-----------|
| Naming | Good — `validateStatePath`, `sessionTokenEncrypted` are clear |
| Error messages | Good — includes the input path in the validation error |
| Import changes | Minimal — added `resolve`, `sep` to existing `node:path` import |
| No debug prints | Confirmed |
| No process attribution | Confirmed |
| Code style | Consistent with existing patterns |

## Summary

| Finding | Severity | Type | Requires Fix |
|---------|----------|------|-------------|
| F1: Schema field is required, not optional | Critical | Backward compat | Yes |
| F2: Missing legacy `??` fallback | High | Backward compat | Yes |
| F3: Legacy flag not cleaned on restore | Medium | Incomplete remediation | Yes |
