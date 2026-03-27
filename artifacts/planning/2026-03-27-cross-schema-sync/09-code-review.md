# Post-Implementation Code Review — Cross-Schema Consistency Enforcement

## Changes Reviewed

### QC-014: JSON Schema `artifactLocation` string shorthand
**File:** `schemas/workflow.schema.json`

The `artifactLocations.additionalProperties` now uses `oneOf` to accept either a `string` (path shorthand) or the existing `$ref` to `#/definitions/artifactLocation` (full object). This mirrors the Zod `ArtifactLocationValueSchema` union behavior exactly.

**Assessment:** Correct. The two alternatives are structurally disjoint (string vs object), so `oneOf` is appropriate. No existing valid documents are rejected.

### QC-019: Replace Ajv with Zod in validate-workflow.ts
**File:** `scripts/validate-workflow.ts`

The Ajv dependency is removed. The script now imports `WorkflowSchema` from the Zod schema module and uses `.safeParse()`. Error output renders Zod issue paths and messages. The `schema.json` existence check is removed since no JSON schema file is needed.

**Assessment:** Correct. The validation path now matches the runtime exactly. The output format is clear and actionable. The obsolete `Phases` count output was replaced with `Activities`, matching current schema structure.

### QC-027: Dynamic schema ID iteration in schema-preamble.ts
**File:** `src/loaders/schema-preamble.ts`

The hardcoded 5-line schema section array is replaced with a `for...of` loop over `listSchemaIds()` imported from `schema-loader.ts`. The `AllSchemas` type is cast to `Record<string, object>` for dynamic key access.

**Assessment:** Correct. Adding a new schema to `SCHEMA_IDS` in `schema-loader.ts` will automatically include it in the preamble. The cast is safe because `AllSchemas` keys are exactly `SCHEMA_IDS` entries.

## Verification

- TypeScript compilation: ✅ No errors
- Test suite: ✅ 197/197 tests pass
- No behavioral regressions detected

## Finding Summary

| Finding | Status | Notes |
|---------|--------|-------|
| QC-014 | ✅ Resolved | JSON Schema now accepts string shorthand |
| QC-019 | ✅ Resolved | validate-workflow.ts uses Zod instead of Ajv |
| QC-027 | ✅ Resolved | schema-preamble.ts imports listSchemaIds dynamically |
