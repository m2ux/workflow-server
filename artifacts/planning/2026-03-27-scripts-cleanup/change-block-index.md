# WP-11: Change Block Index

## Summary

13 findings remediated across 6 script files. All changes are additive guards and normalizations — no architectural rewrites.

## Change Blocks

### CB-01: deploy.sh — Network timeouts (QC-079)
- **Lines:** `timed_git()` wrapper function, all `git clone`/`git push`/`git ls-remote` calls
- **Change:** Wrapped network-calling git operations with `timeout $NETWORK_TIMEOUT` (default 30s)
- **Risk:** Low — timeout is generous; only affects hung connections

### CB-02: deploy.sh — Push access verification (QC-083)
- **Lines:** `verify_push_access()` function, called before real pushes
- **Change:** Added `git push --dry-run` check before attempting actual pushes
- **Risk:** Low — dry-run is read-only; fails gracefully

### CB-03: deploy.sh — Self-delete removal (QC-134)
- **Lines:** `KEEP_SCRIPT=true` default, `--no-keep` flag added
- **Change:** Script no longer deletes itself by default; opt-in via `--no-keep`
- **Risk:** None — behavioral change is opt-in

### CB-04: deploy.sh — Trap-based cleanup (QC-135)
- **Lines:** `cleanup()` function, `trap cleanup EXIT`, `TEMP_DIRS_TO_CLEAN` array
- **Change:** All temp directories registered for cleanup and removed on exit (success or failure)
- **Risk:** None — strictly additive

### CB-05: deploy.sh — Input sanitization (QC-136)
- **Lines:** `PROJECT_NAME` sanitization via `tr -cd 'a-zA-Z0-9._-'`
- **Change:** Strip non-alphanumeric/hyphen/underscore/dot characters from project name
- **Risk:** Low — only removes characters that would cause shell issues

### CB-06: validate-workflow.ts — Ajv strict mode (QC-082)
- **Lines:** `new Ajv({ allErrors: true, strict: true })`
- **Change:** Changed `strict: false` to `strict: true`
- **Risk:** Medium — may surface new warnings for existing schemas, but these are informational

### CB-07: validate-workflow-toon.ts — Directory structure guards (QC-138)
- **Lines:** Early `workflow.toon` existence check before loading
- **Change:** Validates directory is a workflow dir before attempting to load
- **Risk:** None — fails early with clear message instead of cryptic error

### CB-08: validate-workflow-toon.ts + validate-activities.ts — TOON decode validation (QC-140)
- **Lines:** `decoded == null || typeof decoded !== 'object'` checks after `decodeToon()`
- **Change:** Validates decoded TOON output is a non-null object before schema validation
- **Risk:** None — prevents passing primitives/null to Zod validators

### CB-09: validate-workflow-toon.ts + validate-activities.ts — Consolidated validation path (QC-020)
- **Lines:** `validateActivityFile` exported from validate-activities.ts, imported in validate-workflow-toon.ts
- **Change:** Single code path for activity file validation instead of duplicated logic
- **Risk:** Low — functional behavior unchanged, only code organization

### CB-10: generate-schemas.ts — Shebang fix (QC-080)
- **Lines:** Shebang line
- **Change:** `#!/usr/bin/env tsx` → `#!/usr/bin/env npx tsx` for consistency
- **Risk:** None

### CB-11: generate-schemas.ts — Import modernization (QC-139)
- **Lines:** Removed `fileURLToPath`/`dirname` imports, used `import.meta.dirname`
- **Change:** Uses Node.js built-in `import.meta.dirname` instead of manual path derivation
- **Risk:** None — `import.meta.dirname` available in Node.js 20.11+, project requires 18+ but uses tsx

### CB-12: All scripts — Exit code normalization (QC-081)
- **Lines:** All `process.exit()` and `exit` calls
- **Change:** Standardized: 0=success, 1=validation/operation failure, 2=usage error
- **Risk:** Low — downstream consumers unlikely to depend on specific non-zero exit codes

### CB-13: All scripts — Emoji removal (QC-137)
- **Lines:** All console output lines
- **Change:** `✅`/`✓` → `[PASS]`, `❌` → `[FAIL]`, `⚠` → `[WARN]`, `📁` → `[INFO]`
- **Risk:** None — output is human-readable; no tools parse emoji

## Verification

- `npm run typecheck`: Clean
- `npm test`: 197/197 passed (10 test files)
