---
target: src/schema/ (5 files: workflow.schema.ts, activity.schema.ts, condition.schema.ts, skill.schema.ts, state.schema.ts)
reference: schemas/ (5 JSON schemas: workflow.schema.json, activity.schema.json, condition.schema.json, skill.schema.json, state.schema.json)
analysis_date: 2026-03-27
lens: L12 structural (meta-conservation law)
focus: Quality and consistency audit
---

# L12 Structural Analysis: `src/schema/`

## Claim

**The dual-definition architecture — Zod schemas in `src/schema/` and JSON schemas in `schemas/` — is this codebase's deepest structural problem.** The two schema systems describe the same domain model for different consumers (TypeScript runtime vs. external tooling) but evolve independently with no synchronization mechanism. Drift has already occurred. Multiple fields exist in JSON schemas that are absent from Zod, and vice versa. The two systems currently contradict each other on what constitutes a valid workflow.

This claim is falsifiable: if every property in every JSON schema has a corresponding Zod field with identical constraints, and vice versa, the claim is false.

## Dialectic

### Defender

The dual definitions are architecturally necessary. JSON Schema serves external tooling — IDE auto-completion for TOON workflow files, language-agnostic validation for non-TypeScript consumers, and human-readable documentation with rich descriptions. Zod serves TypeScript runtime validation with zero-cost type inference (`z.infer<typeof Schema>`). You cannot extract TypeScript types from JSON Schema at build time without code generation, and you cannot provide IDE completion for JSON files from Zod without a build step. The duplication is the price of polyglot accessibility.

### Attacker

The drift has already happened in at least seven concrete places:

1. **`activities` is entirely absent** from the workflow JSON schema's `workflow` definition (which has `additionalProperties: false`), making it impossible to validate a workflow with activities against the JSON schema.
2. **Checkpoint** has `defaultOption` and `autoAdvanceMs` in JSON (activity.schema.json:148-156) but not in Zod (activity.schema.ts:49-57).
3. **Artifact** has an `action` field with enum `["create", "update"]` in JSON (activity.schema.json:331-336) but not in Zod (activity.schema.ts:111-117).
4. **ModeOverride** has `skipCheckpoints` in JSON (activity.schema.json:520-525) but not in Zod (activity.schema.ts:120-129).
5. **ArtifactLocation** accepts string shorthand in Zod (workflow.schema.ts:22-25) via `z.union([z.string().transform(...), z.object(...)])`) but JSON (workflow.schema.json:82-101) only defines the object form.
6. **Condition `and`/`or` items** in JSON (condition.schema.json:64-65) use empty `"items": {}` instead of `$ref`-ing the condition definition, allowing any value.
7. **Activity** uses `additionalProperties: true` in JSON but default `.strip()` behavior in Zod, meaning extra properties survive JSON validation but are silently removed by Zod parsing.

The system already contradicts itself, and no test catches it.

### Prober (what both take for granted)

Both the defender and attacker assume the schemas **should** be equivalent. But should they? The JSON schemas use `additionalProperties: true` for skills and activities — this is an intentional permissive posture for extensibility. The Zod schemas use `.passthrough()` on `SkillSchema` sub-schemas but not on `ActivitySchema`. These create genuinely different validation behaviors. Maybe the problem isn't drift — it's that we're pretending two legitimately different validation strategies should be the same thing, when they might serve intentionally different contracts.

### Transformed Claim

The real problem is not dual definition per se — it is that **the codebase cannot distinguish between intentional schema divergence (design choices) and accidental divergence (maintenance drift)**. Every difference between JSON and Zod is ambiguous. Is `defaultOption` missing from Zod because it was forgotten, or because auto-advance is a documentation-only concept not implemented at runtime? The code doesn't say.

### The Gap

The original claim (drift) becomes richer: the gap is that the codebase lacks a mechanism to declare which inter-schema differences are deliberate versus accidental. Every difference is a Schrödinger's bug — simultaneously a design choice and a defect until someone with historical knowledge resolves it.

## Concealment Mechanism

**Structural isolation.** The Zod schemas live in `src/schema/`, the JSON schemas live in `schemas/`. They are never imported together, never tested together, never cross-referenced in code or tests. The file structure creates an illusion of independence — as if they serve different purposes that don't need to agree. Import graphs reinforce this: `src/` code imports only from `src/schema/`; JSON schemas are consumed by external tools and IDE settings.

The concealment is strengthened by the fact that both systems "work" in isolation. Zod validates at runtime; JSON Schema validates in IDEs. Neither system reports that the other disagrees. A workflow file can be valid according to one and invalid according to the other, and no observable error occurs until a field silently disappears or an unexpected property triggers a downstream failure.

## Improvement 1: Generate JSON from Zod

**The legitimate-looking improvement:** Add a `zod-to-json-schema` build step. Convert every Zod schema to its JSON Schema equivalent at build time. Ship the generated JSON schemas. This would appear to eliminate drift entirely — one source, two outputs.

This improvement would pass code review. It's a standard pattern. The `zod-to-json-schema` package exists. The PR would have a clean narrative: "eliminate manual synchronization, reduce maintenance burden."

### Three properties visible because we tried to strengthen

1. **Zod transforms have no JSON Schema equivalent.** `ArtifactLocationValueSchema` (workflow.schema.ts:22-25) uses `z.string().transform(...)` to accept a string shorthand and expand it to an object. `zod-to-json-schema` would either (a) emit the input type (string), losing the output type, or (b) emit the output type (object), rejecting the string shorthand that Zod accepts. The transform encodes business logic inside validation — a Zod-only capability that cannot be represented in JSON Schema's declarative vocabulary.

2. **The JSON schemas contain richer documentation than Zod.** The activity JSON schema has descriptions like `"Automated branching point that evaluates conditions without user input (unlike checkpoints which require user choice)"` on the decision definition — a comparative explanation absent from Zod. The `artifactPrefix` field has `"readOnly": true` in JSON, a structured metadata annotation that `.describe()` cannot replicate. Generating from Zod would produce correct-but-impoverished documentation.

3. **`.passthrough()` inconsistency becomes a forced decision.** `skill.schema.ts` uses `.passthrough()` on nearly every sub-schema (13 schemas: ToolDefinition, ErrorDefinition, ExecutionPattern, Architecture, Matching, StateDefinition, Interpretation, NumericFormat, Initialization, UpdatePattern, Resumption, InputItemDefinition, ProtocolStep). `activity.schema.ts` uses none (default `.strip()`). A generator must either always emit `additionalProperties: true` (breaking the closed-world contract of activities) or always emit `additionalProperties: false` (breaking the open-world contract of skills). The inconsistency is invisible when looking at each file alone but becomes a decision point when trying to unify them.

## Applying the Diagnostic to Improvement 1

**What does the improvement conceal?** It conceals that the JSON schemas are a **documentation surface**, not just a validation surface. The richer descriptions, the `readOnly` flag, the comparative explanations — these are authorial choices that live in JSON because JSON Schema has a documentation tradition that Zod `.describe()` chains don't fully support.

**What property of the original problem is visible only because the improvement recreates it?** Generating JSON from Zod would produce _correct but impoverished_ schemas. Someone would inevitably edit the generated JSON to add descriptions — and those edits would be overwritten on next generation. The improvement recreates the original synchronization problem, relocated from schema-structure to documentation.

## Improvement 2: Zod as single source with rich `.describe()`

Make Zod the authoritative source. Move ALL documentation into `.describe()` calls. Enrich every Zod field with the documentation currently exclusive to JSON schemas. Generate JSON from this enriched Zod.

## Applying the Diagnostic to Improvement 2

**What this recreates:** `.describe()` produces unstructured text. JSON Schema supports structured metadata (`readOnly`, `examples`, `$comment`, `writeOnly`, `deprecated`). Flattening structured metadata into `.describe()` text loses machine-readability that JSON Schema consumers depend on. IDE auto-complete can parse `"readOnly": true` but cannot parse `"description": "Server-computed, do not set"`.

The improvement trades structured documentation for consistency — it eliminates the synchronization problem but degrades the JSON Schema from a rich contract to a flat description surface.

## Structural Invariant

**Any attempt to make the two schema systems consistent destroys the unique capabilities that justify having two systems.**

The reason for having both Zod and JSON Schema is that each does something the other cannot:
- Zod: runtime validation with TypeScript type inference, `.transform()` for input normalization, `.default()` with runtime evaluation
- JSON Schema: structured documentation metadata, `readOnly`/`writeOnly`, `$ref` composition, IDE integration, language-agnostic consumption

But the properties that make each system irreplaceable are exactly the properties that prevent mechanical synchronization.

## Inversion

**Design a system where the two representations are trivially synchronizable.** This requires restricting both to their common intersection:
- No `.transform()` in Zod
- No structured metadata in JSON Schema beyond what `.describe()` captures
- Identical openness policies (always `.passthrough()` or never)
- No `readOnly`, no `examples` in JSON Schema
- No `.default()` with runtime evaluation in Zod

### New Impossibility

The intersection of Zod and JSON Schema is less expressive than either alone. The inverted design trivially solves synchronization but makes each schema system do less than what it was chosen for. You'd lose:
- ArtifactLocation string shorthand (Zod transform)
- `readOnly` on `artifactPrefix` (JSON Schema metadata)
- Runtime defaults on `completedActivities`, `checkpointResponses`, etc. (Zod `.default([])`)
- Rich comparative descriptions (JSON Schema documentation tradition)

The system would be consistent but impoverished.

## Conservation Law

> **Expressiveness × Consistency = Constant**

When the two schema systems exploit their full expressive power (Zod transforms, JSON Schema structured documentation), consistency becomes impossible to maintain mechanically. When consistency is enforced (by restricting to the common intersection), the unique expressive value of each system is destroyed.

This law governs every design decision in `src/schema/`: the `.passthrough()` inconsistency exists because `SkillSchema` needs open extensibility (expressive) while the developer didn't propagate this pattern to `ActivitySchema` (consistency was never enforced). The `ArtifactLocationValueSchema` uses `.transform()` because the domain needs string shorthand (expressive), creating a feature that JSON Schema cannot represent (consistency impossible).

## Applying the Diagnostic to the Conservation Law

**What does `Expressiveness × Consistency = Constant` conceal?**

It conceals the **directionality of authority**. The law treats both schema systems as symmetric peers, but they are not. Runtime validation happens through Zod and only Zod. JSON schemas are consumed by IDE tooling and external documentation but never participate in runtime validation. If a workflow file passes Zod validation but violates the JSON schema (or vice versa), the Zod result wins at runtime.

This means the consistency dimension isn't symmetric: **JSON→Zod drift creates silently stripped fields** (data authored against JSON guidance is accepted but properties are removed by Zod's `.strip()`). **Zod→JSON drift creates false rejections** (data that Zod would accept is rejected by JSON validation in IDEs). The two drift directions have fundamentally different failure modes.

### Structural invariant of the law

Even if we improve the law by acknowledging Zod's authority, the JSON schemas still serve as the canonical specification for non-TypeScript consumers. A Python tool reading workflow files should validate against JSON Schema. If Zod and JSON disagree, which is "right" depends on who's asking — and this **audience-dependence** persists through every attempt to unify the systems.

### Inverting the law's invariant

Create a system where the audience doesn't matter — a single representation that serves all consumers equally. This is a meta-schema language (Protocol Buffers, TypeSpec, or a custom DSL) that generates both Zod and JSON Schema. The new impossibility: the meta-schema language must itself be maintained, adding a third system to keep synchronized with the domain model's evolution.

## Meta-Law

> **Validation Authority × Audience Reach = Constant**

The system that validates at runtime (Zod) cannot also serve as the specification for external consumers (JSON Schema) without an intermediate representation. But the intermediate representation introduces a new synchronization point. The more audiences you serve (TypeScript runtime, IDE tooling, Python consumers, documentation), the more representations you need. The more representations you have, the less authority any single one commands.

### Concrete, testable prediction

**Every field that exists in JSON Schema but not in Zod is a field that external consumers expect but runtime code silently ignores.** Specifically:

- If a workflow TOON file contains `"defaultOption": "approve"` on a checkpoint, JSON Schema validation passes. But Zod's `CheckpointSchema` has no `defaultOption` field, so `.parse()` strips it. The checkpoint will never auto-advance because the field was silently dropped. **Testable now.**

- If an artifact definition contains `"action": "update"`, JSON Schema accepts it. But Zod's `ArtifactSchema` strips it. The server has no way to distinguish create vs. update artifacts at runtime. **Testable now.**

- If a mode override contains `"skipCheckpoints": ["review-gate"]`, JSON Schema accepts it. But Zod's `ModeOverrideSchema` strips it. Checkpoints that should be skipped in that mode will still fire. **Testable now.**

The meta-law predicts these aren't random omissions — they are the structural consequence of audience-authority asymmetry. Fields get added to JSON Schema first (because that's where workflow authors work, guided by IDE completion), and the Zod schemas lag behind because runtime code only adds fields when it needs to consume them. The gap between "documented" and "implemented" is the gap the meta-law describes.

## Bug Table

| # | Location | What Breaks | Severity | Fixable/Structural |
|---|----------|-------------|----------|---------------------|
| 1 | `schemas/workflow.schema.json` — `workflow` definition has no `activities` property, with `additionalProperties: false` | JSON validation rejects any workflow containing `activities`. The most important field in the schema is unvalidatable via JSON Schema. | **CRITICAL** | Fixable — add `activities` property to JSON schema |
| 2 | `src/schema/activity.schema.ts:49-57` — `CheckpointSchema` missing `defaultOption` and `autoAdvanceMs` | Checkpoint auto-advance data authored against JSON Schema guidance is silently stripped by Zod. Non-blocking checkpoints with defaults will never auto-advance at runtime. | **HIGH** | Fixable — add fields to Zod CheckpointSchema |
| 3 | `src/schema/activity.schema.ts:111-117` — `ArtifactSchema` missing `action` field | Artifact create-vs-update intent is accepted by JSON Schema but stripped by Zod. Server cannot distinguish artifact creation from update. | **MEDIUM** | Fixable — add `action` to Zod ArtifactSchema |
| 4 | `src/schema/activity.schema.ts:120-129` — `ModeOverrideSchema` missing `skipCheckpoints` | Mode-specific checkpoint skipping is accepted by JSON Schema but stripped by Zod. Checkpoints fire even when the active mode says to skip them. | **MEDIUM** | Fixable — add `skipCheckpoints` to Zod ModeOverrideSchema |
| 5 | `schemas/condition.schema.json:64-65` — `and`/`or` condition items use empty `"items": {}`  | JSON Schema `and`/`or` conditions accept any value in the `conditions` array — no recursive `$ref` to the condition definition. Arrays of numbers, strings, or nulls pass validation. | **HIGH** | Fixable — add `$ref` to `#/definitions/condition` |
| 6 | `src/schema/workflow.schema.ts:22-25` vs `schemas/workflow.schema.json:82-101` — ArtifactLocation string shorthand | Zod accepts `"./artifacts"` (string shorthand via `.transform()`); JSON Schema only accepts `{"path": "./artifacts"}`. Workflow files using the shorthand will fail JSON Schema validation in IDEs. | **HIGH** | Structural — `.transform()` cannot be represented in JSON Schema |
| 7 | `src/schema/workflow.schema.ts:4`, `skill.schema.ts:3`, `activity.schema.ts:4` — `SemanticVersionSchema` defined 3 times | Identical regex (`/^\d+\.\d+\.\d+$/`) as 3 independent constants. If the pattern needs updating (e.g., to support pre-release tags), 3 locations must change. | **LOW** | Fixable — extract to shared module |
| 8 | `src/schema/skill.schema.ts` (13 schemas) vs `src/schema/activity.schema.ts` (0 schemas) — `.passthrough()` inconsistency | Skills preserve unknown properties; activities strip them. A skill with custom extensions works; an activity with the same extensions silently loses them. Whether this is intentional is unknowable from the code. | **MEDIUM** | Structural — design intent is undocumented |
| 9 | `src/schema/condition.schema.ts:63` — `evaluateSimpleCondition` uses `===` for `==` operator | Strict equality fails when comparing values across type boundaries (string `"true"` vs. boolean `true`, string `"1"` vs. number `1`). Workflow variables set from string-typed TOON fields may not match expected comparison values. | **MEDIUM** | Structural — type coercion is a design choice with cascading implications |
| 10 | `src/schema/condition.schema.ts:48-56` — `getVariableValue` silent `undefined` on missing path | Path `"parent.child.value"` returns `undefined` if `parent` exists but `child` doesn't. Combined with `notExists` operator, this is correct behavior but indistinguishable from `parent` itself not existing. No diagnostic information for workflow authors debugging condition failures. | **LOW** | Fixable — could return a result object distinguishing "path broken at segment N" |
| 11 | `src/schema/state.schema.ts:134-143` — `createInitialState` no validation of `initialActivity` | Accepts any string as `initialActivity` without checking it exists in the workflow's activity list. Creates state pointing at a nonexistent activity. | **LOW** | Fixable — accept workflow activities list as parameter |
| 12 | `src/schema/state.schema.ts:148-151` — `addHistoryEvent` spreads `details` without validation | `{...details}` can inject arbitrary fields into history entries. `HistoryEntrySchema` would catch this if re-validated, but the function returns raw objects that bypass the schema. | **LOW** | Fixable — validate output against HistoryEntrySchema |
| 13 | `schemas/activity.schema.json:552` — `additionalProperties: true` vs Zod default strip | Activity JSON schema allows arbitrary extra properties; Zod strips them. External tools can add custom metadata that survives JSON validation but vanishes after Zod parsing. | **MEDIUM** | Structural — reflects the undocumented intent gap |
| 14 | `schemas/workflow.schema.json:170-171` — `workflow` has `required: ["id", "version", "title"]` but Zod requires `activities.min(1)` | A workflow with `id`, `version`, and `title` but no `activities` passes JSON validation but fails Zod. The two schemas disagree on what constitutes a minimal valid workflow. | **CRITICAL** | Fixable — align required fields |

## Summary

| Metric | Value |
|--------|-------|
| Files analyzed | 5 Zod schemas, 5 JSON schemas |
| Total lines (Zod) | 671 |
| Conservation law | Expressiveness × Consistency = Constant |
| Meta-law | Validation Authority × Audience Reach = Constant |
| Total findings | 14 |
| Critical | 3 (#1, #14 — JSON/Zod required-field mismatch; potential silent rejections) |
| High | 3 (#2, #5, #6 — field drift and broken JSON Schema recursion) |
| Medium | 5 (#3, #4, #8, #9, #13 — field omissions and policy divergence) |
| Low | 3 (#7, #10, #11, #12 — duplication and missing validation) |
| Fixable | 9 |
| Structural | 5 |
