# Codebase Comprehension: Zod Schemas

## File Structure

```
src/schema/
├── common.ts              # SemanticVersionSchema (single source of truth)
├── condition.schema.ts    # Condition types + evaluateCondition/getVariableValue
├── activity.schema.ts     # Activity, Step, Checkpoint, Decision, Loop, Transition, Artifact, ModeOverride
├── workflow.schema.ts     # Workflow, VariableDefinition, Mode, WorkflowSkills (imports ActivitySchema)
├── skill.schema.ts        # Skill and all sub-schemas (standalone, no internal imports beyond common)
├── state.schema.ts        # WorkflowState, HistoryEntry, createInitialState, addHistoryEvent, NestedWorkflowState
├── resource.schema.ts     # Resource type with passthrough
└── rules.schema.ts        # Rules type with passthrough
```

## Import Chain

```
common.ts (SemanticVersionSchema)
    ↓
condition.schema.ts  →  activity.schema.ts  →  workflow.schema.ts
                                                    ↑ imports ActivitySchema

skill.schema.ts      (standalone — imports common.ts only)
state.schema.ts      (standalone)
resource.schema.ts   (standalone, minimal)
rules.schema.ts      (standalone, minimal)
```

## JSON Schema Counterparts

Each Zod file has a JSON Schema counterpart in `schemas/*.json`:
- `workflow.schema.json` — validates workflow TOON files (does NOT include `activities` property)
- `activity.schema.json` — validates activity TOON files
- `skill.schema.json` — validates skill TOON files
- `condition.schema.json` — validates condition sub-objects
- `state.schema.json` — validates state persistence files

## Key Patterns

### SemanticVersionSchema (Single Source of Truth — QC-101 Fixed)

Defined once in `common.ts:3`:
```typescript
export const SemanticVersionSchema = z.string().regex(/^\d+\.\d+\.\d+$/);
```

Imported by `workflow.schema.ts`, `activity.schema.ts`, and `skill.schema.ts`. No longer duplicated.

### `.passthrough()` Usage

Used in `resource.schema.ts` and `rules.schema.ts` on the top-level schema only:
- `ResourceSchema` — `.passthrough()` preserves unknown resource fields
- `RulesSchema` — `.passthrough()` at section level preserves unknown section fields

NOT used in `activity.schema.ts` — Zod default behavior strips unknown properties.

`skill.schema.ts` uses `.strict()` on the top-level `SkillSchema`, which rejects unknown properties at runtime (inconsistent with JSON Schema `additionalProperties: true`).

### Condition Evaluation

`evaluateSimpleCondition` uses strict `===` for the `==` operator and `!==` for `!=`.
`getVariableValue` returns `undefined` silently for missing paths with no tracing/logging.

Supports operators: `==`, `!=`, `>`, `<`, `>=`, `<=`, `exists`, `notExists`.

### State Helpers

`createInitialState` accepts `initialActivity` as a string but does not validate it against the workflow's activity list.
`addHistoryEvent` uses `Partial<Omit<HistoryEntry, 'timestamp' | 'type'>>` for the `details` parameter, providing type safety.

### Nested Workflow State

`NestedWorkflowStateSchema` extends `WorkflowStateBaseSchema` with recursive `triggeredWorkflows` that each can carry their own nested state. Uses `z.lazy()` for self-referential schemas:

```typescript
export const NestedTriggeredWorkflowRefSchema: z.ZodType<NestedTriggeredWorkflowRef> = TriggeredWorkflowRefSchema.extend({
  state: z.lazy(() => NestedWorkflowStateSchema).optional(),
}) as z.ZodType<NestedTriggeredWorkflowRef>;
```

### Workflow Skills

`WorkflowSkillsSchema` defines the `skills` field on workflows:
```typescript
export const WorkflowSkillsSchema = z.object({
  primary: z.string().describe('Primary skill ID for this workflow'),
});
```

This is used by `get_skills` to load the workflow's primary skill.

### Artifact Schema

`ArtifactSchema` includes an `action` field:
```typescript
export const ArtifactSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string().optional(),
  description: z.string().optional(),
  action: z.enum(['create', 'update']).default('create').optional(),
});
```

### Step Schema Extensions

`StepSchema` includes several fields not in earlier schema versions:
- `checkpoint` — optional checkpoint ID to yield before executing the step
- `actions` — array of `ActionSchema` objects
- `triggers` — array of `WorkflowTriggerSchema` objects
- `skill_args` — record of arguments to pass to the skill

### Action Schema

`ActionSchema` defines executable actions within activities:
```typescript
export const ActionSchema = z.object({
  action: z.enum(['log', 'validate', 'set', 'emit', 'message']),
  target: z.string().optional(),
  message: z.string().optional(),
  value: z.unknown().optional(),
  description: z.string().optional(),
  condition: ConditionSchema.optional(),
});
```

### Workflow Trigger Schema

`WorkflowTriggerSchema` allows activities/steps to trigger other workflows:
```typescript
export const WorkflowTriggerSchema = z.object({
  workflow: z.string(),
  description: z.string().optional(),
  passContext: z.array(z.string()).optional(),
});
```

## Findings Mapped to Code

| Finding | File | Line(s) | Current Code |
|---------|------|---------|-------------|
| QC-002 | workflow.schema.ts | 65 | `activities: z.array(ActivitySchema).min(1).optional()` — required in Zod but absent from JSON Schema |
| QC-012 | activity.schema.ts | 66-75 | `CheckpointSchema` has `condition`, `defaultOption`, `autoAdvanceMs` |
| QC-040 | activity.schema.ts | 121-128 | `ArtifactSchema` has `action` field |
| QC-041 | activity.schema.ts | 120-129 | `ModeOverrideSchema` has `skipCheckpoints` |
| QC-042 | skill.schema.ts | 177 | `SkillSchema` uses `.strict()` (not `.passthrough()`) |
| QC-043 | condition.schema.ts | 68-71 | `===` / `!==` instead of `==` / `!=` |
| QC-044 | activity.schema.ts | 131-169 | ActivitySchema: Zod strips unknowns (no `.passthrough()`) |
| QC-101 | common.ts | 3 | `SemanticVersionSchema` defined once, imported by all |
| QC-102 | condition.schema.ts | 49-56 | `getVariableValue` silent undefined |
| QC-103 | state.schema.ts | 145 | `createInitialState` no validation |
| QC-104 | state.schema.ts | 160-163 | `addHistoryEvent` typed details parameter |
| QC-105 | workflow.schema.ts | 41-44 | `WorkflowSkillsSchema` with `primary` field |
| QC-106 | activity.schema.ts | 37-50 | `StepSchema` with `checkpoint`, `actions`, `triggers`, `skill_args` |
| QC-107 | activity.schema.ts | 15-23 | `ActionSchema` with 5 action types |
| QC-108 | activity.schema.ts | 30-35 | `WorkflowTriggerSchema` for cross-workflow triggers |
| QC-109 | state.schema.ts | 125-143 | `NestedWorkflowStateSchema` with recursive `triggeredWorkflows` |
| QC-110 | resource.schema.ts | 3-11 | `ResourceSchema` with `.passthrough()` |
| QC-111 | skill.schema.ts | 137-148 | `OperationDefinitionSchema` for named operations |
