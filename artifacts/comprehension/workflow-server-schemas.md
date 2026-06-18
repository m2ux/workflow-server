# Workflow Server Schemas — Comprehension Artifact

> **Last updated**: 2026-06-18  
> **Work packages**: [Multi-Agent Schema Formalisation (#84)](../planning/2026-03-30-multi-agent-schema-formalisation/README.md), [Mandatory Phase Bypass (#86)](../planning/2026-03-30-mandatory-phase-bypass/README.md)  
> **Coverage**: Schema definition system (Zod + generated JSON Schema), field propagation lifecycle, validation boundaries, the `steps[]` step-kinds model, technique schema, and the schemas MCP resource  
> **Related artifacts**: [workflow-server.md](workflow-server.md), [zod-schemas.md](zod-schemas.md), [json-schemas.md](json-schemas.md)

## 1. Schema System Architecture

### 1.1 Dual-Schema Design

The server maintains two parallel schema systems:

| System | Location | Purpose | Validates When |
|--------|----------|---------|----------------|
| **Zod** | `src/schema/*.ts` | Runtime validation in Node.js | Workflow loaded by server (`safeValidateWorkflow`, `src/loaders/workflow-loader.ts:192`) |
| **JSON Schema** | `schemas/*.json` (**generated**) | IDE tooling, documentation, TOON file authoring; served via the `workflow-server://schemas` MCP resource | TOON file opened in IDE (if `$schema` declared); fetched on demand by agents |

The Zod schemas are **authoritative** — the JSON Schema files are **generated from them** by
`scripts/generate-schemas.ts` (using `zod-to-json-schema`). The two stay in lockstep because the JSON
side is a derived artifact. `generate-schemas.ts` emits five files:
`workflow`, `state`, `condition`, `session-file`, and `activity` (the latter with `$refStrategy: 'root'`
so the loop-kind step's recursive `steps[]` body can reference `StepSchema` via `$defs`).

- **Zod** validates the **assembled runtime object** (workflow with inline `activities` array)
- **JSON Schema** aids **individual TOON file authoring** in the IDE (`workflow.toon`, each `activity.toon`)

`workflow.schema.json` is generated from `WorkflowSchema`, so it **includes** an `activities`
property (the Zod schema declares `activities: z.array(ActivitySchema).min(1).optional()`, `src/schema/workflow.schema.ts:55`).
At authoring time activities are separate files — loaded by `loadActivitiesFromDir()`
(`src/loaders/workflow-loader.ts:30`) and injected into the workflow object before Zod validation —
so a `workflow.toon` legitimately omits `activities`, which is permitted because the field is `.optional()`.

### 1.2 Schema File Inventory

```
src/schema/                          schemas/
├── common.ts (SemanticVersionSchema)
├── condition.schema.ts    ──gen──▶  condition.schema.json
├── activity.schema.ts     ──gen──▶  activity.schema.json
├── workflow.schema.ts     ──gen──▶  workflow.schema.json
├── technique.schema.ts    ←→        technique.schema.json   (hand-maintained pair; not emitted by generate-schemas.ts)
├── state.schema.ts        ──gen──▶  state.schema.json
├── session.schema.ts      ──gen──▶  session-file.schema.json
├── resource.schema.ts     (no JSON Schema counterpart)
```

`──gen──▶` marks files emitted by `scripts/generate-schemas.ts`. For everything except `technique` the
JSON side is generated, so the source of truth is the Zod `.ts` file.

**Note**: Technique definitions live in `src/schema/technique.schema.ts` (`TechniqueSchema`). Workflow and
activity rules are plain string arrays partitioned by audience inside `WorkflowRulesSchema`
(`src/schema/workflow.schema.ts:31`).

**Note**: The `WorkflowSchema` (`src/schema/workflow.schema.ts:38`) declares: `$schema`, `id`, `version`,
`title`, `description`, `author`, `tags`, `rules` (audience-partitioned), `variables`, `techniques`
(audience-partitioned), `initialActivity`, and `activities`.

### 1.3 Import Chain

```
common.ts (SemanticVersionSchema)
    ↓
condition.schema.ts  →  activity.schema.ts  →  workflow.schema.ts
                                                    ↑ imports ActivitySchema
                                                      (workflow.schema.ts re-exports Activity,
                                                       Step, Checkpoint, Decision, Transition,
                                                       Action, TechniquesReference)

technique.schema.ts  (imports common.ts only)
state.schema.ts      (imports nothing local)
session.schema.ts    (imports state.schema.ts — extends WorkflowState shapes)
resource.schema.ts   (standalone, minimal — `.passthrough()`)
```

`condition.schema.ts` is imported by `activity.schema.ts` (step `condition`/`when`, checkpoint/decision
conditions) and is itself recursive: `ConditionSchema` inlines `and`/`or`/`not` branches via `z.lazy()`
(`src/schema/condition.schema.ts:24`), so nested boolean conditions resolve inline.

---

## 2. Field Propagation Lifecycle

### 2.1 How a Schema Field Reaches an Agent

Tracing a field from definition to consumption:

```
1. DEFINE       workflow.schema.ts      → z.object({ myField: z.string() })
2. GENERATE     generate-schemas.ts     → emits workflow.schema.json from the Zod schema
3. AUTHOR       workflow.toon           → myField: "some value"
4. LOAD         workflow-loader.ts      → decodeToonRaw(content)  // TOON → JS object
5. VALIDATE     workflow-loader.ts      → safeValidateWorkflow(raw)  // Zod parse (src/loaders/workflow-loader.ts:192)
6. SERVE        workflow-tools.ts       → get_workflow projects metadata + the orchestrator technique bundle
7. CONSUME      Agent reads response    → field available in workflow data
```

Step 2 is a build step — running `generate-schemas.ts` re-derives the JSON Schema
from the Zod definition. In step 6, `get_workflow`
serves lightweight workflow metadata together with the orchestrator's technique bundle (the workflow's
`techniques.workflow` plus the core orchestrator techniques); `get_activity` injects the workflow's
inherited `techniques.activity` into each activity. A new schema field is picked up automatically by
Zod and reaches whichever projection includes it.

### 2.2 Critical Path: Adding a REQUIRED Field

When a Zod field is **required** (no `.optional()`, no `.default()`):

1. `safeValidateWorkflow(raw)` returns `{ success: false }` for any TOON file missing the field
2. `loadWorkflow()` returns `err(new WorkflowValidationError(workflowId, issues))`
3. `get_workflow` tool throws the error → MCP SDK returns error to agent
4. The workflow becomes **invisible** — `listWorkflows()` still shows its manifest (read from TOON header), but `loadWorkflow()` fails

**Migration requirement**: All existing workflow TOON files must include the new field BEFORE the schema change is deployed. The worktree currently holds 12 workflow directories (`meta` plus 11 domain workflows), so any required-field change is a coordinated migration across all of them.

### 2.3 Optional Fields: Safe Addition

When a Zod field uses `.optional()`:

1. Existing TOON files without the field pass validation (field is `undefined`)
2. `JSON.stringify()` omits `undefined` values — agents don't see the field
3. No migration needed — adoption is organic

### 2.4 Required Field with Default: Hybrid

When a Zod field uses `.default(value)`:

1. Existing TOON files without the field pass validation — Zod injects the default
2. The assembled object includes the default value
3. Agents see the field with its default value
4. **This enables "required" semantics without breaking existing TOON files** — the schema can require the field while defaulting absent values to a sensible baseline

---

## 3. additionalProperties Policy

### 3.1 Per-Schema Summary

Because the JSON Schema files are **generated** by `zod-to-json-schema`, every generated object emits
`additionalProperties: false` uniformly — there are no `true` occurrences in the generated `workflow`,
`activity`, `condition`, or `state` files (verified: `workflow.schema.json` has 36 `false` / 0 `true`;
`activity.schema.json` 15 `false` / 0 `true`). Generation keeps Zod and JSON aligned.

| Schema | Zod Behavior | JSON Schema (generated) | Effect |
|--------|-------------|-------------------------|--------|
| **Workflow** | Default (strips unknown) | `false` throughout | **Strict** — unknown properties rejected by JSON Schema, stripped by Zod |
| **Activity** | Default (strips unknown) | `false` throughout | **Strict** |
| **Condition** | Default (strips unknown) | `false` on each `anyOf` branch | **Strict** |
| **State** | Default (strips unknown) | `false` throughout | **Strict** |
| **Technique** | `.strict()` (`src/schema/technique.schema.ts:74`) | Hand-maintained `technique.schema.json` | **Strict Zod**; this pair is maintained outside `generate-schemas.ts` |
| **Resource** | `.passthrough()` (`src/schema/resource.schema.ts:9`) | (no JSON counterpart) | **Permissive** — extra keys retained |

Only two Zod schemas set an explicit strictness modifier: `TechniqueSchema` (`.strict()`) and `ResourceSchema`
(`.passthrough()`). `WorkflowSchema`, `ActivitySchema`, `StepSchema`, `ConditionSchema`, and `WorkflowStateSchema`
all use Zod's default strip behavior.

### 3.2 Impact on Schema Extension

For the **generated JSON Schema** (`additionalProperties: false` throughout):
- New properties appear automatically once added to the Zod schema and `generate-schemas.ts` is re-run
- The JSON file is a build artifact, kept in sync by regeneration
- IDEs with `$schema` validation flag unknown top-level keys; only files that declare `$schema` get this
  IDE-side check (the `WorkflowSchema` exposes an optional `$schema` field for exactly this)

For **Zod WorkflowSchema** (default behavior — strips unknowns):
- New fields are silently dropped if not declared in the schema
- This is SAFE — adding the Zod field first, then updating TOON files later, causes no errors
- The Zod schema is **authoritative** for runtime behavior and for the generated JSON Schema

---

## 4. Validation System

### 4.1 Validation Layers

```
Layer 1: JSON Schema (IDE)     → Validates TOON file syntax during authoring
Layer 2: Zod (runtime)         → Validates assembled object during loading
Layer 3: Session validation    → Validates tool call consistency (transition, technique association)
```

Layer 1 is optional (only if `$schema` declared). Layer 2 is mandatory. Layer 3 is informational (warnings in
`_meta`, never rejection). Layer 3's consistency checks live in `src/utils/validation.ts` —
`validateActivityTransition`, `validateWorkflowConsistency`, `validateWorkflowVersion`, and
`validateTechniqueAssociation`.

### 4.2 Error Reporting for Missing Required Fields

When Zod encounters a missing required field:

```
ZodError: [
  {
    code: 'invalid_type',
    expected: 'string',
    received: 'undefined',
    path: ['title'],     // example: a required workflow field
    message: 'Required'
  }
]
```

This flows through `safeValidateWorkflow()` → `WorkflowValidationError` → tool error response. The loader maps
each issue to `"<path>: <message>"` (`src/loaders/workflow-loader.ts:194`). The error message includes the path
and a generic "Required" message. Workflow authors will see this as a server error when loading the workflow.
(Example: `StepSchema`'s `kind` field is required, so a step authored without `kind` fails Zod
with `path: ['activities', N, 'steps', M, 'kind']`.)

### 4.3 Schemas MCP Resource

`get_workflow` responses carry no prepended schema text. Schemas are exposed **on demand** as MCP resources
(`src/resources/schema-resources.ts`):

1. `workflow-server://schemas` — all schemas combined, via `readAllSchemas(config.schemasDir)`
2. `workflow-server://schemas/{id}` — a single schema, via `readSchema(config.schemasDir, id)`

The loader (`src/loaders/schema-loader.ts`) recognizes five IDs — `workflow`, `activity`, `condition`,
`technique`, `state` (`SCHEMA_IDS`, `src/loaders/schema-loader.ts:16`) — and reads `{id}.schema.json` for each.
(Note: `generate-schemas.ts` also emits `session-file.schema.json`, but `session-file` is **not** in
`SCHEMA_IDS`, so it is not served through this resource.) Agents fetch these when they need to validate or
author definitions, rather than receiving them on every workflow read. Regenerating the JSON Schema files
(`generate-schemas.ts`) automatically updates what this resource serves.

---

## 5. TOON Format Considerations

### 5.1 TOON Capabilities

TOON is the file format for workflow definitions. Key characteristics relevant to schema extension:

- Supports objects, arrays, strings, numbers, booleans
- Arrays use `fieldName[count]:` syntax followed by indented items
- Nested objects are naturally supported
- Strings with special characters use quotes
- The `@toon-format/toon` library handles encode/decode
- `decodeToonRaw()` returns `unknown` — no type information

### 5.2 Example: `steps[]` in TOON

The execution construct is a single ordered, kind-tagged `steps[]` array on an activity. Every step declares a
`kind`; checkpoints and loops are **inline step kinds** at their concrete position:

```toon
steps[4]:
  - kind: technique
    technique: codebase-comprehension::map-area     # id derived from last :: segment
  - kind: action
    id: mark-mapped
    actions[1]:
      - action: set
        target: area_mapped
        value: true
  - kind: checkpoint                                  # inline decision point — position = presentation timing
    id: confirm-scope
    message: "Scope looks right?"
    options[2]:
      - id: proceed
        label: Proceed
      - id: revise
        label: Revise
        effect:
          transitionTo: scoping
  - kind: loop                                        # compound step; body is a nested steps[]
    id: per-file-review
    loopType: forEach
    over: changed_files
    variable: file
    steps[1]:
      - kind: technique
        technique: review::inspect-file
```

A `kind:technique` step may omit `id` (the loader derives it from the technique's last `::` segment via
`defaultStepId`, `src/schema/activity.schema.ts:119`); every other kind must declare an explicit `id`. A
`kind:loop` step's `loopType` field is named to avoid clashing with `Condition.type`. Activity-level
`decisions[]` and `transitions[]` are separate top-level arrays — they are orchestrator routing read at the
activity boundary, not part of the worker's step sequence.

---

## 6. Test Surface

### 6.1 Test Files Relevant to Schema Changes

The five files below exist under `tests/`. The schema test
surface also includes `tests/technique-loader.test.ts`, `tests/session-schema.test.ts`, and the e2e
`tests/e2e/definition-lint.test.ts` (which lints the TOON corpus against the schemas).

| Test File | Tests | Trigger for update |
|-----------|-------|--------------|
| `schema-validation.test.ts` | Zod schema parsing (conditions, activities, workflows) | New schema fields or kinds |
| `validation.test.ts` | Validation utilities (transitions, version, consistency, technique association) | Changes to `src/utils/validation.ts` |
| `workflow-loader.test.ts` | Workflow loading integration | Changes to loader behavior |
| `activity-loader.test.ts` | Activity loading | Changes to activity loading |
| `schema-loader.test.ts` | JSON Schema file loading via the schemas MCP resource | Changes to `SCHEMA_IDS` |

### 6.2 Test Helper Pattern

Tests use factory functions for test data. `tests/validation.test.ts:24` defines a `makeWorkflow`
helper of this shape:

```typescript
function makeWorkflow(overrides: Partial<Workflow> = {}): Workflow {
  return {
    id: 'test-wf',
    version: '1.0.0',
    title: 'Test Workflow',
    activities: [ /* planning → implementation → review, each with a step + transitions */ ],
    ...overrides,
  };
}
```

The helper's inline activities use a loose step shape and rely on the `Partial<Workflow>` typing — it
exercises the consistency/transition validators in `validation.test.ts`, not full `StepSchema` parsing.

---

## Open Questions

| # | Question | Status | Answer |
|---|----------|--------|------------|
| 1 | How do missing required fields manifest to workflow authors? | ✅ Answered | Zod returns `ZodError` with path and "Required" message; the loader maps each issue to `"<path>: <message>"` and the workflow fails to load (`WorkflowValidationError`). See §4.2. |
| 2 | Can Zod `.refine()`/`.superRefine()` validate cross-field references? | ✅ Answered | Yes — `WorkflowStateSchema`/`NestedWorkflowStateSchema` use `.refine()`, and `StepSchema` uses `.superRefine()` for the per-kind required-field contract. |
| 3 | How does `additionalProperties: false` in JSON Schema interact with schema updates? | ✅ Answered | The JSON Schema is **generated** from Zod, so adding a Zod field and re-running `generate-schemas.ts` updates it; `additionalProperties: false` is emitted uniformly. See §3.2. |
| 4 | Does JSON Schema validate individual TOON files or the assembled workflow? | ✅ Answered | JSON Schema aids individual TOON authoring; Zod validates the assembled runtime object. The generated `workflow.schema.json` declares `activities` (it is `.optional()`, so `workflow.toon` may omit it). See §1.1. |
| 5 | How is a single unit of guidance resolved for a step? | ✅ Answered | `get_technique(session_index, step_id?)` (`src/tools/resource-tools.ts:492`): with `step_id` it composes the technique bound to that step; without it, the active activity's (or the workflow's) first declared technique. See §7. |
| 6 | How is cross-workflow technique resolution handled? | ✅ Answered | `src/loaders/technique-loader.ts` resolves `::` path references (e.g. `other-workflow::group::op`). See §7. |
| 7 | What is the relationship between `generate-schemas.ts` outputs and `SCHEMA_IDS`? | ⬜ Open | `generate-schemas.ts` emits 5 files (`workflow`, `state`, `condition`, `session-file`, `activity`) but `schema-loader.ts`'s `SCHEMA_IDS` serves a different 5 (`workflow`, `activity`, `condition`, `technique`, `state`). `technique.schema.json` is hand-maintained (not generated); `session-file.schema.json` is generated but not served. Is the divergence intentional? See §1.2, §4.3. |
| 8 | How are checkpoints keyed for yield/respond/resume given they are inline steps? | ✅ Answered | The inline `kind:checkpoint` step's `id` is the stable key; the server keys checkpoint yield/respond/resume by `<activityId>-<checkpointId>` (`CheckpointResponseSchema` key format, `src/schema/state.schema.ts:31`). `activityCheckpoints()` synthesizes `Checkpoint` records from the inline steps (`src/schema/activity.schema.ts:289`). |

---

## 7. Technique Loading and the get_technique API

The model is **Goal → Activity → Technique → Tools**.

- **Loading a single unit of guidance:** `get_technique(session_index, step_id?)`
  (`src/tools/resource-tools.ts:492`). With `step_id`, it resolves the technique bound to that step
  (`step.technique`) and composes it; without `step_id`, it returns the active activity's first declared
  technique, or — if no activity is active — the workflow's first declared technique. Composition inherits the
  workflow-root `techniques/TECHNIQUE.md` base contract recursively (inputs/outputs/rules merged; ancestor
  Initial/Final protocol blocks wrap the descendant protocol).
- **Where techniques are declared:** activity-wide via `activity.techniques` (`TechniquesReferenceSchema`, a flat
  `string[]` of `::` references, `src/schema/activity.schema.ts:9`); per-step via `step.technique`
  (`src/schema/activity.schema.ts:67`, bare string or `{ name, inputs?, outputs? }` `TechniqueBinding`); and
  workflow-wide via `workflow.techniques.{workflow,activity}` (`WorkflowTechniquesSchema`,
  `src/schema/workflow.schema.ts:19`), which the server bundles into `get_workflow` (audience `workflow`) and
  injects into every `get_activity` (audience `activity`).
- **Cross-workflow references:** resolved by `::` path (e.g. `other-workflow::group::op`) in
  `src/loaders/technique-loader.ts`.
- **Technique definitions** validate against `TechniqueSchema` (`src/schema/technique.schema.ts:66`, `.strict()`),
  authored as markdown and parsed by `src/loaders/markdown-technique-loader.ts`.

---

*This artifact is part of a persistent knowledge base. It is augmented across
successive work packages to build cumulative codebase understanding.*
