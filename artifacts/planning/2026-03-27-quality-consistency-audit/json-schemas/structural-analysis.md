---
target: /home/mike/dev/workflow-server/schemas/
analysis_date: 2026-03-27
lens: L12 structural (Meta-Conservation Law)
focus: Quality and consistency audit
files_analyzed:
  - workflow.schema.json (174 lines)
  - activity.schema.json (555 lines)
  - skill.schema.json (493 lines)
  - condition.schema.json (119 lines)
  - state.schema.json (451 lines)
  - README.md (1443 lines)
  - schema-header.md (12 lines)
---

# L12 Structural Analysis: schemas/

## Claim

**The schema system's deepest structural problem is that it is non-self-validating: the five schemas cannot collectively validate the data model they describe.** Three specific structural failures produce this:

1. **workflow.schema.json excludes `activities` and `activitiesDir`** from its property list (lines 105–171) and sets `additionalProperties: false` (line 171), meaning a workflow JSON containing activities — as documented in every README example — will be actively **rejected** by the schema that claims to define it.

2. **condition.schema.json's composite types lack recursive `$ref`** — the `and.conditions` array items (line 64–65: `"items": {}`), `or.conditions` array items (line 87–88: `"items": {}`), and `not.condition` field (line 107: bare `"description"` with no type or ref) all accept **any JSON value**, defeating the recursive condition validation that the schema's own `anyOf` structure was designed to express.

3. **`additionalProperties` is inconsistent across schemas** — workflow.schema.json (line 171), condition.schema.json (lines 51, 73, 95, 114), and state.schema.json (line 448) all use `false`, while activity.schema.json (line 552) and skill.schema.json (line 490) use `true`, meaning activities and skills silently accept malformed or unknown properties while workflows and states reject them.

**Falsifiable test**: Validate `{ "type": "and", "conditions": [42, "hello"] }` against condition.schema.json — it will pass. Validate a workflow JSON from the README's "Complete Example" (line 988–1083) against workflow.schema.json — it will be rejected because `activities` is not a defined property.

## Dialectic

### Defender

The claim is correct and verifiable. The workflow schema's `workflow` definition (lines 103–172) enumerates exactly 12 properties (`$schema`, `id`, `version`, `title`, `description`, `author`, `tags`, `rules`, `variables`, `modes`, `artifactLocations`, `initialActivity`) and locks the door with `additionalProperties: false`. Neither `activities` nor `activitiesDir` appears. The README's "Required Properties" table (line 453–458) lists `activities` as required, and the "Complete Example" (lines 988–1083) includes inline `activities`. These are documentation-validated, schema-rejected.

The condition schema failure is equally direct: `"items": {}` is the JSON Schema equivalent of `any` — it validates everything. The entire `anyOf` dispatch on `type: "simple" | "and" | "or" | "not"` is meaningless for nested conditions because child conditions are never type-checked.

### Attacker

The schemas aren't meant to validate complete assembled workflows. The server architecture uses TOON files — activities live in separate `.toon` files loaded from an `activitiesDir` at runtime. The workflow schema validates **workflow metadata only**, and `additionalProperties: false` without `activities` is correct for that scope. The README documents the runtime data model, not the file-level validation schema.

For conditions: JSON Schema draft-07 does not cleanly support recursive `$ref` inside `anyOf`. The `items: {}` is a pragmatic compromise — actual validation happens in the TypeScript runtime via Zod or manual checks, not via raw JSON Schema validation. The schemas are documentation artifacts, not enforcement mechanisms.

### Prober (what both take for granted)

Both assume the schemas serve a single purpose. But the evidence contradicts this:

- The README documents `validateWorkflow(data)` and `safeValidateWorkflow(data)` functions (lines 1100–1112) that supposedly validate against these schemas programmatically.
- The README's "Validation" section (lines 1087–1123) says "Validate a workflow file" using `npx tsx scripts/validate-workflow.ts` — implying the schema IS used for enforcement.
- Every schema file includes `"$schema": "http://json-schema.org/draft-07/schema#"` — a machine-readable declaration that this IS a validation schema, not documentation.

If the schemas are documentation-only, the `$schema` declaration and validation tooling are misleading. If they're for validation, the missing properties and broken recursion are bugs. Neither position is internally consistent.

### Transformed Claim

The deepest structural problem is not simply "non-self-validating" — it is that **the schemas serve two masters** (TOON runtime metadata validation and JSON documentation/examples) **and are structurally optimized for neither**. The schemas declare themselves as draft-07 JSON Schemas (validation artifacts) while functioning as documentation (descriptive artifacts), and no consumer can rely on them for either purpose without runtime knowledge the schemas don't encode.

## Concealment Mechanism

**Documentation-as-truth.** The README.md is so comprehensive — 1,443 lines with ER diagrams, Mermaid flowcharts, ontology tables, field-by-field breakdowns, and complete working examples — that it becomes the de facto specification. No consumer checks the actual `.schema.json` files because the README appears authoritative and complete. The README claims properties exist (`activities`, `activitiesDir`) that the schema rejects, documents enum values (`"message"` in Action) that the README's own summary tables omit, and describes constraints (`blocking` is "Always true") that the schema contradicts (`default: true`, settable to `false`).

The concealment operates by **information asymmetry**: the README contains strictly more information than the schemas (it documents properties the schemas don't define), so anyone reading only the README never encounters the schema's actual constraints. The schemas are 1,792 lines of JSON; the README is 1,443 lines of Markdown. The documentation is nearly as large as the thing it documents, creating an illusion of completeness.

## Improvement #1: Align Schema with Documentation

**Proposed change** (would pass code review):

Add `activities` and `activitiesDir` to `workflow.schema.json`:

```json
"activities": {
  "type": "array",
  "items": { "$ref": "activity.schema.json" },
  "description": "Inline activity definitions"
},
"activitiesDir": {
  "type": "string",
  "description": "Directory containing external activity TOON files"
}
```

Fix condition recursion in `condition.schema.json`:

```json
"conditions": {
  "type": "array",
  "items": { "$ref": "#/definitions/condition" },
  "minItems": 2
}
```

And for `not`:

```json
"condition": {
  "$ref": "#/definitions/condition",
  "description": "The condition to negate"
}
```

### Three Properties Visible Only Because of This Improvement

1. **Schema-server coupling becomes visible.** Adding `activities` to the workflow schema forces a decision: does the schema validate workflows with inline activities, workflows with `activitiesDir`, or both? The schema cannot express "exactly one of these two loading strategies" in draft-07 without `oneOf` — and the server's TOON loading logic (file discovery, `artifactPrefix` injection, directory scanning) cannot be captured in JSON Schema at all. The improvement reveals that the schema must either (a) document a JSON format the server never produces, or (b) describe the server's internal model which includes computed fields the schema can't validate.

2. **Cross-file `$ref` fragility becomes visible.** Adding `"$ref": "activity.schema.json"` to the workflow schema reveals that activity.schema.json already uses relative `$ref` to `condition.schema.json` (lines 50, 128, 174, 248, 279), but workflow.schema.json currently has zero cross-file references. Whether relative `$ref` resolves depends on the validator's base URI, which is a runtime property. The improvement creates a dependency chain (workflow → activity → condition) that works in filesystem-based validation but breaks in API-served or bundled contexts.

3. **The `additionalProperties` split becomes visible.** The workflow schema uses `false` (strict), the activity schema uses `true` (permissive). Adding `activities` to the strict workflow schema means the workflow validates tightly but its child activities validate loosely — a parent enforces constraints its children ignore. This asymmetry means a valid workflow can contain invalid-looking activities that pass validation only because activities accept unknown properties.

## Diagnostic Applied to Improvement #1

**What does the improvement conceal?** Adding `activities` and fixing condition recursion conceals that **the schema system fundamentally cannot express the TOON loading model**. TOON files use indentation-based syntax with automatic field injection (`artifactPrefix` is `readOnly` and server-computed, per activity.schema.json line 425). The schema describes a JSON shape, but the actual data lifecycle is: TOON source → parser → server enrichment → runtime object. The improvement makes the JSON Schema look complete while hiding that the TOON-to-runtime pipeline adds semantic information (computed prefixes, loaded resources, resolved cross-references) that no static schema can validate.

**Property of the original problem visible only because the improvement recreates it:** The improvement adds `activities` to the workflow schema, creating a schema that validates a data shape the system never actually produces as a single JSON document. The original problem (schema doesn't match documentation) becomes a deeper problem (schema matches documentation that describes a data shape that doesn't exist in any pipeline stage). The two-masters problem reappears: the schema now matches the README's examples but diverges from the server's actual data flow.

## Improvement #2: Split Schema by Consumer

**Proposed change:** Create two schema layers:

1. `workflow-meta.schema.json` — validates only workflow metadata (id, version, title, variables, modes, artifactLocations, initialActivity). This is the current schema, correctly scoped.
2. `workflow-assembled.schema.json` — validates a fully assembled workflow with activities resolved and inlined. This is what the README documents.

Add a `_loadedFrom` field to activity definitions indicating their source (inline vs. TOON directory).

### Diagnostic Applied to Improvement #2

**What does this conceal?** The split conceals that there are actually **three** validation needs, not two: (1) TOON file syntax validation, (2) assembled runtime model validation, (3) documentation example validation. The third need is invisible because it seems like a subset of (2), but the README examples include conventions and patterns that neither TOON files nor the runtime model follows literally (e.g., README examples use `"$schema": "../../schemas/workflow.schema.json"` — a relative path that only works from a specific directory).

**What persists?** The split creates two schemas that each serve one consumer, but both ignore the AI agent — the primary consumer of the workflow system. The AI agent receives workflow data via MCP tool responses (`get_workflow`, `get_skills`), which deliver a third data shape that neither schema describes.

## Structural Invariant

The property that persists through every improvement: **the validation boundary always lags the runtime model.** No matter how the schemas are restructured, the server adds semantic meaning that static schemas cannot express:

- `artifactPrefix` is computed from the activity filename at load time (activity.schema.json line 425: `readOnly: true`)
- Cross-references between activities and skills are resolved at runtime
- TOON parsing adds structural information (ordered keys, indentation semantics) absent from JSON
- MCP tool responses reshape and filter the data per-consumer

The schema can validate structure but not semantics, and the system's value lies entirely in its semantics.

## Inversion

**Inverted design:** Generate schemas FROM the runtime TypeScript types using code-first schema generation (e.g., Zod schemas → JSON Schema). The TypeScript types become the single source of truth, and JSON Schema is always a derived artifact, never manually maintained.

**New impossibility:** In this inverted design, the JSON Schema is always in sync with the runtime model, but **the TOON authoring format becomes unspecified**. There is no human-readable specification for how to write TOON files — authors must reverse-engineer the generated schema, which describes TypeScript runtime objects (with computed fields, optional server-injected properties, and post-processing transforms) rather than TOON source format. The schema tells you what the system produces, not what you should write.

## Conservation Law

### Schema Expressiveness × Authoring Accessibility = Constant

When the schema precisely describes the runtime model (high expressiveness), it diverges from the TOON authoring format and becomes unusable as a writing guide (low accessibility). When the schema describes the TOON authoring format (high accessibility), it fails to capture computed fields, cross-references, and runtime transformations (low expressiveness). The current system has chosen accessibility — the README functions as an authoring guide with examples — at the cost of expressiveness — the schemas don't validate what they claim to.

This law predicts: any attempt to make the schemas more expressive (adding computed fields, fixing validation gaps) will make them less useful for TOON authors, and any attempt to make them more accessible (matching README examples) will make them less accurate as runtime descriptions.

## Meta-Diagnostic: Applied to the Conservation Law

**What does the conservation law conceal?** The law frames the problem as a two-party tension (validation engine vs. human author), but it conceals the existence of a **third consumer: the AI agent.** The schema system exists primarily for AI agents executing workflows via MCP tools. AI agents don't need the TOON authoring format (they receive data via `get_workflow` / `get_skills` API calls) AND they don't need strict JSON Schema validation (they trust the server's responses). The conservation law hides that the entire hand-maintained schema system may be solving a problem the MCP server has already solved — the server IS the schema, delivered as typed tool responses.

**Structural invariant of the law:** When you try to improve the conservation law by adding "AI agent usability" as a third dimension, the law holds: the schemas serve whichever consumer is NOT currently using them. When validation runs, they serve the author's expectations. When the author writes, they serve the validator's requirements. When the AI agent reads, they serve neither — the AI gets its model from MCP tool calls. The invariant is: **static specification artifacts become documentation fossils in systems where the runtime API is the actual contract.**

**Inverted invariant:** Design a system where the specification IS the API — the schema is not a separate artifact but the API contract itself (like OpenAPI), generated from and enforced by the server at every request boundary. In this system, there is no schema-documentation drift because there is no separate schema.

**New impossibility:** This design makes versioning impossible — the API contract changes with every deployment, and there is no stable reference for TOON authors to write against. Backward compatibility becomes a runtime property, not a documented one.

## Meta-Law

### Documentation Relevance × System Evolution Rate = Constant

The conservation law (Expressiveness × Accessibility = Constant) conceals that the schema system's real problem is **temporal**: as the system evolves (new TOON features, server-computed fields, MCP tool responses), the documentation artifacts (README, JSON Schema) become progressively less relevant to actual usage. The faster the system evolves, the less documentation can keep up; the more comprehensive the documentation, the slower the system can evolve without creating drift.

**Concrete, testable prediction for this specific codebase:** The README.md's field tables and "Required Properties" sections already diverge from the schema files and will continue to diverge with each schema change. Specifically:

1. The README's Workflow "Required Properties" table (line 453–458) lists `activities` as required — the schema requires only `id`, `version`, `title`. **This divergence already exists and is testable now.**
2. The README's Action enum (line 378–384) lists 4 values (`log`, `validate`, `set`, `emit`) — the schema defines 5 (`log`, `validate`, `set`, `emit`, `message`). **This divergence already exists and is testable now.**
3. The README's checkpoint description (line 313) says `blocking` is "Always true" — the schema defines `blocking` as `default: true` with `type: boolean`, meaning it CAN be false, and the schema includes `autoAdvanceMs` and `defaultOption` fields designed for non-blocking checkpoints. **This divergence already exists and is testable now.**

Each of these is a direct consequence of the meta-law: the system evolved (added `message` action, added non-blocking checkpoints) while the documentation fossils in the README preserved the old specification.

## Bug Table

| # | Location | What Breaks | Severity | Fixable or Structural |
|---|----------|-------------|----------|----------------------|
| 1 | `workflow.schema.json:170` | `required: ["id", "version", "title"]` — README documents `activities` as required (line 458), schema omits it. Any workflow JSON with an `activities` array is rejected by `additionalProperties: false`. | **HIGH** | FIXABLE — add `activities` property to schema or correct README |
| 2 | `workflow.schema.json:171` | `additionalProperties: false` excludes `activities` and `activitiesDir`, which the README documents as valid properties (lines 255–256, 431, 471). | **HIGH** | FIXABLE — add missing properties to schema |
| 3 | `condition.schema.json:64–65` | `and.conditions` has `"items": {}` — nested conditions in an AND composite are not validated. `{"type": "and", "conditions": [42, null, "garbage"]}` passes validation. | **HIGH** | FIXABLE — change to `"items": {"$ref": "#/definitions/condition"}` |
| 4 | `condition.schema.json:87–88` | `or.conditions` has `"items": {}` — same issue as AND. Nested conditions in OR composites accept any JSON. | **HIGH** | FIXABLE — same fix as #3 |
| 5 | `condition.schema.json:107` | `not.condition` has no `$ref` or type constraint — the negated condition field accepts any JSON value including strings, numbers, and arrays. | **HIGH** | FIXABLE — add `"$ref": "#/definitions/condition"` |
| 6 | `activity.schema.json:552` | `additionalProperties: true` — inconsistent with workflow (false), condition (false), state (false). Activities silently accept unknown/misspelled properties without warning. A typo like `"trnasitions"` passes validation. | **MEDIUM** | FIXABLE — change to `false` after confirming all properties are enumerated. Risk: TOON files may use properties not yet in schema. |
| 7 | `skill.schema.json:490` | `additionalProperties: true` — same inconsistency as activity. Skills accept arbitrary unknown fields. | **MEDIUM** | FIXABLE — change to `false`. Higher risk: skill schema explicitly allows extension via `additionalProperties: true` on many sub-definitions (toolDefinition, errorDefinition, etc.), suggesting intentional extensibility. |
| 8 | `README.md:458` | Required Properties table lists `activities` as required for Workflow, but `workflow.schema.json` requires only `["id", "version", "title"]`. Documentation-schema divergence. | **MEDIUM** | FIXABLE — update README to match schema |
| 9 | `README.md:255–256` | Workflow entity table documents `activitiesDir` (string) and `activities` (Activity[]) as fields. Neither exists in the schema. | **MEDIUM** | FIXABLE — update README or add to schema |
| 10 | `README.md:313` | Documents checkpoint `blocking` as "Always true — checkpoints block progress." Schema defines `blocking` as `type: boolean, default: true` (activity.schema.json:147) with `autoAdvanceMs` (line 153) and `defaultOption` (line 149) designed for non-blocking operation. README contradicts schema. | **MEDIUM** | FIXABLE — update README to describe non-blocking checkpoint support |
| 11 | `README.md:378–384` | Action enum documented as 4 values: `log`, `validate`, `set`, `emit`. Schema defines 5: `log`, `validate`, `set`, `emit`, **`message`** (activity.schema.json:12). Missing `message` action from README. | **MEDIUM** | FIXABLE — add `message` to README documentation |
| 12 | `state.schema.json:447` | `required: ["workflowId", "workflowVersion", "startedAt", "updatedAt", "currentActivity"]` — `currentActivity` is required, but a completed/aborted workflow may not have a meaningful current activity. The `status` field can be `"completed"` or `"aborted"` while `currentActivity` must still reference something. | **MEDIUM** | FIXABLE — make `currentActivity` conditionally required, or document that it retains the last active value at completion |
| 13 | `activity.schema.json:441–443` | `triggers` (plural) property is typed as a single `workflowTrigger` object, not an array. The plural naming suggests a collection, but only one trigger is allowed per activity. | **LOW** | FIXABLE — rename to `trigger` (singular) for clarity, or change type to array if multiple triggers should be supported |
| 14 | `activity.schema.json:50–51` | `step.condition` uses `"$ref": "condition.schema.json"` — a relative file reference. Whether this resolves depends on the JSON Schema validator's base URI configuration. If schemas are loaded as standalone strings or served via API, the reference breaks silently. | **MEDIUM** | STRUCTURAL — inherent to JSON Schema's `$ref` resolution model; would require bundling or absolute URIs to fix portably |
| 15 | `activity.schema.json:87–89` | `checkpointOption.effect.setVariable` uses `"additionalProperties": {}` (accepts any value type), but workflow `variable.type` constrains to `["string", "number", "boolean", "array", "object"]`. A checkpoint effect can set a variable to a type the variable definition forbids, and no cross-schema validation catches it. | **MEDIUM** | STRUCTURAL — cross-schema type consistency cannot be enforced in JSON Schema draft-07 |
| 16 | `skill.schema.json:42, 71, 127, 147, 169, 208, 240, 254, 270, 289` | Ten sub-definitions in skill.schema.json use `additionalProperties: true`: `toolDefinition`, `errorDefinition`, `executionPattern`, `architecture`, `matching`, `stateDefinition`, `interpretation`, `numericFormat`, `initialization`, `updatePattern`. This is likely intentional extensibility but creates a validation void — skill files can contain arbitrary structures in any of these sections. | **LOW** | STRUCTURAL — conservation law predicts this: expressiveness of the skill model requires open schemas to accommodate diverse skill types |
| 17 | `workflow.schema.json:71` | `mode.defaults` uses `"additionalProperties": {}` (any-typed values), but the mode is wrapped in `additionalProperties: false`. The mode definition is strict about its own shape but permissive about defaults values — asymmetric validation depth. | **LOW** | STRUCTURAL — defaults must be open-typed to set arbitrary workflow variables |
| 18 | `state.schema.json:145–146` | `stateVersion` has `exclusiveMinimum: 0, default: 1` but no maximum. Migration code must handle arbitrarily large version numbers. Minor but unbounded. | **LOW** | FIXABLE — add a reasonable maximum or document the expected range |
| 19 | `condition.schema.json:37–43` | `simple.value` type is `["string", "number", "boolean", "null"]` — excludes `array` and `object`. Workflow variables can be typed as `array` or `object` (workflow.schema.json:16), but conditions cannot compare against them. A variable of type `array` can never have a meaningful equality check via the condition schema. | **MEDIUM** | STRUCTURAL — condition comparison operators (`==`, `!=`, `>`, `<`) are semantically undefined for arrays/objects; the type restriction is correct but creates a coverage gap |
| 20 | `state.schema.json:308–309` | `variables` uses `"additionalProperties": {}` with `default: {}` — runtime variables have no type constraints in state. The workflow schema defines variable types (string, number, boolean, array, object), but the state schema stores them as untyped `any`. Type corruption at runtime would not be caught. | **LOW** | STRUCTURAL — state schema intentionally stores runtime values without re-validating types; enforcement is the server's responsibility |
| 21 | `README.md:988–1083` | "Complete Example" includes a full workflow JSON with inline `activities` array. This example would be REJECTED by `workflow.schema.json` because `activities` is not a defined property and `additionalProperties: false`. The README's primary learning example is invalid according to the schema it documents. | **HIGH** | FIXABLE — align schema with example or add a note that the example shows the assembled runtime model |
| 22 | `skill.schema.json:470` | `rules` property uses `$ref: "#/definitions/rulesDefinition"` which is `additionalProperties: { "type": "string" }`. But activity.schema.json defines `rules` (line 483–488) as `type: array, items: { type: string }`. Same concept name (`rules`) with incompatible types across schemas — skill rules are key-value objects, activity rules are string arrays. | **MEDIUM** | STRUCTURAL — reflects different semantic models (skills have named rules, activities have ordered rule lists). Naming collision creates cognitive overhead. |
| 23 | `workflow.schema.json:137–143` | Workflow `rules` is `type: array, items: { type: string }` — same as activity rules (array of strings). But skill `rules` is an object with string values. Three entities use `rules` with two incompatible shapes. | **LOW** | STRUCTURAL — same as #22; the workflow/activity model uses ordered rule lists while the skill model uses named rule maps |

## Summary

### Conservation Law
**Schema Expressiveness × Authoring Accessibility = Constant.** Making the schemas more accurate as validation tools (fixing recursive conditions, adding missing properties, tightening `additionalProperties`) reduces their utility as loose authoring guides. Making them more accessible to TOON authors (matching README examples, allowing extension) reduces their precision as validators.

### Meta-Law
**Documentation Relevance × System Evolution Rate = Constant.** The faster the workflow system evolves (new features, computed fields, MCP tool capabilities), the more the static documentation artifacts (README, JSON Schema files) diverge from actual system behavior. The three confirmed divergences (missing `message` action, incorrect `blocking` documentation, phantom `activities` requirement) are direct evidence of this law in action.

### Findings by Severity

| Severity | Count | Fixable | Structural |
|----------|-------|---------|------------|
| HIGH | 6 | 6 | 0 |
| MEDIUM | 11 | 7 | 4 |
| LOW | 6 | 2 | 4 |
| **Total** | **23** | **15** | **8** |

### Critical Path

The 6 HIGH-severity findings (#1–5, #21) form a coherent cluster: the schema system's primary validation mechanisms are broken (condition recursion) or contradicted by documentation (workflow properties). These are all fixable and represent the highest-ROI remediation targets. The 8 structural findings are predicted by the conservation law — they cannot be resolved without trading one property for another.
