# Design Philosophy — WP-03: Zod Schema Alignment

## Problem Classification

- **Type**: Specific problem with known cause
- **Complexity**: Moderate (11 findings across 5 files, but each is well-scoped)
- **Risk**: Medium (schema changes affect validation across the entire server)

## Guiding Principles

### 1. JSON Schema Is the Source of Truth

The JSON Schema definitions in `schemas/*.json` represent the canonical specification for workflow data structures. Zod schemas must faithfully mirror these definitions for all fields, types, optionality, and validation constraints. Where they differ, Zod must be brought into alignment.

### 2. Strict Validation by Default

Both JSON Schema and Zod should reject unknown properties. This means:
- No `.passthrough()` on Zod object schemas (strips unknown properties silently)
- `additionalProperties: false` in JSON Schema (already present)
- Use `.strict()` only where explicit unknown-property rejection with errors is needed

Per WP-02 precedent, the user decided **strict for both** — skills and activities should both reject unknown properties.

### 3. Intentional Divergence Must Be Documented

The JSON Schema validates TOON files on disk; the Zod schema validates runtime merged objects (e.g., workflow + assembled activities). Where structural differences are intentional (like `activities` being absent from JSON Schema but present in Zod), a comment must explain why.

### 4. Semantic Correctness Over Strictness

For runtime functions (`evaluateSimpleCondition`, `getVariableValue`, etc.), correctness matters more than strictness. The `==` operator should perform loose equality to match JSON Schema semantics, not JavaScript strict equality.

### 5. DRY for Shared Definitions

Utility schemas like `SemanticVersionSchema` should be defined once and imported, not duplicated across files.

## Approach

1. Fix Critical and High findings first (QC-002, QC-012)
2. Fix Medium findings (QC-040, QC-041, QC-042, QC-043, QC-044)
3. Fix Low findings (QC-101, QC-102, QC-103, QC-104)
4. Run typecheck and tests after all changes
5. Single commit with all fixes
