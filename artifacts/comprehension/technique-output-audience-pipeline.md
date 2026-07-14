# Technique Output / Artifact Declaration Pipeline — Comprehension Artifact

> **Last updated**: 2026-07-14
> **Work package**: [Audience Attribute on Technique Output Declarations (#224 / PR #227)](../planning/2026-07-13-work-package-224-audience-attribute/README.md)
> **Coverage**: End-to-end flow of a technique/activity `## Outputs` entry and its `#### artifact` metadata — markdown parsing, Zod schema/validation, delivery projection (get_technique / get_activity), the synthesized `get_activity` artifacts contract, the artifactPrefix / artifact-location conventions, and the corpus lint scripts. Scoped to the surfaces an additive `audience` (`human | agent`) attribute must thread through.
> **Related artifacts**: [workflow-server-schemas.md](workflow-server-schemas.md) (schema system, field-propagation lifecycle, additionalProperties policy), [zod-schemas.md](zod-schemas.md), [json-schemas.md](json-schemas.md), [delivery-ledger.md](delivery-ledger.md)

## 1. The Pipeline at a Glance

An output declaration is authored as a `### <output-id>` entry under `## Outputs` in a technique markdown file, with an optional `#### artifact` sub-section naming the persistence filename. It flows through six transformation points before a worker reads it:

```
1. PARSE      markdown-technique-loader.ts  → parseOutputsSection / parseEntrySubsections
              #### artifact → output.artifact.{name}; other #### → output.components[k]
2. VALIDATE   technique.schema.ts           → OutputItemDefinitionSchema (inside .strict() TechniqueSchema)
3. COMPOSE    technique-loader.ts           → composeLoaded: merge own/inherited outputs (ancestor contract)
4. PROJECT    technique-loader.ts           → projectTechnique / projectTechniqueBody (wire shape)
5a. get_technique  resource-tools.ts        → projectTechniqueToYaml (single technique)
5b. get_activity   workflow-tools.ts        → step_techniques bundle (projectTechnique per bundled step)
6. ARTIFACTS  workflow-tools.ts             → composeActivityArtifacts: {id,name}[] synthesized from
              step techniques' output.artifact.name, deduped; appended to body + emitted in _meta
```

The **canonical spec** for the authoring form is `docs/technique-protocol-specification.md` §3 / §3.2. The **corpus lint** guards are under `scripts/` (`check-technique-template.ts`, `check-binding-fidelity.ts`, `check-all-refs.ts`).

This is the module the design-philosophy classified as a *broad-but-shallow* fan-out: no single high-blast-radius hotspot, each surface additive and independently well-understood.

## 2. Surface-by-Surface Data Model and Transformation

### 2.1 Parsing — `src/loaders/markdown-technique-loader.ts`

The markdown parser is a small hand-written YAML-frontmatter + heading-section reader; it does not use a full markdown library.

- **`parseFrontmatter`** ([L63](../../../src/loaders/markdown-technique-loader.ts#L63)) reads only `metadata.version` — top-level scalars and one level of nesting under `metadata:`. Identity comes from the file path, not frontmatter. `audience` is **not** a frontmatter concern; it belongs on the per-output entry, so this function is untouched.
- **`parseOutputsSection`** ([L379](../../../src/loaders/markdown-technique-loader.ts#L379)) splits `## Outputs` into `### <id>` entries (level-3 `splitSections`) and builds each output object `{ id, description?, artifact?, components? }`.
- **`parseEntrySubsections`** ([L296](../../../src/loaders/markdown-technique-loader.ts#L296)) is the shared engine for both inputs and outputs. It separates an entry's lead description from its `####` sub-sections. A `reserved` sub-section (`'artifact'` for outputs, `'default'` for inputs) is lifted out as entry metadata; every **other** `####` becomes a member of `components`. The reserved value is the sub-section body with surrounding backticks stripped ([L312](../../../src/loaders/markdown-technique-loader.ts#L312)).
- **`IndexParse['outputs']`** type ([L244](../../../src/loaders/markdown-technique-loader.ts#L244)) hard-codes the output shape `{ id; description?; artifact?: { name: string }; components? }`. This inline type must be widened for a new field.

**Extension point for `audience`.** Two shapes are structurally available:
- *(a) An entry-level reserved sub-section* — treat `#### audience` like `#### artifact`/`#### default`. `parseEntrySubsections` already supports exactly one `reserved` key per call; adding a second reserved key means either a second call/parameter or accepting a set of reserved keys. Result lands as `output.audience`.
- *(b) A nested field under artifact* — `#### artifact` body carries `human`/`agent` alongside the filename. This overloads a single sub-section body (currently a bare filename) and is more awkward to parse.

Shape (a) is the cleaner fit: it mirrors the existing `#### default`/`#### artifact` reserved-metadata idiom and keeps `audience` a first-class output attribute (an agent-audience output need not always carry an `#### artifact` filename). The `parseEntrySubsections` `reserved` parameter is the single choke-point to generalize (e.g. accept `reserved: string[]` or add `'audience'` as a recognized output-only reserved key).

**Backward compatibility.** An absent `#### audience` yields `output.audience === undefined` — no change to existing entries.

### 2.2 Schema / Validation — `src/schema/technique.schema.ts`

- **`OutputItemDefinitionSchema`** ([L52](../../../src/schema/technique.schema.ts#L52)): `{ id, description?, components?, artifact?, destination? }`. This is the single canonical place to add `audience: z.enum(['human','agent']).optional()`. Because the field is optional, it is a **safe addition** per the field-propagation lifecycle (see [workflow-server-schemas.md §2.3](workflow-server-schemas.md)): existing entries validate unchanged.
- **`OutputArtifactSchema`** ([L46](../../../src/schema/technique.schema.ts#L46)): `{ name, action? }` — the alternate placement if `audience` is scoped to persisted artifacts only. Adding it here would make `audience` meaningless for artifact-less outputs, so entry-level placement (on `OutputItemDefinitionSchema`) is preferred and matches shape (a) above.
- **`TechniqueSchema` is `.strict()`** ([L95](../../../src/schema/technique.schema.ts#L95)). Consequence: the parser (§2.1) and the schema **must change together** — a value the parser emits that the schema does not declare is rejected outright (`safeValidateTechnique` fails, technique drops to `null` with a logged warning, see [buildTechnique L465](../../../src/loaders/markdown-technique-loader.ts#L465)). This is the tightest coupling in the change.
- **`InheritedOutputsSchema`** ([L75](../../../src/schema/technique.schema.ts#L75)) wraps `OutputsDefinitionSchema` (an array of `OutputItemDefinitionSchema`). So `audience` rides through the `inherited_outputs` block automatically once declared on the item schema — no separate change for inherited/contract outputs.

**JSON Schema pair.** `schemas/technique.schema.json` is **hand-maintained** — it is NOT emitted by `scripts/generate-schemas.ts` ([the generator emits only workflow/state/condition/session-file/activity](../../../scripts/generate-schemas.ts#L25)). So the JSON counterpart must be edited by hand to keep the pair in lockstep (add `audience` to the `OutputItemDefinition` `properties` + `enum`). This is a known asymmetry flagged in [workflow-server-schemas.md §1.2](workflow-server-schemas.md).

### 2.3 Composition — `src/loaders/technique-loader.ts::composeLoaded`

- **`composeLoaded`** ([L499](../../../src/loaders/technique-loader.ts#L499)) merges a technique's own outputs with ancestor-contract outputs via **`mergeById`** ([L412](../../../src/loaders/technique-loader.ts#L412)) — a whole-object union keyed by `id`, child overriding parent. Output objects (including any `audience`/`artifact` sub-fields) are carried **wholesale**; there is no field-level allowlist, so `audience` survives the merge with zero code change.
- The partition into own `outputs` vs `inherited_outputs` ([L545-546](../../../src/loaders/technique-loader.ts#L545)) filters by `id` membership only — again object-transparent.
- After composition, `safeValidateTechnique(composed)` re-validates ([L556](../../../src/loaders/technique-loader.ts#L556)); the `.strict()` schema must therefore already declare `audience` (ties back to §2.2).

Composition is used by BOTH `composeTechnique` (get_technique path) and `resolveTechniques` (bundle path) — a single shared implementation, so the two delivery paths cannot drift on `audience`.

### 2.4 Delivery Projection — `src/loaders/technique-loader.ts`

Two projection functions, both **field-transparent** for a new output sub-field:

- **`projectTechnique`** ([L33](../../../src/loaders/technique-loader.ts#L33)): builds the ordered wire record for the get_activity `step_techniques` bundle. Emits `technique.outputs` as-is ([L43](../../../src/loaders/technique-loader.ts#L43)); a trailing catch-all loop ([L48](../../../src/loaders/technique-loader.ts#L48)) also emits any field not in the canonical ordering. The `audience` sub-field lives *inside* each output object, so it emits automatically. **No change needed.**
- **`projectTechniqueToYaml`** ([L56](../../../src/loaders/technique-loader.ts#L56)): `stringifyForResponse(projectTechnique(...))` — the get_technique raw projection. Serializes via the `yaml` library ([src/utils/serialization.ts](../../../src/utils/serialization.ts)). **No change needed** — `audience` serializes as an ordinary object key.
- **`projectTechniqueBody`** ([L198](../../../src/loaders/technique-loader.ts#L198)): the bundle-body projection used by `resolveTechniques` for activity/workflow technique bundles. Emits `outputs` as-is ([L204](../../../src/loaders/technique-loader.ts#L204)). **No change needed.**

The projection surfaces are the reassuring part of the change: because outputs are emitted as opaque objects, `audience` reaches the worker for free once parsing + schema retain it.

### 2.5 get_activity Artifacts Contract — `src/tools/workflow-tools.ts`

The activity's artifact contract is **not a schema field** — `activity.schema.ts` explicitly notes it is synthesized ([activity.schema.ts#L270](../../../src/schema/activity.schema.ts#L270)). It is built at delivery time from the union of the activity's step-bound techniques' output artifacts.

- **`composeActivityArtifacts`** ([L74](../../../src/tools/workflow-tools.ts#L74)) walks the activity's steps (recursing into loop bodies), resolves each step technique via `resolveTechniques`, and for every output with an `artifact.name` pushes `{ id, name }` deduped by filename ([L100-110](../../../src/tools/workflow-tools.ts#L100)). This is **the** carry-through function: to convey `audience`, its return type becomes `Array<{ id; name; audience? }>` and [L106-107](../../../src/tools/workflow-tools.ts#L106) reads `o.audience` off the projected output. The inline read-type at [L104](../../../src/tools/workflow-tools.ts#L104) (`{ id?; artifact?: { name? } }`) also widens.
- The result surfaces in **two places** in the get_activity response:
  1. Appended to the activity body as a serialized `{ artifacts: [...] }` block ([L749-754, L818](../../../src/tools/workflow-tools.ts#L749)) — the worker-visible contract. *(This is the `artifacts:` list at the tail of a get_activity payload.)*
  2. The structured `_meta.artifacts` field ([L820](../../../src/tools/workflow-tools.ts#L820)).
  Both derive from the same `composedArtifacts` value, so a single change to `composeActivityArtifacts` propagates to both.

### 2.6 artifactPrefix and JSON-Format Conventions

- **`artifactPrefix`** is a server-computed numeric prefix (`activity.schema.ts#L301`), inferred from the activity filename by the workflow loader ([workflow-loader.ts#L83](../../../src/loaders/workflow-loader.ts#L83)) and surfaced in the get_activity header + `_meta` ([workflow-tools.ts#L740-742, L820](../../../src/tools/workflow-tools.ts#L740)). The worker names a file `{artifactPrefix}-{bare_filename}`. `audience` does not touch prefix computation.
- **Artifact-location rule** (`operational-discipline-artifact-location`) is a workflow **corpus** rule, authored in `workflows/meta/techniques/agent-conduct.md`, not server source. It governs *where* an artifact lands (the planning folder at the server-resolved `planning_folder_path`), independent of *format*.
- **"JSON conventions"** here means the on-disk artifact **file format** for agent-audience artifacts — a documentation/convention deliverable, not a wire-serialization code change. Wire responses are YAML (`stringifyForResponse`), unaffected. The convention that `audience: agent` artifacts are written as JSON belongs in the protocol spec (`docs/technique-protocol-specification.md` §3.2, beside `#### artifact`) and optionally `docs/artifact_management_model.md`.

### 2.7 Corpus Lint — `scripts/`

- **`check-technique-template.ts`** ([whole file](../../../scripts/check-technique-template.ts)) is the structural template guard: enforces the canonical `## Capability/Inputs/Outputs/Protocol/Rules` section set, order, and `###`/`####` casing. `#### audience` would be a recognized reserved sub-section (like `#### artifact`), so if any casing/allowlist of `####` names is added, `audience` joins it. It is `lintTechniqueFile`-per-file, baseline-free (hard-zero).
- **`check-binding-fidelity.ts`** ([header L1-52](../../../scripts/check-binding-fidelity.ts#L1)) is the richest extension candidate for an **`audience` value check**. It already parses per-output metadata into `OutputMeta = { hasArtifact: boolean }` (its `parseSig`/signature layer) and exempts artifact-bearing outputs from the dead-output check. Adding `audience` to `OutputMeta` and a rule ("`audience` must be `human`|`agent`", or "agent-audience outputs must carry an `#### artifact`", per the eventual convention) fits the existing per-op signature-parsing structure. It carries a **`binding-fidelity-baseline.json`** snapshot; a new check that flags existing corpus entries would need a baseline regen (`--update-baseline`).
- **`check-all-refs.ts`** ([whole file](../../../scripts/check-all-refs.ts)) only resolves `techniques[]` references through the loader — not artifact/audience-aware; unlikely to change.

A **new dedicated `check-audience.ts`** is also viable and matches the one-guard-per-concern pattern already present in `scripts/` (13+ `check-*.ts` guards, several with their own `*-baseline.json`). The choice between extending `check-binding-fidelity` vs. a standalone guard is a plan-prepare decision; both fit the established structure.

## 3. Design Rationale (hypotheses for validation)

- **Optional, entry-level placement of `audience`** optimizes for backward compatibility and orthogonality: an output can be agent-audience whether or not it persists a file, and existing declarations stay valid. Trade-off: `audience` is not tied to `artifact`, so a lint rule (not the type system) enforces any "agent outputs must be JSON files" convention.
- **The `.strict()` technique schema** optimizes for loud failure on typos/drift, at the cost of forcing parser+schema co-change. This is why the change *feels* multi-surface even though most surfaces (§2.3, §2.4) are transparent.
- **Synthesizing the artifacts contract** (rather than declaring `artifacts[]` on activities, AP-43/65) optimizes for single-source-of-truth: the contract can never drift from the steps. `audience` therefore has exactly one authoring home (the technique output) and flows outward.
- **Projection transparency** (opaque object emission) is a deliberate design choice that makes additive output-field evolution cheap — the same property let `destination`/`source`/`provenance_note` and the `#166` inherited-block partitioning be threaded without touching projection.

## 4. Precedent for Additive Protocol/Schema Evolution

The codebase has repeatedly threaded new optional output/technique fields additively — strong precedent for `audience`:

- **`destination` / `source` on outputs/inputs** (`OutputItemDefinitionSchema.destination` [L57](../../../src/schema/technique.schema.ts#L57); `InputItemDefinitionSchema.source` [L9](../../../src/schema/technique.schema.ts#L9)): delivery-only fields the server populates at step-bound composition. Added as optional, carried transparently through projection.
- **`inherited_inputs` / `inherited_outputs` (#166, B2)**: composition-time partition blocks added to `TechniqueSchema` as optional; projection and the artifacts contract absorbed them without structural change (`composeLoaded` §2.3).
- **`provenance_note`** ([L88](../../../src/schema/technique.schema.ts#L88)): optional, delivery-only, ordered ahead of the interface in `projectTechnique`.
- **`bundleTechniques` hybrid bundling (#166, B11)**: an opt-in server-only field threaded through get_activity's eager-bundling budget — additive, zero corpus adoption required at ship time. Directly analogous to the "ship the enabler, adopt later" posture of this WP.

The common recipe: **declare optional on the Zod item schema → parser emits it → projection carries it opaquely → any new consumer reads it defensively (optional).** `audience` is the same recipe with the one extra step of a documented enum + a corpus lint value-check.

## 5. Domain Glossary

| Term | Technical construct |
|------|---------------------|
| Output declaration | `### <id>` entry under `## Outputs`; parsed to `OutputItemDefinition` |
| `#### artifact` | Reserved output sub-section → `output.artifact.name` (persistence filename) |
| `#### default` | Reserved input sub-section → `input.default` |
| Component | Non-reserved `####` sub-section → `components[title]` |
| Artifacts contract | Synthesized `{id,name}[]` at the get_activity tail; union of step techniques' output artifacts |
| artifactPrefix | Server-computed numeric filename prefix from the activity filename |
| audience (new) | Proposed optional `human`\|`agent` attribute on an output declaration |
| Delivery-only field | A field the server populates at composition (never authored): `source`, `destination`, `provenance_note`, `inherited_*` |

## Open Questions

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| 1 | Where does `#### artifact` become structured data, and does projection preserve arbitrary output sub-fields? | ✅ Resolved | `parseEntrySubsections` (reserved=`artifact`) → `output.artifact.name`; projection emits outputs opaquely (`projectTechnique` L43 + catch-all L48), so any sub-field survives. | §2.1, §2.4 |
| 2 | Must the parser and schema change together? | ✅ Resolved | Yes — `TechniqueSchema` is `.strict()` (L95); an undeclared emitted key fails validation and the technique drops to `null`. Tightest coupling in the change. | §2.2 |
| 3 | Is `technique.schema.json` generated or hand-maintained? | ✅ Resolved | Hand-maintained — `generate-schemas.ts` emits only workflow/state/condition/session-file/activity. The JSON pair needs a manual edit. | §2.2 |
| 4 | Where is the get_activity artifacts contract assembled and returned? | ✅ Resolved | `composeActivityArtifacts` (workflow-tools.ts L74); surfaces in the body-appended `{artifacts}` block (L752/L818) AND `_meta.artifacts` (L820). Not a schema field (activity.schema.ts L270). | §2.5 |
| 5 | Does `audience` affect wire serialization / artifactPrefix? | ✅ Resolved | No — wire is YAML via `stringifyForResponse`; artifactPrefix is filename-derived. "JSON conventions" = on-disk artifact file format, a doc/convention deliverable. | §2.6 |
| 6 | Which lint script best hosts an `audience` value check? | ✅ Resolved (choice deferred to plan) | `check-binding-fidelity.ts` already parses `OutputMeta` (hasArtifact) per op — natural host; or a standalone `check-audience.ts` matching the one-guard-per-concern pattern. A new check flagging existing corpus needs a baseline regen. | §2.7 |
| 7 | Blast radius of the schema change? | ✅ Resolved | `OutputItemDefinitionSchema`: LOW (0 upstream). `composeActivityArtifacts`: high centrality (on every get_activity) but additive-safe — callers read `id`/`name` and ignore a new optional field. | §2.5, §3 |

### Remaining follow-up items (out of scope)
- Deciding whether an agent-audience output *requires* an `#### artifact` filename (a semantic invariant a lint could enforce) — a design decision for plan-prepare, not comprehension.
- Corpus **adoption** of `audience` (RC4 verbosity-reduction) is explicitly out of scope for this PR.

---

*This artifact is part of a persistent knowledge base. It is augmented across successive work packages to build cumulative codebase understanding.*
