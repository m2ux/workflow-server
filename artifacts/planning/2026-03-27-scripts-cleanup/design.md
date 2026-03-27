# WP-11: Design Document

## Design Philosophy

These scripts are developer-facing CLI utilities. The guiding principles:

1. **Fail loudly** — No silent error swallowing; surface all failures with clear messages
2. **Clean up after yourself** — Trap-based cleanup for temp resources
3. **Parseable output** — Machine-readable tags (`[PASS]`, `[FAIL]`) instead of emoji
4. **Defensive inputs** — Sanitize shell variables, validate decoded data before use
5. **Minimal blast radius** — Each fix is a localized guard, not an architectural change

## Change Strategy

### deploy.sh (QC-079, QC-083, QC-134, QC-135, QC-136)

- Wrap `git clone`, `git push`, `git ls-remote` with timeout (30s default)
- Add `verify_push_access()` function that tests push via `git push --dry-run` before real pushes
- Change `KEEP_SCRIPT` default to `true` (remove self-delete behavior)
- Add `cleanup()` trap function registered via `trap cleanup EXIT`
- Sanitize `PROJECT_NAME` and path variables to alphanumeric+hyphen+underscore

### validate-workflow.ts (QC-020, QC-082)

- Change `strict: false` to `strict: true` in Ajv config
- Normalize exit codes: 0=valid, 1=invalid, 2=usage error

### validate-workflow-toon.ts (QC-138, QC-140)

- Check for `workflow.toon` existence before assuming directory structure
- Validate `decodeToon()` output is a non-null object before passing to schema validators
- Add early exit with clear error if directory structure doesn't match expectations

### validate-activities.ts (QC-020, QC-140)

- Validate `decodeToon()` output is a non-null object before passing to schema validators
- Consistent error reporting format

### generate-schemas.ts (QC-080, QC-139)

- Fix shebang from `#!/usr/bin/env tsx` to `#!/usr/bin/env npx tsx`
- Use `import.meta.dirname` instead of manual `fileURLToPath` + `dirname` pattern

### Cross-cutting: Exit codes (QC-081)

- 0 = success
- 1 = validation/operation failure
- 2 = usage error (missing args, bad options)

### Cross-cutting: Emoji output (QC-137)

- Replace `✅`/`✓` with `[PASS]`
- Replace `❌` with `[FAIL]`
- Replace `⚠` with `[WARN]`
- Replace `📁` with `[INFO]`

## Assumptions

- Scripts are run by developers or CI, not by end-user agents
- `timeout` command is available (coreutils) on target platforms
- No downstream tools parse emoji characters from script output
- Ajv strict mode may surface new warnings in existing schemas — acceptable as informational
