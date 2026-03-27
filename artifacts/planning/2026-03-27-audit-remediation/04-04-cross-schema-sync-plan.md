# WP-04: Cross-Schema Consistency Enforcement

## Scope

**In scope:**
- QC-014: ArtifactLocationValue string shorthand accepted by Zod but rejected by JSON Schema
- QC-019: `validate-workflow.ts` uses persisted JSON schema instead of Zod imports
- QC-027: Schema list hardcoded separately from `SCHEMA_IDS`

**Out of scope:**
- Automated schema generation from Zod (future enhancement)
- Individual schema fixes (WP-02, WP-03)

**Files:** `schemas/`, `src/schema/`, `scripts/generate-schemas.ts`, `scripts/validate-workflow.ts`

## Dependencies

- **WP-02** (JSON Schema corrections) — must merge first
- **WP-03** (Zod schema alignment) — must merge first

## Effort

3 findings. Small scope, but touches multiple directories.

## Success Criteria

- String shorthand for ArtifactLocationValue works in both schema systems
- `validate-workflow.ts` imports Zod schemas directly, eliminating staleness vector
- `SCHEMA_IDS` is the single source of truth for schema enumeration
- `npm test` passes
