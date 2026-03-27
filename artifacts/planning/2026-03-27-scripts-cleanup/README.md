# WP-11: Scripts Cleanup

**Created:** 2026-03-27
**Status:** In Progress
**Branch:** fix/wp11-scripts-cleanup
**PR:** #78
**Issue:** #67

## Scope

13 findings across 5 script files in `scripts/`:

| ID | Finding | Severity | File(s) |
|----|---------|----------|---------|
| QC-020 | Three independent validation paths for activity files | High | validate-workflow.ts, validate-workflow-toon.ts, validate-activities.ts |
| QC-079 | Network operations lack timeout/resilience | Medium | deploy.sh |
| QC-080 | Inconsistent shebang lines | Medium | generate-schemas.ts, others |
| QC-081 | Inconsistent exit code semantics | Medium | multiple |
| QC-082 | Ajv `strict: false` suppresses schema warnings | Medium | validate-workflow.ts |
| QC-083 | Push access assumed but never verified | Medium | deploy.sh |
| QC-134 | Deploy script deletes itself | Low | deploy.sh |
| QC-135 | Temp directory cleanup gaps | Low | deploy.sh |
| QC-136 | Shell input sanitization gaps | Low | deploy.sh |
| QC-137 | Emoji-dependent output parsing | Low | multiple |
| QC-138 | Canonical directory structure assumption | Low | validate-workflow-toon.ts |
| QC-139 | Source TypeScript imports assume tsx-compatible modules | Low | generate-schemas.ts |
| QC-140 | TOON decode output assumed schema-conformant | Low | validate-workflow-toon.ts, validate-activities.ts |

## Design Philosophy

Scripts are **developer utilities** — they should fail loudly, clean up after themselves, and produce parseable output. Changes are additive guards and normalizations, not architectural rewrites.

## Approach

1. **deploy.sh**: Add timeout guards to network ops, verify push access before attempting, remove self-delete default, add trap-based cleanup, sanitize inputs
2. **validate-workflow.ts**: Remove `strict: false` from Ajv, normalize exit codes
3. **validate-workflow-toon.ts**: Validate decoded TOON output before schema validation, guard directory structure assumptions
4. **validate-activities.ts**: Validate decoded TOON output before schema validation
5. **generate-schemas.ts**: Fix shebang to `#!/usr/bin/env npx tsx`, use `import.meta.dirname`
6. **All scripts**: Normalize exit codes (0=success, 1=validation failure, 2=usage error), replace emoji-prefixed output with bracket-tag format

## Success Criteria

- All network operations have timeout guards
- Push access verified before attempting pushes
- Deploy script does not self-delete by default
- Temp directories cleaned via trap handlers
- Consistent `#!/usr/bin/env npx tsx` shebang across .ts scripts
- Consistent exit codes: 0=success, 1=failure, 2=usage error
- Output uses `[PASS]`/`[FAIL]`/`[WARN]`/`[INFO]` tags instead of emoji
- TOON decode output validated before schema checks
- Ajv strict mode enabled
