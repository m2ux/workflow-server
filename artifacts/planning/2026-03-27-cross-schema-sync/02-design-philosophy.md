# Design Philosophy — Cross-Schema Consistency Enforcement

## Approach

This work package addresses three discrete cross-cutting inconsistencies. The guiding principle is **single source of truth**: where two representations of the same concept exist, one must derive from or align with the other.

## Complexity Assessment

**Simple** — Three independent findings, each with a clear fix and no architectural trade-offs. No new abstractions are introduced; existing patterns are aligned.

## Constraints

1. **Backward compatibility**: The JSON Schema change for QC-014 must accept both the existing object format and the new string shorthand. No existing valid documents should be rejected.
2. **Runtime parity**: The validation script (QC-019) must produce the same pass/fail verdict as the runtime Zod parser for all valid workflow documents.
3. **Import discipline**: The schema ID list (QC-027) must be imported, not duplicated, to prevent future divergence.

## Design Decisions

- **QC-014**: Use `oneOf` in JSON Schema to express the union (string | object) rather than `anyOf`, since the two alternatives are structurally disjoint and exactly one should match.
- **QC-019**: Replace Ajv entirely with Zod `.safeParse()` rather than maintaining both. The script should share the exact validation path used at runtime.
- **QC-027**: Import and use the existing `listSchemaIds()` function rather than importing the `SCHEMA_IDS` constant directly, as the function is the public API of that module.
