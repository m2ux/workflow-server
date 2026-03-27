# Codebase Comprehension: Zod Schemas

## File Structure

```
src/schema/
├── condition.schema.ts    # Condition types + evaluateCondition/getVariableValue
├── activity.schema.ts     # Activity, Step, Checkpoint, Decision, Loop, Transition, Artifact, ModeOverride
├── workflow.schema.ts     # Workflow, VariableDefinition, Mode (imports ActivitySchema)
├── skill.schema.ts        # Skill and all sub-schemas (standalone, no internal imports)
└── state.schema.ts        # WorkflowState, HistoryEntry, createInitialState, addHistoryEvent
```

## Import Chain

```
condition.schema.ts  →  activity.schema.ts  →  workflow.schema.ts
skill.schema.ts      (standalone)
state.schema.ts      (standalone)
```

## JSON Schema Counterparts

Each Zod file has a JSON Schema counterpart in `schemas/*.json`:
- `workflow.schema.json` — validates workflow TOON files (does NOT include `activities` property)
- `activity.schema.json` — validates activity TOON files
- `skill.schema.json` — validates skill TOON files
- `condition.schema.json` — validates condition sub-objects
- `state.schema.json` — validates state persistence files

## Key Patterns

### SemanticVersionSchema (Duplicated 3x — QC-101)

Defined identically in `workflow.schema.ts:4`, `activity.schema.ts:4`, and `skill.schema.ts:3`:
```typescript
const SemanticVersionSchema = z.string().regex(/^\d+\.\d+\.\d+$/);
```

### `.passthrough()` Usage (QC-042)

Used extensively in `skill.schema.ts` on 15+ sub-schemas:
- `ToolDefinitionSchema`, `ErrorDefinitionSchema`, `ExecutionPatternSchema`, `ArchitectureSchema`
- `MatchingSchema`, `StateDefinitionSchema`, `InterpretationSchema`, `NumericFormatSchema`
- `InitializationSchema`, `UpdatePatternSchema`, `ResumptionSchema`, `InputItemDefinitionSchema`
- `ProtocolStepSchema`, `OutputArtifactSchema`, `OutputItemDefinitionSchema`
- Top-level `SkillSchema` also has `.passthrough()`

NOT used in `activity.schema.ts` — Zod default behavior strips unknown properties.

### Condition Evaluation (QC-043, QC-102)

`evaluateSimpleCondition` uses strict `===` for the `==` operator and `!==` for `!=`.
`getVariableValue` returns `undefined` silently for missing paths with no tracing/logging.

### State Helpers (QC-103, QC-104)

`createInitialState` accepts `initialActivity` as a string but does not validate it against the workflow's activity list.
`addHistoryEvent` spreads `details` into the history entry without validating the shape.

## Findings Mapped to Code

| Finding | File | Line(s) | Current Code |
|---------|------|---------|-------------|
| QC-002 | workflow.schema.ts | 55 | `activities: z.array(ActivitySchema).min(1)` — required in Zod but absent from JSON Schema |
| QC-012 | activity.schema.ts | 49-57 | `CheckpointSchema` missing `defaultOption`, `autoAdvanceMs` |
| QC-040 | activity.schema.ts | 111-117 | `ArtifactSchema` missing `action` field |
| QC-041 | activity.schema.ts | 120-129 | `ModeOverrideSchema` missing `skipCheckpoints` |
| QC-042 | skill.schema.ts | throughout | `.passthrough()` on all sub-schemas |
| QC-043 | condition.schema.ts | 63-64 | `===` / `!==` instead of `==` / `!=` |
| QC-044 | activity.schema.ts | 132-173 | ActivitySchema: Zod strips unknowns (no `.passthrough()`) |
| QC-101 | all three | lines 3-4 | `SemanticVersionSchema` defined 3x |
| QC-102 | condition.schema.ts | 48-56 | `getVariableValue` silent undefined |
| QC-103 | state.schema.ts | 134 | `createInitialState` no validation |
| QC-104 | state.schema.ts | 148-151 | `addHistoryEvent` unvalidated spread |
