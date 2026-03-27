# Test Plan — WP-01: Security Hardening

## Scope

Tests for QC-003 (path traversal prevention) and QC-004 (encryption flag integrity). All new tests go in `tests/state-persistence.test.ts` alongside existing schema and round-trip tests.

## Strategy

Since the existing tests exercise schemas and TOON encoding (not the actual tool handlers), the new tests will:
1. **Unit-test `validateStatePath`** directly (exported or tested via the tool handlers)
2. **Test schema changes** for `sessionTokenEncrypted` field
3. **Integration-test encryption flag migration** through the save/restore data flow

The `validateStatePath` function will be tested by importing it directly (if exported) or indirectly through save_state/restore_state behavior. Given this is a small module, direct unit tests of the helper are preferred.

## Test Cases

### T1: Path Traversal Rejection (QC-003)

#### T1.1: Reject relative path with `..` traversal
```
Input:  "../../etc/passwd"
Expect: Error thrown with "resolves outside the workspace root"
```

#### T1.2: Reject absolute path outside workspace
```
Input:  "/tmp/malicious-folder"
Expect: Error thrown with "resolves outside the workspace root"
```

#### T1.3: Reject path with embedded traversal
```
Input:  "valid-folder/../../outside"
Expect: Error thrown (resolves above workspace root)
```

#### T1.4: Accept valid workspace-relative path
```
Input:  ".engineering/artifacts/planning/test-folder"
Expect: Returns resolved absolute path under process.cwd()
```

#### T1.5: Accept workspace root itself
```
Input:  "."
Expect: Returns process.cwd() (the root itself is valid)
```

#### T1.6: Accept absolute path within workspace
```
Input:  join(process.cwd(), "planning/subfolder")
Expect: Returns the path unchanged (already absolute, within workspace)
```

#### T1.7: Reject workspace-prefix spoofing
```
Input:  process.cwd() + "-evil/attack"
Expect: Error thrown (not a descendant — prefix match without separator)
```

### T2: Schema Field — `sessionTokenEncrypted` (QC-004)

#### T2.1: Schema accepts save file with `sessionTokenEncrypted: true`
```
Input:  Valid StateSaveFile object with sessionTokenEncrypted: true
Expect: safeParse succeeds
```

#### T2.2: Schema accepts save file without `sessionTokenEncrypted`
```
Input:  Valid StateSaveFile object without the field
Expect: safeParse succeeds (backward compat)
```

#### T2.3: Schema accepts save file with `sessionTokenEncrypted: false`
```
Input:  Valid StateSaveFile object with sessionTokenEncrypted: false
Expect: safeParse succeeds
```

### T3: Encryption Flag Migration (QC-004)

#### T3.1: New-format save file — flag in schema, not variables
```
Input:  StateSaveFile with sessionTokenEncrypted: true, no flag in variables
Expect: Restore correctly identifies token as encrypted, decrypts it
```

#### T3.2: Legacy-format save file — flag in variables only
```
Input:  StateSaveFile without sessionTokenEncrypted, with variables._session_token_encrypted: true
Expect: Restore falls back to variables flag, decrypts correctly
```

#### T3.3: Flag in variables is cleaned on restore
```
Input:  StateSaveFile with _session_token_encrypted in variables
Expect: After restore, variables no longer contains _session_token_encrypted
```

#### T3.4: No encryption when flag absent everywhere
```
Input:  StateSaveFile without sessionTokenEncrypted, without variables flag, with plaintext session_token
Expect: session_token returned as-is (no decryption attempted)
```

#### T3.5: Variables flag ignored when schema flag is false
```
Input:  StateSaveFile with sessionTokenEncrypted: false, variables._session_token_encrypted: true
Expect: Schema-level field takes precedence — no decryption (schema field is authoritative)
```

Note: T3.5 tests that the schema field is authoritative. If `sessionTokenEncrypted` is explicitly `false`, the legacy `variables` flag is ignored. This prevents an agent from injecting `_session_token_encrypted: true` into variables to force decryption after the fix is deployed.

## Test Implementation Notes

- Path validation tests can use `process.cwd()` as the reference point; they don't need disk I/O.
- Encryption flag tests need mock state objects but don't require actual crypto operations for schema tests. Integration tests that verify decrypt behavior will need a real key (use `getOrCreateServerKey()` in test setup).
- Use `vi.spyOn` or direct function calls — avoid spinning up the full MCP server for these unit tests.

## Implementation Status

All T1 and T2 tests implemented in `tests/state-persistence.test.ts`. T3 (flag migration) deferred — requires MCP server integration test harness.

| Plan ID | Test | File Location | Status |
|---------|------|---------------|--------|
| T1.1 | Reject relative `..` traversal | `tests/state-persistence.test.ts:304` | ✅ Implemented |
| T1.2 | Reject absolute path outside workspace | `tests/state-persistence.test.ts:308` | ✅ Implemented |
| T1.3 | Reject embedded traversal | `tests/state-persistence.test.ts:312` | ✅ Implemented |
| T1.4 | Accept workspace-relative path | `tests/state-persistence.test.ts:321` | ✅ Implemented |
| T1.5 | Accept workspace root | `tests/state-persistence.test.ts:333` | ✅ Implemented |
| T1.6 | Accept absolute path within workspace | `tests/state-persistence.test.ts:327` | ✅ Implemented |
| T1.7 | Reject prefix spoofing | `tests/state-persistence.test.ts:316` | ✅ Implemented |
| T2.1 | Schema accepts `true` | `tests/state-persistence.test.ts:370` | ✅ Implemented |
| T2.2 | Schema requires field | `tests/state-persistence.test.ts:360` | ✅ Implemented |
| T2.3 | Schema accepts `false` | `tests/state-persistence.test.ts:365` | ✅ Implemented |
| T3.1–T3.5 | Flag migration (5 tests) | — | ⬚ Deferred |

## Coverage Targets

| Area | Before | After |
|------|--------|-------|
| Path validation | 0 tests | 7 tests (T1.1–T1.7) |
| Schema field | 0 tests | 3 tests (T2.1–T2.3) |
| Flag migration | 0 tests | 0 tests (deferred) |
| **Total new** | — | **10 tests** |
