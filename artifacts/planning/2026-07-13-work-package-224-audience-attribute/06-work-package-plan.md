# Audience Attribute on Technique Output Declarations - Implementation Plan

> plan · MEDIUM · Ready · 2-4h agentic + 0.5-1h review · 2026-07-14

## Overview

### Problem & Scope
Problem, scope, and success criteria: [design philosophy](02-design-philosophy.md) (elicitation skipped — design-philosophy is the canonical statement home for this path). Do not restate them here.

## Inputs

- [Codebase Comprehension](15-codebase-comprehension.md#the-six-v4-surfaces--verified-extension-points) — pinned each of the six surfaces to exact symbols and line ranges; the task substrate below is grounded on it.
- [Comprehension artifact](../../comprehension/technique-output-audience-pipeline.md) — persistent pipeline + coupling knowledge (schema/parser co-change, hand-maintained JSON schema, projection opacity).

## Proposed Approach

### Solution Design
Add an optional `audience` enum (`human | agent`) to technique **output / `#### artifact` declarations**, threaded end-to-end and additively so declarations without `audience` stay valid. The field follows the exact precedent of the existing additive output fields (`destination`, `action`) and the earlier additive protocol extensions (`inherited_*` #166 B2, `bundleTechniques` #166 B11): one new optional property on `OutputItemDefinitionSchema`, a matching hand-edit to the JSON schema, a loader reserved-key parse, and carry-through on the delivery surfaces.

The parse mechanism reuses the loader's existing `#### <reserved>` sub-section convention. `audience` becomes an output-level reserved key alongside `artifact`, so `parseEntrySubsections` recognizes it and `parseOutputsSection` lands it on the output entry — no new parsing grammar.

Projection needs no edit: `projectTechnique` treats outputs as opaque objects, so `audience` carries through free. This is verified-by-test rather than changed (Task 5).

The corpus lint is a **standalone** `scripts/check-audience.ts`, not an extension of `check-binding-fidelity.ts`. Binding-fidelity's concern is input/output binding conformance; it treats `#### artifact` as opaque presence and never inspects artifact metadata. The audience concern — every agent-audience output declares a JSON-format artifact name per the `artifactPrefix` convention — is a distinct concern, so the one-guard-per-concern pattern puts it in its own script. (Enum *validity* is already enforced by Zod `.strict()` at load; the guard checks the JSON-format *convention*, which the schema cannot express.)

### Alternatives Considered
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Optional `audience` enum on output item (this plan) | Additive, backward-compatible, mirrors `destination`/`action` precedent | None material | **Selected** |
| Extend `check-binding-fidelity.ts` for the audience convention | One fewer file | Mixes two concerns; breaks one-guard-per-concern; muddies its baseline | Rejected |
| Auto-generate `technique.schema.json` from Zod | Removes hand-maintenance | Out of scope — `technique` is deliberately not in `generate-schemas.ts`; a separate refactor | Rejected |
| Free-form `audience` string (no enum) | Fewer schema edits | Loses validation; downstream JSON-convention lint has no closed set to check | Rejected |

### Assumptions
Assumptions underlying the approach: [assumptions log](01-assumptions-log.md). Do not restate them here.

## Implementation Tasks

### Task 1: Schema + JSON schema — add the `audience` enum
**Goal:** Declare the optional `audience` field on the output item, in both the Zod schema and the hand-maintained JSON schema, keeping them in lockstep.
**Deliverables:**
- `src/schema/technique.schema.ts` — add `audience: z.enum(['human','agent']).optional()` to `OutputItemDefinitionSchema` (~L52-58), beside `destination`. `TechniqueSchema` is `.strict()`, so this must land before the loader can pass an `audience`-bearing object.
- `schemas/technique.schema.json` — hand-add the matching `audience` enum to `definitions.outputItemDefinition.properties` (~L65-77); `technique` is NOT emitted by `generate-schemas.ts`, so it is edited by hand.

### Task 2: Loader — parse `audience` as an output reserved key
**Goal:** The markdown loader reads `#### audience` on an output entry into `output.audience`.
**Deliverables:**
- `src/loaders/markdown-technique-loader.ts` — teach `parseEntrySubsections` (~L296) to recognize `audience` as an output-level reserved sub-section, and `parseOutputsSection` (~L379) to land it on the entry; widen the inline `IndexParse['outputs']` element type (~L244) to carry `audience?: 'human' | 'agent'`.

### Task 3: get_activity artifacts contract — carry `audience` through
**Goal:** The synthesized activity artifact contract surfaces each artifact's `audience` on both delivery surfaces.
**Deliverables:**
- `src/tools/workflow-tools.ts` — `composeActivityArtifacts` (~L74) carries `audience` into the emitted entry (~L104-107) and widens its return type to `Array<{ id: string; name: string; audience?: 'human' | 'agent' }>`; the value flows unchanged into the body-appended `{artifacts}` block (~L752) and `_meta.artifacts` (~L820).

### Task 4: Protocol spec — document `audience`, the agent-JSON convention, and authoring guidance
**Goal:** The protocol spec is the authoring reference for the new attribute — both its mechanism and the judgment for using it.
**Deliverables:**
- `docs/technique-protocol-specification.md` — in §3.2 (~L64-96, beside the `#### artifact` bullet) document the `#### audience` attribute (`human | agent`, optional, human-default-when-absent) and the on-disk convention that `agent`-audience artifacts are serialized as JSON under the `artifactPrefix` rule.
- A short **authoring-guidance subsection** in the same §3.2 giving human-vs-agent decision criteria and anti-patterns, so the attribute ships with judgment, not just mechanism. It states the decision test (`agent` = an artifact written only for the next agent to consume as state — ID-bearing tables, routing/reconciliation/index state; `human` = an artifact a person reads linearly — design write-ups, summaries, READMEs; absent ⇒ `human`), the per-side anti-patterns (`agent`: no prose narrative, no restating other artifacts — reference by ID/link, keep it structured JSON; `human`: keep the existing state-once / single-source-and-link / exception-only reporting rules; cross-cutting: don't serialize agent state as prose, don't dress a human document up as a data dump), and an explicit out-of-scope note that per-artifact JSON field schemas for specific agent artifacts (assumptions-log, findings-classification, etc.) belong to V5, not this PR.

### Task 5: Projection carry-through — regression coverage (no source edit)
**Goal:** Confirm `projectTechnique` passes `audience` through opaquely; lock it with a test rather than editing projection code.
**Deliverables:**
- `test/loaders/technique-loader.*` (existing projection test file) — a case asserting an `audience`-bearing output survives `projectTechnique` / `projectTechniqueToYaml` unchanged. No change to `src/loaders/technique-loader.ts`.

### Task 6: Corpus lint — standalone `check-audience.ts`
**Goal:** A corpus guard validates the audience JSON-format convention across the workflows corpus.
**Deliverables:**
- `scripts/check-audience.ts` — walks corpus technique `.md` files via the loader; for every output with `audience: agent` carrying an `#### artifact`, asserts the artifact name follows the JSON-format convention; baseline-snapshotted like the sibling guards. Wire into the workflow-design validation step / CI alongside the other `check-*` scripts.

### Task 7: Tests — parser, schema, and contract carry-through
**Goal:** Behavioural coverage for the new field across the surfaces it touches.
**Deliverables:**
- `test/loaders/markdown-technique-loader.*` — audience present (`human`/`agent`), audience absent (still valid), and (via schema) invalid value rejected under `.strict()`.
- `test/schema/technique.schema.*` — valid enum accepted; bad value rejected.
- `test/tools/workflow-tools.*` (or the `composeActivityArtifacts` test home) — `audience` carried through into the composed artifacts contract and `_meta.artifacts`.

## Success Criteria

Success criteria: [design philosophy](02-design-philosophy.md#success-criteria). No task-level acceptance items exist outside that table.

## Testing Strategy

Test cases and acceptance matrix: [test plan](test-plan.md). No ordering or fixture constraints beyond what the test plan carries.

## Dependencies & Risks

### Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Zod `.strict()` rejects `audience` before the schema is updated, breaking every technique load | HIGH | LOW | Task 1 (schema) is the leaf and lands before Task 2 (loader emits the field); ordering enforces it. |
| Zod and hand-maintained JSON schema drift | MEDIUM | LOW | Both edited in the same task (Task 1); test asserts both accept/reject the same values. |
| `composeActivityArtifacts` return-type widening breaks a `{id,name}` consumer | LOW | LOW | Field is optional and additive; existing consumers ignore the extra key. Task 3 checks callers. |

**Status:** Ready for implementation
