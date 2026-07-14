# Codebase Comprehension

> Audience Attribute on Technique Output Declarations · codebase-comprehension · 2026-07-14

The durable, cumulative comprehension of the technique-output/artifact pipeline lives in the persistent knowledge base: **[technique-output-audience-pipeline.md](../../comprehension/technique-output-audience-pipeline.md)** (with prism lens artifacts [pedagogy](../../comprehension/portfolio-audience-pipeline-pedagogy.md) / [rejected-paths](../../comprehension/portfolio-audience-pipeline-rejected-paths.md) / [synthesis](../../comprehension/portfolio-audience-pipeline-synthesis.md)). This planning note is the work-package-local index of the extension points the plan/implement activities act on.

## The six V4 surfaces — verified extension points

| # | V4 surface | File · symbol | Change shape |
|---|-----------|---------------|--------------|
| 1 | Parsing | `src/loaders/markdown-technique-loader.ts` · `parseOutputsSection` (L379) / `parseEntrySubsections` (L296); widen `IndexParse['outputs']` (L244) | Recognize `#### audience` as an output reserved sub-section → `output.audience` (generalize the single `reserved` param) |
| 2 | Schema | `src/schema/technique.schema.ts` · `OutputItemDefinitionSchema` (L52) | Add `audience: z.enum(['human','agent']).optional()`; hand-edit the pair `schemas/technique.schema.json` (NOT generated) |
| 3 | Projection | `src/loaders/technique-loader.ts` · `projectTechnique` (L33) / `projectTechniqueBody` (L198) / `composeLoaded` (L499) | **No change** — outputs emitted opaquely; `audience` rides through |
| 4 | get_activity artifacts contract | `src/tools/workflow-tools.ts` · `composeActivityArtifacts` (L74); surfaces at body block (L752/L818) + `_meta.artifacts` (L820) | Return `{id,name,audience?}`; read `o.audience` (L104-107). Not a schema field (activity.schema.ts L270) |
| 5 | JSON / artifactPrefix conventions | `docs/technique-protocol-specification.md` §3.2 (beside `#### artifact`); optionally `docs/artifact_management_model.md` | Document `audience` attribute + the "agent ⇒ JSON on disk" file-format convention. No wire-serialization code change (wire is YAML) |
| 6 | Corpus lint | `scripts/check-binding-fidelity.ts` (`OutputMeta`, already parses `hasArtifact`) **or** new `scripts/check-audience.ts` | Value check (`human`\|`agent`); a corpus-flagging check needs a `*-baseline.json` regen |

## Key coupling and risk facts

- **Parser + schema are hard-coupled** because `TechniqueSchema` is `.strict()` (L95): an emitted-but-undeclared key fails `safeValidateTechnique`, dropping the technique to `null` with a logged warning. Change surfaces 1 and 2 together.
- **Projection (surface 3) is transparent** — the reassuring finding. Compose/merge (`mergeById`, whole-object) and both projections emit outputs opaquely, so `audience` reaches the worker with zero projection code. `inherited_outputs` also carries it for free (`InheritedOutputsSchema` wraps the item schema).
- **Blast radius (GitNexus):** `OutputItemDefinitionSchema` = LOW (0 upstream). `composeActivityArtifacts` = high *centrality* (every get_activity) but additive-safe: existing readers take `id`/`name` and ignore a new optional field. Corroborates the design-philosophy moderate/additive classification ([DP-2](01-assumptions-log.md)).
- **JSON Schema asymmetry:** `schemas/technique.schema.json` is hand-maintained (not emitted by `generate-schemas.ts`); it must be edited by hand alongside the Zod change.

## Precedent (additive protocol/schema evolution)

`destination`/`source`/`provenance_note` (delivery-only optional fields), `inherited_inputs`/`inherited_outputs` (#166 B2), and `bundleTechniques` (#166 B11, ship-enabler-adopt-later) all threaded new optional technique/output fields additively. Recipe: declare optional on the Zod item schema → parser emits it → projection carries it opaquely → new consumers read defensively. `audience` adds one step: a documented enum + a corpus lint value-check.

## Open items for downstream activities

Two design forks are left for plan-prepare (recorded in the [synthesis](../../comprehension/portfolio-audience-pipeline-synthesis.md), not decided here): entry-level vs. artifact-nested placement (recommendation: entry-level); and extend-`check-binding-fidelity` vs. standalone `check-audience.ts` for the lint. Whether an agent-audience output must carry an `#### artifact` filename is a semantic-invariant decision for plan-prepare. Corpus adoption of `audience` is out of scope for this PR.

No open questions block progression — comprehension is sufficient for plan-prepare.
