# WP-11: Scripts Cleanup

## Scope

**In scope:**
- QC-020: Three independent validation paths for activity files
- QC-079: Network operations lack timeout/resilience
- QC-080: Inconsistent shebang lines
- QC-081: Inconsistent exit code semantics
- QC-082: Ajv `strict: false` suppresses schema warnings
- QC-083: Push access assumed but never verified
- QC-134–QC-140: 7 Low-severity scripts findings

**Out of scope:**
- Schema changes consumed by scripts (WP-02, WP-03)

**Files:** `scripts/deploy.sh`, `scripts/validate-workflow.ts`, `scripts/validate-workflow-toon.ts`, `scripts/validate-activities.ts`, `scripts/generate-schemas.ts`

## Dependencies

None.

## Effort

13 findings across 5 files. Medium scope.

## Success Criteria

- Activity validation consolidated into a single code path
- All network operations have timeout guards
- Consistent shebang lines across TypeScript scripts
- Deploy script does not self-delete
- `scripts/validate-workflow.ts` exits with correct codes
