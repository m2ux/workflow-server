# Implementation Plan — Cross-Schema Consistency Enforcement

## Tasks

### Task 1: QC-014 — Add string shorthand to JSON Schema `artifactLocation`

**Files:** `schemas/workflow.schema.json`

1. Modify the `artifactLocations` property's `additionalProperties` to use `oneOf` with two alternatives:
   - A `string` type (the shorthand path)
   - The existing `$ref` to `#/definitions/artifactLocation` (the full object)
2. Verify the change validates correctly against existing TOON files that use either format.

### Task 2: QC-019 — Replace Ajv with Zod in validate-workflow.ts

**Files:** `scripts/validate-workflow.ts`

1. Remove the `Ajv` import and `ajv.compile(schema)` usage.
2. Import `WorkflowSchema` from `../src/schema/workflow.schema.js`.
3. Use `WorkflowSchema.safeParse(workflow)` instead of `validate(workflow)`.
4. Update the error output format to render Zod issues.

### Task 3: QC-027 — Import SCHEMA_IDS in schema-preamble.ts

**Files:** `src/loaders/schema-preamble.ts`

1. Import `listSchemaIds` from `./schema-loader.js`.
2. Replace the hardcoded schema section array with a dynamic loop over `listSchemaIds()`.
3. Use indexed access on the schemas object to build each section.

## Verification

- `npm run typecheck` must pass
- `npm test` must pass (all 197 tests)
- Manual review of JSON Schema change for structural correctness
