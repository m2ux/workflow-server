# JSON Schema Comprehension — Workflow Server

**Scope:** `schemas/workflow.schema.json`, `schemas/activity.schema.json`, `schemas/skill.schema.json`, `schemas/condition.schema.json`, `schemas/state.schema.json`
**Schema dialect:** JSON Schema draft-07
**Created:** 2026-03-27

---

## Schema Inventory

| File | Title | Root `$ref` | Definitions | Lines |
|------|-------|-------------|-------------|-------|
| workflow.schema.json | workflow | `#/definitions/workflow` | variable, mode, artifactLocation, workflow | 175 |
| activity.schema.json | activity | `#/definitions/activity` | action, step, checkpointOption, checkpoint, decisionBranch, decision, loop, transition, workflowTrigger, artifact, skills, activity | 555 |
| skill.schema.json | skill | `#/definitions/skill` | toolDefinition, errorDefinition, executionPattern, architecture, matching, stateStructure, stateDefinition, interpretation, numericFormat, initialization, updatePattern, resumption, inputItemDefinition, protocolStep, inputsDefinition, protocolDefinition, rulesDefinition, outputComponentsDefinition, outputArtifact, outputItemDefinition, outputDefinition, skill | 493 |
| condition.schema.json | condition | `#/definitions/condition` | condition (anyOf: simple, and, or, not) | 119 |
| state.schema.json | state | `#/definitions/state` | parentWorkflowRef, triggeredWorkflowRef, stateSaveFile, state | 451 |

---

## Cross-Schema References (`$ref` Graph)

```
workflow.schema.json
  └── (self-contained, no external $ref)
      workflow → variable, mode, artifactLocation (all internal)

activity.schema.json
  └── condition.schema.json (relative $ref, 6 occurrences)
      step.condition, checkpoint.condition, decisionBranch.condition,
      loop.condition, loop.breakCondition, transition.condition

skill.schema.json
  └── (self-contained, no external $ref)
      skill → toolDefinition, errorDefinition, executionPattern,
      architecture, matching, stateDefinition, interpretation, etc.

condition.schema.json
  └── (self-contained — BUT recursive $ref is broken)
      and.conditions.items → {} (should be $ref: #/definitions/condition)
      or.conditions.items → {} (should be $ref: #/definitions/condition)
      not.condition → untyped (should be $ref: #/definitions/condition)

state.schema.json
  └── (self-contained, self-recursive)
      state → parentWorkflowRef, triggeredWorkflowRef (internal)
      triggeredWorkflowRef.state → $ref: #/definitions/state (recursive)
      stateSaveFile.state → $ref: #/definitions/state
```

**Key observation:** Only `activity.schema.json` uses cross-file `$ref`. It references `condition.schema.json` via bare relative path (`"$ref": "condition.schema.json"`). This works when schemas are loaded from the same directory, but no `$id` is declared in any schema file, making resolution implicitly dependent on the validator's base URI strategy.

**Note**: `workflow.schema.json` now includes an `activities` property. The JSON Schema and Zod schema are partially aligned — `workflow.schema.json` includes `activities` as an array of activity objects, while `WorkflowSchema` in Zod also includes `activities` as `z.array(ActivitySchema).min(1).optional()`.

---

## `additionalProperties` Policy Analysis

### Per-Schema Summary

| Schema | Root definition | Sub-definitions |
|--------|----------------|-----------------|
| workflow | `false` | All `false` (variable, mode, artifactLocation) |
| activity | **`true`** | All `false` (action, step, checkpointOption, checkpoint, decisionBranch, decision, loop, transition, workflowTrigger, artifact, skills) — except `modeOverrides` values which are `false` |
| skill | **`true`** | 16 of 22 sub-definitions use **`true`** |
| condition | `false` (on all 4 anyOf branches) | N/A |
| state | `false` | All `false` |

### Inconsistency Pattern

- **Workflow schema:** Strictly `false` everywhere — the strictest schema.
- **Activity schema:** Root `activity` uses `true`, but every sub-definition uses `false`. This means the activity object itself accepts unknown top-level keys, but none of its nested structures do.
- **Skill schema:** Both root and most sub-definitions use `true`. This is the most permissive schema, designed for extensibility because skills contain domain knowledge for AI agents and new fields are expected.
- **Condition/State schemas:** Strictly `false` — these are runtime data structures where extra fields would indicate bugs.

### Rationale for Skill Permissiveness

Skill sub-definitions like `toolDefinition`, `errorDefinition`, `executionPattern`, `architecture`, `matching`, `stateDefinition`, and `interpretation` all use `additionalProperties: true`. These definitions describe domain-specific knowledge structures consumed by AI agents. They are intentionally extensible — skill authors add custom fields to convey domain context that the schema cannot anticipate. Forcing `false` here would require constant schema updates as new skill patterns emerge.

---

## `rules` Property Analysis (QC-069, QC-127)

| Schema | Location | Type | Description |
|--------|----------|------|-------------|
| workflow | `workflow.rules` | `string[]` | Ordered imperative rules agents MUST follow |
| activity | `activity.rules` | `string[]` | Activity-level rules and constraints |
| activity | `modeOverrides.*.rules` | `string[]` | Mode-specific rules |
| skill | `skill.rules` | `object` (`rulesDefinition`) | Named key→value rule pairs |

The semantic difference is intentional: workflow/activity rules are ordered lists of imperative directives, while skill rules are named domain constraints. The type difference is not a bug per se, but it creates a naming collision that could confuse tooling that processes `rules` generically across schema types.

---

## Condition Schema Deep Dive (QC-013, QC-068)

### Recursive Validation

The `and` and `or` condition types correctly declare `conditions` with recursive `$ref`:
```json
"conditions": {
  "type": "array",
  "items": { "$ref": "#/definitions/condition" },
  "minItems": 2
}
```

The `not` type also correctly references `#/definitions/condition`. The recursive references are properly defined in the current JSON Schema.

### Value Type Gap

The `simple` condition's `value` property accepts:
```json
"type": ["string", "number", "boolean", "null"]
```

But workflow variables can be of type `"array"` or `"object"` (per `workflow.schema.json` variable definition). If the runtime supports equality comparison for these types, the condition value should accept them too.

---

## Workflow Schema Missing `activities` Property (QC-001)

The `workflow` definition has `initialActivity` (a string referencing the first activity ID) and `modes[].skipActivities` (referencing activity IDs), but there is no `activities` property on the workflow object itself. The workflow schema has:

- `id`, `version`, `title`, `description`, `author`, `tags`, `rules`, `variables`, `modes`, `artifactLocations`, `initialActivity`

Activities are defined as separate files and loaded by the runtime, not embedded in the workflow document. The `activities` property would be an array of activity references or inline activity definitions. Given the current architecture (activities are separate `.toon` files), the `activities` property should be an array of objects with at minimum an `id` and optionally an `activityFile` path reference, or an array of `$ref` to activity schema instances.

---

## State Schema Observations (QC-065, QC-125, QC-126)

### `currentActivity` Required Status

The `state` definition has:
```json
"required": ["workflowId", "workflowVersion", "startedAt", "updatedAt", "currentActivity"]
```

`currentActivity` is always required, but for `status: "completed"` or `status: "aborted"` workflows, there is no current activity. The schema should use conditional validation (`if`/`then`) or make `currentActivity` optional with a description noting when it's required.

### `stateVersion` Bounds

Currently: `"exclusiveMinimum": 0` with no upper bound. Should add a `maximum` constraint.

### `variables` Typing

State `variables` uses `additionalProperties: {}` — any value type. This matches the runtime's flexible variable model but provides zero validation. Could be tightened to `additionalProperties: { "type": ["string", "number", "boolean", "array", "object", "null"] }` to at least exclude non-JSON-primitive types (though in practice JSON values are all that's possible).

---

## `triggers` Singular/Plural Mismatch (QC-122)

In `activity.activity`:
```json
"triggers": {
  "$ref": "#/definitions/workflowTrigger",
  "description": "Workflow to trigger from this activity"
}
```

The property name is plural (`triggers`) but the type is a single object (`workflowTrigger`), not an array. Either rename to `trigger` (singular) or change to an array type. Given that `additionalProperties: true` is currently set on the activity root, renaming is less risky than changing the type (which would break existing documents). However, since activities could plausibly trigger multiple workflows, changing to an array may be the better semantic fix.

---

## `setVariable` / `mode.defaults` Type Gaps (QC-067, QC-124)

### `setVariable` in checkpoint effects

```json
"setVariable": {
  "type": "object",
  "additionalProperties": {},
  "description": "Variables to set..."
}
```

`additionalProperties: {}` allows any value type. Should be constrained to match the workflow variable types.

### `mode.defaults` in workflow schema

```json
"defaults": {
  "type": "object",
  "additionalProperties": {},
  "description": "Default variable values when mode is active"
}
```

Same pattern — any value type accepted. Should match the variable type constraints.

### Asymmetry

`mode.defaults` and `setVariable` are semantically equivalent (both set variable values), but neither has type constraints on the values. They should share the same value-type constraint.

---

## Checkpoint: architecture-confirmed

Auto-advanced — the schema architecture is well understood. The 5 schemas form a mostly self-contained set with one cross-file reference (activity → condition). The findings are all localized to specific schema properties and can be addressed independently.
