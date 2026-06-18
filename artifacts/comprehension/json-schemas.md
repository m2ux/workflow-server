# JSON Schema Comprehension — Workflow Server

**Scope:** `schemas/workflow.schema.json`, `schemas/activity.schema.json`, `schemas/technique.schema.json`, `schemas/condition.schema.json`, `schemas/state.schema.json`, `schemas/session-file.schema.json`
**Schema dialect:** JSON Schema draft-07 (declared `"$schema": "http://json-schema.org/draft-07/schema#"` in every file)
**Created:** 2026-03-27
**Last updated:** 2026-06-18

---

## Schema Inventory

| File | Title | Root `$ref` | Definitions | Lines |
|------|-------|-------------|-------------|-------|
| workflow.schema.json | workflow | `#/definitions/workflow` | workflow (variables, rules, techniques, and the inline `activities[]` shape are all defined inline under the root) | 1032 |
| activity.schema.json | activity | `#/definitions/activity` | activity — a single inline definition; the ordered `steps[]` (with inline checkpoint/loop step-kinds), `decisions`, `transitions`, `triggers`, and the server-computed `artifacts[]` are all nested under it | 514 |
| technique.schema.json | technique | `#/definitions/technique` | inputItemDefinition, inputsDefinition, protocolBlock, protocolDefinition, rulesDefinition, outputComponentsDefinition, outputArtifact, outputItemDefinition, outputsDefinition, technique | 109 |
| condition.schema.json | condition | `#/definitions/condition` | condition (anyOf: simple, and, or, not) | 104 |
| state.schema.json | state | `#/definitions/state` | state (single inline definition; nested objects for checkpointResponses, decisionOutcomes, activeLoops, history, parentWorkflow, triggeredWorkflows, lastError are inlined) | 398 |
| session-file.schema.json | session-file | `#/definitions/session-file` | session-file (single inline definition; server-managed `session.json` state) | 306 |

The model is **Goal → Activity → Technique → Tools**. Activities bind techniques. `technique.schema.json` defines the technique authoring shape (inputs / protocol / outputs / rules). `condition.schema.json` and `state.schema.json` describe runtime structures. `session-file.schema.json` describes the server-managed `session.json`.

### Generation provenance

`workflow`, `state`, `condition`, `session-file`, and `activity` are **generated** from their Zod schemas by `scripts/generate-schemas.ts`, which calls `zodToJsonSchema`. The script emits each file with two `$refStrategy` settings:

- `activity` is generated with `$refStrategy: 'root'` (it emits internal `$ref`s so the recursive loop-kind step body — `steps[].steps[]` referencing the step item — can be represented).
- `workflow`, `state`, `condition`, and `session-file` are generated with `$refStrategy: 'none'`, which **inlines fully** (no internal `$ref`s).

`technique.schema.json` is hand-maintained (it is the only schema carrying a `$id`, `"technique.schema.json"`).

> Note: `scripts/generate-schemas.ts` writes a `"$schema": "https://json-schema.org/draft/2020-12/schema"` wrapper, but every on-disk schema file declares draft-07. The on-disk files are the source of truth for validation; the dialect mismatch in the generator wrapper is noted as an open question below.

### Schemas served by the server vs. files on disk

The server's schema loader (`src/loaders/schema-loader.ts`, `SCHEMA_IDS`) serves exactly five schema IDs: **`workflow`, `activity`, `condition`, `technique`, `state`**. `session-file.schema.json` exists on disk (and is generated) but is **not** in the served `AllSchemas` set — it documents the server's internal session file rather than authored workflow content.

---

## Cross-Schema References (`$ref` Graph)

```
workflow.schema.json
  └── (self-contained, fully inlined — no external $ref)
      workflow → variables, rules, techniques, activities (all inline,
      with conditions inlined within activities[].steps/decisions/transitions)

activity.schema.json
  └── (self-contained — uses INTERNAL $ref only)
      condition is inlined as a reusable node at
        #/definitions/activity/properties/steps/items/properties/condition
      and referenced via that internal path from: nested and/or/not conditions,
      step.actions[].condition, decisions[].branches[].condition,
      transitions[].condition, and the loop-kind step.breakCondition.
      The loop-kind body steps[].items is an internal $ref to the step item
        (#/definitions/activity/properties/steps/items) — the only recursive ref.

technique.schema.json
  └── (self-contained, internal $ref between definitions)
      technique → inputsDefinition, protocolDefinition, outputsDefinition,
      rulesDefinition; inputs/outputs reference outputComponentsDefinition / outputArtifact

condition.schema.json
  └── (self-contained; nested boolean conditions are empty schemas under 'none' generation)
      and.conditions.items → {}  (an empty schema that accepts anything)
      or.conditions.items  → {}
      not.condition        → {}

state.schema.json
  └── (self-contained, fully inlined — no external $ref)

session-file.schema.json
  └── (self-contained, fully inlined — no external $ref; triggeredWorkflows[].state is {})
```

**Key observation:** No schema uses a cross-FILE `$ref`. Each consumer carries its own copy of the condition shape (inlined by `$refStrategy: 'none'`, or referenced through an internal `$ref` path in the `'root'`-strategy activity schema). The standalone `condition.schema.json` is the canonical hand-readable copy; the activity and workflow schemas embed their own.

No file declares an `$id` except `technique.schema.json`. Because the other schemas inline everything and avoid cross-file references, resolution is not dependent on a validator base-URI strategy.

---

## `additionalProperties` Policy Analysis

### Per-Schema Summary

| Schema | Root definition | Sub-structures |
|--------|----------------|----------------|
| workflow | `false` | All nested objects `false` (variables, rules, techniques, activities and everything within) |
| activity | **`false`** | All nested structures `false` (steps, checkpoint options/effects, decisions, transitions, triggers, artifacts) |
| technique | `false` | Most definitions `false`; the open-value points are `inputItemDefinition.default` (untyped), `outputComponentsDefinition`/`rulesDefinition` (open `additionalProperties` by design — named keys with string/array values) |
| condition | `false` (on all 4 anyOf branches) | N/A |
| state | `false` | All `false`; flexible value maps use `additionalProperties: {}` (e.g. `variables`, `data`, `passedContext`, `returnedContext`) |
| session-file | `false` | All `false`; flexible value maps use `additionalProperties: {}` (e.g. `variables`, effect `variablesSet`) |

### Inconsistency Pattern

- **Workflow schema:** Strictly `false` everywhere — the strictest schema.
- **Activity schema:** Root `activity` is `false`, and every nested structure is `false`. Unknown top-level keys on an activity are rejected.
- **Technique schema:** Mostly `false`. Intentional open points are the named-map definitions (`rulesDefinition`, `outputComponentsDefinition`) whose KEYS are author-chosen but whose VALUE shapes are constrained, plus `inputItemDefinition.default` which is an untyped passthrough.
- **Condition / State / Session-file schemas:** Strictly `false` on object shapes; open `additionalProperties: {}` only where a runtime value bag legitimately holds arbitrary JSON values (variable maps, history `data`, passed/returned context).

---

## `rules` Property Analysis (QC-069, QC-127)

| Schema | Location | Type | Description |
|--------|----------|------|-------------|
| workflow | `workflow.rules.workflow` | `string[]` | Orchestrator-only ordered imperative rules; surfaced in get_workflow |
| workflow | `workflow.rules.activity` | `string[]` | Worker-facing rules inherited by every activity; injected into get_activity |
| workflow | `workflow.rules.universal` | `string[]` | Dual-audience rules surfaced in get_workflow AND injected into every get_activity |
| activity | `activity.rules` | `string[]` | Activity-level rules and constraints |
| technique | `technique.rules` | `object` (`rulesDefinition`) | Named key → (string \| string[]) rule pairs |

`workflow.rules` is an **audience-partitioned object** (`workflow` / `activity` / `universal`). The semantic split is intentional: workflow/activity rules are ordered lists of imperative directives, while technique rules are named domain constraints (a single string or an array of related rules per key). `technique.schema.json`'s `rulesDefinition` description notes that workflow/activity schemas use the string-array format. The naming collision across schema types could confuse tooling that processes `rules` generically.

---

## Condition Schema Deep Dive (QC-013, QC-068)

### Recursion depends on the generation strategy

The Zod source (`src/schema/condition.schema.ts`) **is** genuinely recursive: `ConditionSchema` is a `z.union` of simple/and/or/not where the and/or/not branches use `z.lazy(() => ConditionSchema)`. `evaluateCondition` recurses on `and`/`or`/`not` accordingly. The nested boolean conditions are inlined via `z.lazy`.

What lands in the JSON Schema files depends on the `$refStrategy` used to generate each file:

- **`activity.schema.json`** (generated with `'root'`): conditions preserve recursion through an internal `$ref` path. Nested `and`/`or` `conditions.items` and `not.condition` reference `#/definitions/activity/properties/steps/items/properties/condition`, which IS the condition shape — recursion holds.
- **`condition.schema.json`** and the conditions embedded in **`workflow.schema.json`** (generated with `'none'`): the recursion is **flattened**. The `and`/`or` `conditions` arrays declare `"items": {}` and the `not` branch declares `"condition": {}` — an empty schema that accepts anything. So at the JSON-Schema level, nested boolean conditions in these files are not structurally validated, even though the runtime Zod validator validates them fully. The empty-schema flattening is a consequence of `'none'` inlining.

### Value Type Gap

The `simple` condition's `value` property accepts:
```json
"type": ["string", "number", "boolean", "null"]
```

But workflow variables can be of type `"array"` or `"object"` (per `workflow.schema.json` `variables[].type`). If the runtime supports equality comparison for these types, the condition value should accept them too. (In practice `evaluateSimpleCondition` only does numeric/`===` comparisons, so array/object values would compare by reference — a real gap to weigh.)

---

## Workflow Schema `activities` Property (QC-001)

The `workflow` schema declares an `activities` property: an array of inline activity objects (`z.array(ActivitySchema).min(1).optional()` in Zod; an inline activity object array in the JSON Schema). This reflects the dual validation surface:

- **TOON files on disk** keep activities as separate files, so a workflow TOON typically omits `activities`.
- **The assembled runtime workflow object** (validated by Zod) includes the fully-resolved `activities[]`.

The workflow root properties are: `$schema`, `id`, `version`, `title`, `description`, `author`, `tags`, `rules` (audience-partitioned object), `variables`, `techniques` (audience-partitioned object: `workflow` / `activity`), `initialActivity`, `activities`. Workflow-level technique inheritance is handled by `techniques`, and activity skipping by checkpoint-step effects (`skipActivities`).

---

## State Schema Observations (QC-065, QC-125, QC-126)

### `currentActivity` Required Status

The `state` definition's required set is:
```json
"required": ["workflowId", "workflowVersion", "startedAt", "updatedAt"]
```

`currentActivity` is **optional** — consistent with `status: "completed"` / `"aborted"` states where there is no current activity.

### `stateVersion` Bounds

`"exclusiveMinimum": 0` with no upper bound and `"default": 1`. Could add a `maximum` constraint, though monotonically-incrementing version counters rarely warrant one.

### `variables` Typing

State `variables` uses `additionalProperties: {}` — any value type. This matches the runtime's flexible variable model but provides zero validation. Could be tightened to `additionalProperties: { "type": ["string", "number", "boolean", "array", "object", "null"] }` to at least exclude non-JSON-primitive types (though in practice JSON values are all that's possible).

---

## Session-file Schema Observations

`session-file.schema.json` describes the server-owned `session.json`. Notable shape:

- Required: `schemaVersion` (const `1`), `sessionIndex` (`^[A-Z2-7]{6}$`), `workflowId`, `workflowVersion`, `agentId`, `seq`, `ts`, `startedAt`.
- `activeCheckpoint` carries `{ checkpointId, activityId, yieldedAt }` — the yielded checkpoint awaiting a response. Checkpoint yield/respond/resume is keyed by `<activityId>-<checkpointId>` (the inline checkpoint step's id).
- `checkpointResponses` is a map keyed by checkpoint identifier, each value `{ optionId, respondedAt, effects? }` where `effects` may carry `variablesSet` / `transitionedTo` / `activitiesSkipped`.
- `triggeredWorkflows[]` records child workflow dispatch (with its own `sessionIndex`), and `parentSession` / `planningFolderPath` link the session graph.
- Open value bags (`variables`, effect `variablesSet`, `data`) use `additionalProperties: {}`.

---

## Step-level `triggers` (QC-122)

In both the activity schema's `steps[].triggers` and `activity.triggers`, `triggers` is an **array** of trigger objects (`{ workflow, description?, passContext? }`). `activity.triggers[].items` shares the same shape as the step-level trigger item via internal `$ref`.

---

## `setVariable` / checkpoint-effect Type Gaps (QC-067, QC-124)

### `setVariable` in checkpoint-step effects

A `kind:checkpoint` step's `options[].effect.setVariable`:
```json
"setVariable": {
  "type": "object",
  "additionalProperties": {}
}
```

`additionalProperties: {}` allows any value type. Could be constrained to match the workflow variable types.

### Variable-setting effect surface

The checkpoint step's `setVariable` is the variable-setting effect surface (alongside the `state`/`session-file` `variablesSet` records). If value-type tightening is pursued, it applies to this single location.

---

## Open Questions

| # | Question | Status |
|---|----------|--------|
| QC-013 / QC-068 | Are nested boolean conditions validated recursively in the JSON Schemas? | PARTIALLY — recursion holds in `activity.schema.json` (`'root'` strategy, internal `$ref`); it is flattened to `"items": {}` / `"condition": {}` in `condition.schema.json` and workflow-embedded conditions (`'none'` strategy). Runtime Zod validates fully via `z.lazy`. |
| QC-067 / QC-124 | Should variable-setting effects constrain value types? | OPEN — checkpoint-step `setVariable` uses `additionalProperties: {}`. This is a single-site decision (the checkpoint step's `setVariable`). |
| QC-125 | Should `stateVersion` have an upper bound? | OPEN — `exclusiveMinimum: 0`, no `maximum`. |
| QC-126 | Should state `variables` constrain value types? | OPEN — `additionalProperties: {}`. |
| QC-128 | The condition `value` type omits `array`/`object` while workflow variable types allow them — intended? | OPEN — `evaluateSimpleCondition` only does numeric/`===` comparisons, so equality on arrays/objects would be by reference. |
| QC-129 | `scripts/generate-schemas.ts` writes a `draft/2020-12` `$schema` wrapper, but the on-disk files all declare draft-07. Which dialect is authoritative, and should the generator be aligned? | OPEN. |
| QC-130 | `session-file.schema.json` is generated and present on disk but not in the server's served `SCHEMA_IDS`. Should it be exposed, or is the omission intentional (internal-only state)? | OPEN. |

---

## Checkpoint: architecture-confirmed

The schema set is six files: five served by the server (`workflow`, `activity`, `condition`, `technique`, `state`) plus the internal `session-file`. All are self-contained, resolving without a cross-FILE `$ref`; conditions are inlined or internally `$ref`'d per file. The generated schemas come from Zod via `scripts/generate-schemas.ts`; `technique.schema.json` is hand-maintained. The findings are localized to specific schema properties and can be addressed independently.
