# Work Package Plan — WP-03: Zod Schema Alignment

## Task Breakdown

### T-01: QC-002 — Document workflow `activities` intentional divergence (Critical)

- **File**: `src/schema/workflow.schema.ts`
- **Action**: Add a comment above `activities` field explaining why it exists in Zod (runtime merged object) but not in JSON Schema (TOON file validation). No code change needed — the field is already correctly required with `.min(1)`.
- **Risk**: None

### T-02: QC-012 — Add `defaultOption` and `autoAdvanceMs` to CheckpointSchema (High)

- **File**: `src/schema/activity.schema.ts`
- **Action**: Add `defaultOption: z.string().optional()` and `autoAdvanceMs: z.number().int().positive().optional()` to `CheckpointSchema`. These fields were added to the JSON Schema by WP-02 but not to the Zod schema.
- **Risk**: Low — additive change, optional fields

### T-03: QC-040 — Add `action` field to ArtifactSchema (Medium)

- **File**: `src/schema/activity.schema.ts`
- **Action**: Add `action: z.enum(['create', 'update']).default('create').optional()` to `ArtifactSchema`, matching JSON Schema artifact definition.
- **Risk**: Low — additive, optional with default

### T-04: QC-041 — Add `skipCheckpoints` to ModeOverrideSchema (Medium)

- **File**: `src/schema/activity.schema.ts`
- **Action**: Add `skipCheckpoints: z.array(z.string()).optional()` to `ModeOverrideSchema`. This was added to JSON Schema by WP-02 but missing from Zod.
- **Risk**: Low — additive, optional

### T-05: QC-042 — Remove `.passthrough()` from skill schemas (Medium)

- **File**: `src/schema/skill.schema.ts`
- **Action**: Remove all `.passthrough()` calls from every schema in the file. Per WP-02 precedent, user decided strict for both skills and activities.
- **Risk**: Medium — changes validation behavior. Skill TOON files with extra properties will have those properties stripped during Zod parsing. Need to ensure no downstream code depends on pass-through properties.

### T-06: QC-043 — Use loose equality for `==` operator (Medium)

- **File**: `src/schema/condition.schema.ts`
- **Action**: Change `evaluateSimpleCondition` to use `==` instead of `===` for the `==` operator, and `!=` instead of `!==` for the `!=` operator. This matches JSON Schema semantic intent for type-coercing equality.
- **Risk**: Medium — changes runtime behavior for type-coercing comparisons

### T-07: QC-044 — Activity schema strictness alignment (Medium)

- **File**: `src/schema/activity.schema.ts`
- **Action**: No code change needed. Zod default behavior already strips unknown properties (equivalent to strict). The JSON Schema has `additionalProperties: true` but user decided strict for both.
- **Risk**: None

### T-08: QC-101 — Deduplicate SemanticVersionSchema (Low)

- **Files**: `src/schema/workflow.schema.ts`, `src/schema/activity.schema.ts`, `src/schema/skill.schema.ts`
- **Action**: Define `SemanticVersionSchema` in a new shared file (`src/schema/common.ts`) or in the most upstream file (`condition.schema.ts`) and import from the other files. Best approach: create `src/schema/common.ts` with the shared definition.
- **Risk**: Low — import restructuring only

### T-09: QC-102 — Log warning in `getVariableValue` for missing paths (Low)

- **File**: `src/schema/condition.schema.ts`
- **Action**: The function already returns `undefined` for missing paths, which is semantically correct (callers check for it). Add no change — the `undefined` return is handled by `exists`/`notExists` operators. Document with a comment that the silent `undefined` is intentional.
- **Risk**: None

### T-10: QC-103 — Validate `initialActivity` in `createInitialState` (Low)

- **File**: `src/schema/state.schema.ts`
- **Action**: The function doesn't have access to the workflow's activity list — it's a pure state factory. Add a JSDoc comment documenting that caller is responsible for ensuring `initialActivity` is valid. This validation belongs at the call site, not in the factory function.
- **Risk**: None

### T-11: QC-104 — Type-narrow `addHistoryEvent` details parameter (Low)

- **File**: `src/schema/state.schema.ts`
- **Action**: The `details` spread is typed as `Partial<Omit<HistoryEntry, 'timestamp' | 'type'>>`, which is already type-safe at compile time. The spread only accepts known HistoryEntry fields. Add a comment documenting this safety guarantee.
- **Risk**: None

## Execution Order

1. T-08 (QC-101): Deduplicate SemanticVersionSchema first (creates shared import used by other files)
2. T-01 (QC-002): Document activities divergence
3. T-02 (QC-012): Add checkpoint fields
4. T-03 (QC-040): Add artifact action field
5. T-04 (QC-041): Add skipCheckpoints to ModeOverride
6. T-05 (QC-042): Remove .passthrough() from skills
7. T-06 (QC-043): Fix loose equality
8. T-07 (QC-044): Verify (no change needed)
9. T-09 (QC-102): Document getVariableValue
10. T-10 (QC-103): Document createInitialState
11. T-11 (QC-104): Document addHistoryEvent
