# Assumptions Log — WP-03: Zod Schema Alignment

## Assumptions

### A-001: `.passthrough()` Removal from Skills (RESOLVED)

- **Finding**: QC-042
- **Assumption**: `.passthrough()` should be removed from skill schemas to match the strict `additionalProperties: false` policy on activities
- **Stakeholder**: User
- **Resolution**: Resolved by WP-02 precedent — user decided strict for both skills and activities
- **Impact**: All `.passthrough()` calls in `skill.schema.ts` will be removed

### A-002: Activity Schema Strictness (RESOLVED)

- **Finding**: QC-044
- **Assumption**: Activity Zod schema should not use `.passthrough()` and should match `additionalProperties: true` in JSON Schema
- **Stakeholder**: User
- **Resolution**: The JSON Schema currently has `"additionalProperties": true` on the activity definition, but user decided strict for both in WP-02. The Zod schema already does not use `.passthrough()` (Zod strips unknown by default). Both schemas are effectively strict. No `.passthrough()` is used on ActivitySchema.
- **Impact**: Activity schema is already strict in Zod (default strip behavior). JSON Schema has `additionalProperties: true` but that's a JSON Schema concern (WP-02 scope).

### A-003: Workflow `activities` Field Intentional Divergence (RESOLVED)

- **Finding**: QC-002
- **Assumption**: The JSON Schema `workflow` definition does not include `activities` because workflow TOON files reference activities in separate TOON files. The server assembles them at runtime. The Zod schema includes `activities` because it validates the full assembled workflow object.
- **Resolution**: This is intentional. Add a documenting comment in the Zod schema. The Zod `activities` field with `.min(1)` is correct for runtime validation.
- **Impact**: No code change needed beyond a clarifying comment.

### A-004: `==` Operator Loose Equality (RESOLVED)

- **Finding**: QC-043
- **Assumption**: The `==` operator in condition evaluation should use JavaScript loose equality (`==`) rather than strict equality (`===`), matching the JSON Schema semantic intent where `"1" == 1` should be true.
- **Resolution**: Change `===` to `==` and `!==` to `!=` for the `==` and `!=` operators respectively.
- **Impact**: Changes runtime behavior for type-coercing comparisons.
