# Change Block Index

> feat/224-v4-audience-attribute vs main · 13 files · 20 hunks · est. review ~10 minutes (30 sec/change)

## Instructions

Review changes in your side-by-side diff tool using this index for reference.
Click any row number to jump to its rationale paragraph for context on why the change was made.
Report row numbers for files with issues (e.g., "3, 7, 12") or "none" if all looks good.

| Row | Path | File |
|-----|------|------|
| [1](#block-1) | docs/ | development.md |
| [2](#block-2) | docs/ | technique-protocol-specification.md |
| [3](#block-3) | . | package.json |
| [4](#block-4) | schemas/ | technique.schema.json |
| [5](#block-5) | scripts/ | audience-baseline.json |
| [6](#block-6) | scripts/ | check-audience.ts |
| [7](#block-7) | src/loaders/ | markdown-technique-loader.ts |
| [8](#block-8) | src/schema/ | technique.schema.ts |
| [9](#block-9) | src/tools/ | workflow-tools.ts |
| [10](#block-10) | tests/ | audience-guard.test.ts |
| [11](#block-11) | tests/ | compose-activity-artifacts.test.ts |
| [12](#block-12) | tests/ | schema-validation.test.ts |
| [13](#block-13) | tests/ | technique-loader.test.ts |

## Block Rationale

### Block 1

`docs/development.md` gains a `check:audience` entry in the guard-command list and updates the sentence that enumerates which guards also run as Vitest tests. The rationale is discoverability: the new guard follows the same "runs both as a CLI script and as a `npm test` failure" pattern as the sibling binding-fidelity/template/fragments guards, so the docs must list it alongside them or a contributor would never learn it exists or that it gates CI. The added comment block also states the guard's contract in plain terms (agent-audience artifact with a filename must name a JSON file, fails only on NEW violations beyond the baseline), which is the same failure-and-re-snapshot idiom the other guards document. Pure documentation; no behaviour.

### Block 2

`docs/technique-protocol-specification.md` documents the new `#### audience` output sub-section: its enum values (`human | agent`), the absent-means-`human` default, and the convention that an `agent`-audience artifact is serialized as JSON on disk. It adds a "Choosing the audience" subsection giving the decision rule (who reads the artifact) plus per-side anti-patterns, and — importantly — an explicit *out-of-scope* note that per-artifact JSON field schemas are a later increment (V5), so this attribute states only *who reads* and *that* an agent artifact is JSON, not the shape of any payload. This scoping note is load-bearing: it is what keeps the PR additive and prevents scope creep into schema design. The spec is the canonical contract other surfaces (Zod schema, JSON schema, loader) implement, so it is edited first and the code mirrors it.

### Block 3

`package.json` adds one script line, `"check:audience": "tsx scripts/check-audience.ts"`, wired into the existing block of `check:*` guard scripts. This is the minimal plumbing that makes the guard runnable on the command line and available to any aggregate that fans out over `check:*`. It sits beside `check:stealth` with a trailing comma added to the prior line — a one-line, low-risk config edit. No dependency or build change.

### Block 4

`schemas/technique.schema.json` adds one `audience` property to the output-item definition, an enum of `["human","agent"]` with a description matching the Zod schema and the spec. This file is the hand-maintained JSON-Schema mirror of the Zod schema (deliberately not generated), so it must be kept in lockstep by hand whenever an output field is added — this block is that lockstep edit. Keeping the two in sync matters because the JSON schema is the artifact external consumers validate against, while Zod is the runtime validator; a drift between them would let a definition pass one and fail the other. The change is purely additive and optional, so no existing definition breaks.

### Block 5

`scripts/audience-baseline.json` is a new file whose entire content is `[]` — an empty baseline snapshot. Its purpose is the ratchet mechanism: the guard fails only on agent-audience artifacts *not* already recorded here, so the empty array encodes the reviewed fact that the corpus currently has zero agent-audience adoption. This lets a not-yet-adopted convention guard ship green today and start failing the moment someone introduces the first non-JSON agent artifact. It is regenerated with `--update-baseline` after an intentional, reviewed change, exactly like the sibling guards' baselines.

### Block 6

`scripts/check-audience.ts` (153 lines, new) is the convention guard: it walks every technique `.md` in the corpus through the *real* loader and, for each output that is both `audience: agent` and carries an `#### artifact` filename, asserts the filename ends in `.json` (including a `{token}`-template whose fixed suffix is `.json`). It is deliberately a separate script from `check-binding-fidelity.ts` under the one-guard-per-concern rule: enum *validity* is already enforced by the Zod `.strict()` schema at load, so this guard checks only the on-disk *format* convention the schema cannot express. The corpus-walk helper (`loadWorkflowTechniques`) handles grouped/nested/flat technique layouts and tolerates non-technique `.md` files by skipping loader throws/nulls, so a `README.md` in a `techniques/` tree does not crash the guard. The `collectAudienceViolations` / `diffBaseline` / `--update-baseline` / `fixed`-reporting machinery mirrors the established sibling-guard house pattern exactly, and both exported functions have real callers (CLI main + the guard test).

### Block 7

`src/loaders/markdown-technique-loader.ts` is the one non-trivial code change. `parseEntrySubsections` previously pulled a *single* reserved `####` sub-section (`'artifact' | 'default'`) out of an entry as metadata; it is generalized to accept an *array* of reserved keys (`ReservedKey[]` = `artifact | default | audience`) and return a `Partial<Record<ReservedKey,string>>` map instead of a lone `reserved?: string`. This generalization is driven by a concrete present need, not speculation: outputs now legitimately carry two reserved keys on one entry (`artifact` + `audience`), so the array is the minimal representation of "match any of N reserved titles." The two call sites are updated accordingly — inputs pass `['default']`, outputs pass `['artifact','audience']` — and the output parser passes the authored `audience` value through verbatim so a mistyped value reaches the Zod enum and is rejected loudly at load rather than being silently narrowed away here. The added comments explain the *why* (strict-schema-rejects-loudly) rather than the what.

### Block 8

`src/schema/technique.schema.ts` adds `audience: z.enum(['human','agent']).optional()` to `OutputItemDefinitionSchema`, placed beside the existing `artifact` and `destination` fields. This is the single runtime validator for the enum: because the enclosing technique schema is `.strict()`, an out-of-set value on any nested output fails the whole technique, which is precisely the loud-at-load rejection the loader comment relies on. The field is optional, so every existing technique definition continues to validate unchanged (absent ⇒ `human`). The description string is kept identical to the JSON-schema and spec wording so all three surfaces agree.

### Block 9

`src/tools/workflow-tools.ts` widens `composeActivityArtifacts`'s return type to carry an optional `audience: 'human' | 'agent'` and copies the field from each technique output onto the composed artifact-contract entry. The reason this matters is that `get_activity` synthesizes an activity's artifact contract from its steps' technique outputs, and the worker needs to know an artifact's intended reader — and therefore its on-disk format — at write time; without this carry-through the audience declared in a technique would be invisible at the point of use. The conditional spread `...(o.audience ? { audience } : {})` omits the key entirely when absent (rather than writing `audience: undefined`), keeping the absent⇒human semantics clean on the wire. The same `composedArtifacts` array feeds both the body `{artifacts}` block and `_meta.artifacts`, so one computation serves both delivery surfaces with no duplication.

### Block 10

`tests/audience-guard.test.ts` (new) covers the guard from Block 6: one corpus-level assertion that the real corpus introduces no NEW violations beyond the baseline (PR227-TC-10), plus fixture-corpus cases proving a non-JSON agent artifact is flagged (TC-09), a JSON-named agent artifact and a human markdown artifact both pass, an agent output with no artifact is out of scope, and a `{token}`-templated `.json` name is accepted. These exercise the guard's real branch logic against tmpdir fixtures rather than mocks, which is the proportionate check for non-trivial parsing logic. The corpus-level test is the one that will start failing when the first non-JSON agent artifact is introduced, making the guard's ratchet observable in `npm test`.

### Block 11

`tests/compose-activity-artifacts.test.ts` (new) covers the `get_activity` carry-through from Block 9: it writes three technique fixtures (agent, human, and no-audience) and asserts `composeActivityArtifacts` puts `audience: 'agent'` / `'human'` on the respective entries and omits the key entirely for the undeclared one. The test's docstring records the design fact that the composed array is emitted verbatim into *both* the body `{artifacts}` block and `_meta.artifacts`, so covering the array covers both delivery surfaces (PR227-TC-07 / TC-08) — this was verified against the source (one `composedArtifacts` feeds both). Testing the composition function directly rather than the full tool response keeps the test fast and focused on the field-propagation behaviour under change.

### Block 12

`tests/schema-validation.test.ts` adds an `OutputItemDefinitionSchema audience` describe block: the enum accepts both `human` and `agent` (TC-04), an output with no audience is valid (TC-03, backward compatibility), an out-of-set value is rejected at the field level (TC-05), and — the composed view — an invalid audience on a nested output fails the whole `.strict()` `TechniqueSchema` while a valid one passes. This last case is the one that documents *why* a mistyped audience drops the technique at load rather than corrupting it, tying the schema behaviour back to the loader's pass-through comment. New imports (`OutputItemDefinitionSchema`, `safeValidateTechnique`) are added to support these assertions. Pure test addition alongside the existing schema-validation suite.

### Block 13

`tests/technique-loader.test.ts` adds an `audience attribute` describe block covering the loader parse path end to end: `human` and `agent` parse onto the output entry (TC-01/02, the latter alongside an `#### artifact`), an output with no `#### audience` loads with the field absent (TC-03), an out-of-set `#### audience` drops the technique via `.strict()` (TC-05 loader path), and object/YAML projection preserve `audience` verbatim with no edit to `projectTechnique` (TC-06). The projection test newly imports `projectTechnique` (confirmed exported) and asserts the field round-trips through both `projectTechnique` and `projectTechniqueToYaml` unchanged — this is the evidence that the additive field needed zero projection-code edit. Together with Blocks 10–12 this gives the new field coverage on every surface it touches: parse, schema, projection, and activity-contract composition.
