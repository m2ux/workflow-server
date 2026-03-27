# Change Block Index — WP-01: Security Hardening

**Branch:** `fix/wp01-security-hardening` (2 commits ahead of `main`)
**Commits:** `eb822ff` (init), `c9ee9c5` (implementation)

## Summary

2 files changed, 26 insertions, 7 deletions.

## File Index

| Row | File | Hunk | Lines | Change Description | Finding |
|-----|------|------|-------|--------------------|---------|
| 1 | `src/schema/state.schema.ts` | 1/1 | +1 | Add `sessionTokenEncrypted: z.boolean().optional()` to `StateSaveFileSchema` | QC-004 |
| 2 | `src/tools/state-tools.ts` | 1/4 | +1, -1 | Import `resolve`, `sep` from `node:path` | QC-003 |
| 3 | `src/tools/state-tools.ts` | 2/4 | +10 | Add `validateStatePath()` — resolves path, checks `startsWith(cwd + sep)` | QC-003 |
| 4 | `src/tools/state-tools.ts` | 3/4 | +10, -4 | `save_state`: call `validateStatePath`, move encryption flag to `saveFile.sessionTokenEncrypted`, delete legacy `_session_token_encrypted` from variables | QC-003, QC-004 |
| 5 | `src/tools/state-tools.ts` | 4/4 | +5, -2 | `restore_state`: call `validateStatePath`, check `sessionTokenEncrypted` with `??` fallback to legacy `variables` flag, always clean legacy flag | QC-003, QC-004 |

## Structural Notes

- **No new files** added.
- **No API signature changes** — tool parameter names and types unchanged.
- **Backward compatible** — `sessionTokenEncrypted` is optional; `restore_state` checks both new and legacy flag locations.
- **No new dependencies** — uses Node.js built-in `path.resolve` and `path.sep`.
