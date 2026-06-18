# Codebase Comprehension: Zod Schemas

> **Last updated**: 2026-06-18
> **Scope**: `src/schema/*.ts` — runtime Zod validation for workflows, activities, conditions, techniques, state, sessions, resources
> **Related artifacts**: [json-schemas.md](json-schemas.md), [workflow-server-schemas.md](workflow-server-schemas.md), [workflow-server.md](workflow-server.md)

## File Structure

```
src/schema/
├── common.ts               # SemanticVersionSchema (single source of truth)
├── condition.schema.ts     # Condition types + evaluateCondition (and/or/not inlined via z.lazy)
├── activity.schema.ts      # Activity, Step (kind-tagged), Checkpoint (interface), Decision, Transition, Artifact, Action, WorkflowTrigger, TechniqueBinding
├── workflow.schema.ts      # Workflow, VariableDefinition, WorkflowTechniquesSchema, WorkflowRulesSchema (imports ActivitySchema)
├── technique.schema.ts     # Technique + sub-schemas (inputs/protocol/outputs/rules; standalone, imports common only)
├── state.schema.ts         # WorkflowState, HistoryEntry, createInitialState, addHistoryEvent, NestedWorkflowState
├── session.schema.ts       # SessionFile (recursive), EmbeddedSessionRef, ActiveCheckpoint, createInitialSessionFile
└── resource.schema.ts      # Resource type with passthrough
```

The model is **Goal → Activity → Technique → Tools**: activities bind *techniques*. Rules live as audience-partitioned objects inline in `workflow.schema.ts` (`WorkflowRulesSchema`) and `activity.schema.ts` (`Activity.rules` is a `string[]`).

## Import Chain

```
common.ts (SemanticVersionSchema)
    ↓
condition.schema.ts  →  activity.schema.ts  →  workflow.schema.ts
                                                    ↑ imports ActivitySchema

technique.schema.ts  (standalone — imports common.ts only)
state.schema.ts      (standalone)
session.schema.ts    (imports CheckpointResponseSchema/HistoryEntrySchema from state.schema.ts)
resource.schema.ts   (standalone, minimal)
```

## JSON Schema Counterparts

`schemas/*.json` are **generated** from the Zod schemas by `scripts/generate-schemas.ts` (via `zod-to-json-schema`). The script emits five files (`generate-schemas.ts:23-27`):

- `workflow.schema.json` — from `WorkflowSchema` (full assembled runtime workflow; includes the `activities` array)
- `activity.schema.json` — from `ActivitySchema`, with `$refStrategy: 'root'` so the loop-kind step's recursive nested `steps[]` body emits `$defs` (`generate-schemas.ts:14-17,27`)
- `condition.schema.json` — from `ConditionSchema`
- `state.schema.json` — from `WorkflowStateSchema`
- `session-file.schema.json` — from `SessionFileSchema` (canonical server-managed `session.json` state)

`technique.schema.json` exists in `schemas/` but is not part of this generator's output (it is maintained separately).

## Key Patterns

### SemanticVersionSchema (Single Source of Truth)

Defined once in `common.ts:3`:
```typescript
export const SemanticVersionSchema = z.string().regex(/^\d+\.\d+\.\d+$/);
```

Imported by `workflow.schema.ts`, `activity.schema.ts`, and `technique.schema.ts`. (`session.schema.ts` and `state.schema.ts` inline the equivalent regex / use plain `z.string()` for their version fields rather than importing the shared constant.)

### Step Model (kind-tagged)

An activity is an ordered `steps[]` (`ActivitySchema.steps`, `activity.schema.ts:248`). Every step carries a **required** `kind` discriminator (`activity.schema.ts:74`):

```typescript
kind: z.enum(['technique', 'action', 'checkpoint', 'loop'])
```

Per-kind required fields are enforced by a `superRefine` on `StepSchema` (`activity.schema.ts:88-109`):
- `kind:technique` must declare `technique`.
- `kind:checkpoint` carries `message` / `options` / `defaultOption` / `autoAdvanceMs` / `blocking` **inline** at its concrete position in the sequence (its position is its presentation timing). Must declare `message` and ≥1 option.
- `kind:loop` is a **compound** step: it declares `loopType` (`forEach` | `while` | `doWhile`), optional `variable` / `over` / `breakCondition` / `maxIterations`, and a nested recursive `steps[]` body (`activity.schema.ts:82-87`). Must declare `loopType` and a `steps` body.
- `kind:action` carries no additional required field.

`step.id` is optional only for a `kind:technique` step (the loader derives it from the last `::` segment of the technique name via `defaultStepId`); every other kind must declare an explicit id (`activity.schema.ts:65,92-94`).

`activity.schema.ts` also exports helpers around this model: `techniqueName` (extracts the op reference from a bare-string or structured binding), `defaultStepId`, `populateStepIds` (fills derived ids, dup-checking per scope), `injectResolvedStepIds` (surfaces derived ids in raw TOON), `flattenActivitySteps` (the single document-order traversal all step/checkpoint consumers route through), and `activityCheckpoints` (synthesizes `Checkpoint[]` from the inline `kind:checkpoint` steps).

### Technique Binding

A step's `technique` field is a `z.union([z.string(), TechniqueBindingSchema])` (`activity.schema.ts:67`). The bare string is a `group::operation` (or bare op / `workflow::group::op`) reference; the structured `TechniqueBindingSchema` (`activity.schema.ts:51-55`) adds `inputs` (input deviations: op input id → source expression — rename / literal / `{template}`) and `outputs` (output remaps: op output id → workflow variable name). Activity-wide techniques are a flat `TechniquesReferenceSchema` (`z.array(z.string())`, `activity.schema.ts:9`).

### Checkpoint as an Interface

Checkpoints are validated inline on `StepSchema`. `Checkpoint` is an explicit **TS interface** (`activity.schema.ts:185-193`) describing the shape `activityCheckpoints()` synthesizes from `kind:checkpoint` steps; its `id` is the stable checkpoint-response replay key. `CheckpointOptionSchema` (`activity.schema.ts:32-41`) carries an optional `effect` (`setVariable` / `transitionTo` / `skipActivities`).

### `.passthrough()` / `.strict()` Usage

- `ResourceSchema` (`resource.schema.ts:3-9`) uses `.passthrough()` to preserve unknown resource fields.
- `TechniqueSchema` (`technique.schema.ts:74`) uses `.strict()`, rejecting unknown properties at runtime.
- `ActivitySchema` and `WorkflowSchema` use Zod default behavior (unknown properties are stripped — no `.passthrough()`).

### Condition Evaluation

`ConditionSchema` (`condition.schema.ts:24-29`) is a `z.union` whose `and` / `or` / `not` members are defined **inline via `z.lazy()`**, supporting fully nested boolean conditions. `and`/`or` require `.min(2)` sub-conditions.

`evaluateSimpleCondition` (`condition.schema.ts:57-69`) uses strict `===` for `==` and `!==` for `!=`; numeric comparisons (`>`, `<`, `>=`, `<=`) coerce via `toNumber`. `getVariableValue` (`condition.schema.ts:41-49`) resolves a dot-delimited path and returns `undefined` silently for missing segments (callers handle via `exists`/`notExists`).

Supported operators (`ComparisonOperatorSchema`, `condition.schema.ts:3-5`): `==`, `!=`, `>`, `<`, `>=`, `<=`, `exists`, `notExists`.

Steps use the inline `when` string expression (`activity.schema.ts:69`) for simple gating; the structured `condition` field (`ConditionSchema`) expresses structured conditions.

### State Helpers

`createInitialState` (`state.schema.ts:158-167`) accepts `initialActivity` as a string but does not validate it against the workflow's activity list (the caller must ensure it is valid). `addHistoryEvent` (`state.schema.ts:173-176`) types its `details` parameter as `Partial<Omit<HistoryEntry, 'timestamp' | 'type'>>`, providing type safety.

`WorkflowStateSchema` (`state.schema.ts:128-131`) is `WorkflowStateBaseSchema` plus a `.refine()` enforcing that `currentActivity` is present whenever `status` is `running` / `paused` / `suspended`.

### Nested Workflow State

`NestedWorkflowStateSchema` (`state.schema.ts:150-155`) extends `WorkflowStateBaseSchema` with recursive `triggeredWorkflows` that each can carry their own nested `state`, using `z.lazy()` for self-reference:

```typescript
export const NestedTriggeredWorkflowRefSchema: z.ZodType<NestedTriggeredWorkflowRef> = TriggeredWorkflowRefSchema.extend({
  state: z.lazy(() => NestedWorkflowStateSchema).optional(),
}) as z.ZodType<NestedTriggeredWorkflowRef>;
```

### Session File (recursive)

`session.schema.ts` defines the canonical server-managed `session.json`. `SessionFileSchema` (`session.schema.ts:170-172`) is `SessionFileBaseSchema` + a `z.lazy()` `parentSession` upward link; `EmbeddedSessionRefSchema` (`session.schema.ts:178-190`) embeds each child's full `SessionFile` recursively under `triggeredWorkflows[].state`, so a single file captures the whole work-package tree. `ActiveCheckpointSchema` (`session.schema.ts:44-48`) tracks an outstanding checkpoint (`checkpointId` / `activityId` / `yieldedAt`) — the field that gates authenticated tools until `respond_checkpoint`. Checkpoint responses are keyed `"activityId-checkpointId"` (`state.schema.ts:31`, `session.schema.ts:99-102`). Helpers: `createInitialSessionFile`, `parentChainDepth`, `PARENT_CHAIN_DEPTH_WARN_THRESHOLD`.

### Workflow Techniques & Rules (audience-partitioned)

Workflows declare techniques and rules partitioned by **audience**:

```typescript
export const WorkflowTechniquesSchema = z.object({   // workflow.schema.ts:19-22
  workflow: z.array(z.string()).optional(),  // orchestrator-level; bundled into get_workflow
  activity: z.array(z.string()).optional(),  // inherited by every activity; injected into every get_activity
});

export const WorkflowRulesSchema = z.object({         // workflow.schema.ts:31-35
  workflow:  z.array(z.string()).optional(),  // orchestrator-only; surfaced in get_workflow
  activity:  z.array(z.string()).optional(),  // worker-facing; injected into every get_activity
  universal: z.array(z.string()).optional(),  // dual-audience; both
});
```

Techniques and rules are the workflow-level inheritance constructs.

### Artifact Schema (server-computed)

`ArtifactSchema` (`activity.schema.ts:226-229`) carries `id` and `name`:
```typescript
export const ArtifactSchema = z.object({
  id: z.string(),    // the producing technique output id
  name: z.string(),  // filename/template, from the technique output
});
```
`get_activity` composes the `artifacts[]` list from the `## Outputs` of the techniques an activity's steps bind (each output's `#### artifact` filename). The `create | update` action and filename live on the *technique* output: `OutputArtifactSchema`, `technique.schema.ts:46-49`.

### Action Schema

`ActionSchema` (`activity.schema.ts:13-20`) defines control-only actions within steps (referenced by `kind:action` steps and by `step.actions[]`):
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

`WorkflowTriggerSchema` (`activity.schema.ts:24-28`) allows steps and activities to trigger other workflows:
```typescript
export const WorkflowTriggerSchema = z.object({
  workflow: z.string(),
  description: z.string().optional(),
  passContext: z.array(z.string()).optional(),
});
```

### Technique Definition Schema

`technique.schema.ts` describes the technique markdown shape (parsed by the markdown loader). `TechniqueSchema` (`technique.schema.ts:66-74`) requires `id`, `version`, `capability` and optionally carries `rules` (`RulesDefinitionSchema`), `inputs` (`InputsDefinitionSchema` — array of named `InputItemDefinition`), `protocol` (`ProtocolDefinitionSchema` — an ordered list of `ProtocolBlock`s), and `outputs` (`OutputsDefinitionSchema` — array of `OutputItemDefinition`, each with optional `components` and an optional `OutputArtifact`). A nested technique (`<sub>.md`) validates against the same `TechniqueSchema`.

## Findings Mapped to Code

| Finding | File | Line(s) | Current Code |
|---------|------|---------|-------------|
| QC-002 | workflow.schema.ts | 55 | `activities: z.array(ActivitySchema).min(1).optional()` — present in Zod (full assembled object); the generated `workflow.schema.json` includes it too |
| QC-012 | activity.schema.ts | 185-193, 88-109 | `Checkpoint` is a TS interface (with `condition`/`defaultOption`/`autoAdvanceMs`); checkpoint fields validated inline on `StepSchema` |
| QC-040 | activity.schema.ts | 226-229 | `ArtifactSchema` is `id`+`name` (server-computed); `create|update` action lives on `OutputArtifactSchema` (technique.schema.ts:46-49) |
| QC-043 | condition.schema.ts | 62-63 | `===` / `!==` for `==` / `!=` |
| QC-044 | activity.schema.ts | 233-261 | `ActivitySchema`: Zod strips unknowns (no `.passthrough()`) |
| QC-101 | common.ts | 3 | `SemanticVersionSchema` defined once, imported by workflow/activity/technique schemas |
| QC-102 | condition.schema.ts | 41-49 | `getVariableValue` silent undefined |
| QC-103 | state.schema.ts | 157-167 | `createInitialState` no validation |
| QC-104 | state.schema.ts | 172-176 | `addHistoryEvent` typed `details` parameter |
| QC-105 | workflow.schema.ts | 19-22 | `WorkflowTechniquesSchema` carries workflow-level technique inheritance |
| QC-106 | activity.schema.ts | 64-110 | `StepSchema` with required `kind`, `technique` (string\|binding), `actions`, `triggers`, inline checkpoint/loop fields |
| QC-107 | activity.schema.ts | 13-20 | `ActionSchema` with 5 action types |
| QC-108 | activity.schema.ts | 24-28 | `WorkflowTriggerSchema` for cross-workflow triggers |
| QC-109 | state.schema.ts | 138-155 | `NestedWorkflowStateSchema` with recursive `triggeredWorkflows` |
| QC-110 | resource.schema.ts | 3-9 | `ResourceSchema` with `.passthrough()` |
| QC-111 | technique.schema.ts | 52-58 | `OutputItemDefinitionSchema` (named technique outputs) |

## Open Questions

| # | Question | Status | Notes |
|---|----------|--------|------------|
| Q1 | How are checkpoints and loops represented in an activity? | Answered | As `kind:checkpoint` / `kind:loop` steps within the ordered `steps[]`. `Checkpoint` is a TS interface; loops are validated inline on `StepSchema`. |
| Q2 | How do JSON Schemas relate to the Zod schemas? | Answered | Generated from Zod by `scripts/generate-schemas.ts` (`zod-to-json-schema`). `activity.schema.json` uses `$refStrategy: 'root'` for the recursive loop body. |
| Q3 | How are `and`/`or`/`not` conditions defined? | Answered | `ConditionSchema` inlines `and`/`or`/`not` via `z.lazy()`; nested boolean conditions are supported. |
| Q4 | Why doesn't `session.schema.ts` import `SemanticVersionSchema` from `common.ts`? | Open | `workflowVersion` in `session.schema.ts` (line 66) inlines the same `^\d+\.\d+\.\d+$` regex rather than importing the shared constant — a minor duplication. |
| Q5 | What is the division of responsibility between `WorkflowState`/`state.schema.ts` and `SessionFile`? | Open | `SessionFileSchema` is the server-managed `session.json` and `session.schema.ts` reuses `CheckpointResponseSchema`/`HistoryEntrySchema` from `state.schema.ts`. The precise division is not fully traced here. |
</content>
