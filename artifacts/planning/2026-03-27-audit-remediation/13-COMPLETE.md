# WP-01: Security Hardening — Completion Record

**Completed:** 2026-03-27
**PR:** [#68](https://github.com/m2ux/workflow-server/pull/68)
**Issue:** [#67](https://github.com/m2ux/workflow-server/issues/67)
**Branch:** `fix/wp01-security-hardening`

## Deliverables

### QC-003: Path Traversal Prevention
- `validateStatePath()` helper in `src/tools/state-tools.ts` (L17-24)
- Resolves input via `path.resolve()`, rejects paths outside `process.cwd()` using `startsWith(root + sep)` prefix check
- Applied to `save_state` (`planning_folder_path` parameter) and `restore_state` (`file_path` parameter) before any filesystem operations

### QC-004: Encryption Flag Integrity
- `sessionTokenEncrypted: z.boolean()` field added to `StateSaveFileSchema` in `src/schema/state.schema.ts`
- `save_state` writes flag to schema-level field instead of `variables['_session_token_encrypted']`
- `restore_state` reads from the new schema field
- Legacy `_session_token_encrypted` cleaned from variables on save

## Files Changed

| File | Insertions | Deletions |
|------|-----------|-----------|
| `src/tools/state-tools.ts` | +29 | -7 |
| `src/schema/state.schema.ts` | +1 | 0 |
| `tests/state-persistence.test.ts` | +80 | -1 |
| **Total** | **+110** | **-8** |

## Test Coverage

- **10 new tests** in `tests/state-persistence.test.ts`
  - 7 path validation tests (traversal, absolute, embedded, prefix-spoofing, valid paths)
  - 3 schema field tests (required, accepts true, accepts false)
- **197 total tests passing**, 0 failures
- Typecheck clean (`tsc --noEmit`)

## Deferred Items

- **T3.1–T3.5 (flag migration integration tests):** Require MCP server integration test harness to exercise actual tool handler save/restore flow with encrypted tokens. Can be added when WP-09 (test infrastructure) ships.

## Known Limitations

1. **Sandbox boundary is `process.cwd()`:** If the server is launched from a directory above the project root (e.g., `/`), the sandbox is too broad. Mitigated by convention (MCP servers launch from project root) and documented in assumption A1.
2. **Symlinks not resolved:** `path.resolve()` normalizes `..` but does not follow symlinks. A symlink inside the workspace pointing outside it would pass validation. Accepted residual risk per assumption A4.
3. **`sessionTokenEncrypted` is required, not optional:** New state files must include this field. Legacy state files without it will fail `safeParse`. This is a deliberate schema version bump — all save operations now include the field.

## Commits

| SHA | Message |
|-----|---------|
| `eb822ff` | `chore: init WP-01: Security hardening for state tools` |
| `51dc35e` | `fix(state): add path validation and move encryption flag to schema field (#67)` |
| `68acb8e` | `test(state): add path validation and schema field tests (#67)` |
