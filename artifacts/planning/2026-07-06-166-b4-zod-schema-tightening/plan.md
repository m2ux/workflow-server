# B4 — Tighten the Zod step/activity schema to subsume guards

Date: 2026-07-06. Backlog item B4 of epic [#166](https://github.com/m2ux/workflow-server/issues/166)
(schema/technique/disclosure review, 2026-07-03). Evidence base:
[authoring-friction-guards.md](../2026-07-03-schema-technique-disclosure-review/authoring-friction-guards.md) §1,
[evaluation-report.md](../2026-07-03-schema-technique-disclosure-review/evaluation-report.md) §2/§4.

## Scope

Three schema tightenings, all enforcement of the status quo — the corpus passes all three affected
guards clean today (verified 2026-07-06: `check:steps` 0 violations, `check:artifacts` 0 hits,
`check:identifiers` 0 flagged with an empty baseline):

1. **Per-kind step unions with closed properties** → subsumes `check:steps` (AP-64 bound-step purity)
2. **Delete authored `artifacts[]` from the activity schema** → subsumes `check:artifacts` (AP-65)
3. **Pattern on workflow variable names** → subsumes the YAML half of `check:identifiers` (AP-60);
   the markdown-heading half stays a guard

Server-only change (`src/schema/`, `scripts/`, `tests/`, regenerated `schemas/*.json`). No workflow
content changes expected; contingency in Phase 1.

## Current state

- `src/schema/activity.schema.ts` `StepSchema` (lines 64–110) is one flat permissive object: a
  `kind` enum plus a `superRefine` that enforces per-kind *required* fields only. Nothing forbids
  `description` on a technique step or `loopType` on a checkpoint. No `.strict()` — Zod silently
  **strips** unknown keys at runtime, while the generated JSON schema already emits
  `additionalProperties: false`; the two validation surfaces disagree.
- `ActivitySchema.artifacts` (line 260) is schema-legal but documented "SERVER-COMPUTED — do NOT
  author". Corpus has zero authored `artifacts:` blocks; no code in `src/` reads `.artifacts` off
  the Activity type.
- `src/schema/workflow.schema.ts` `VariableDefinitionSchema.name` (lines 5–11) is a bare
  `z.string()`. The `check:identifiers` baseline (`scripts/identifier-qualification-baseline.json`)
  is empty — the corpus is fully qualified.
- Loader hazard: `src/loaders/workflow-loader.ts:44–47` silently skips an activity that fails
  validation (B5 fixes the surfacing). Any tightening needs a corpus-wide validation test as a
  guardrail, or a nonconforming file just vanishes from the loader.

## Design decisions

**D1 — Step schema becomes `z.discriminatedUnion('kind', [...])` with `.strict()` members.**
Four member schemas — technique / action / checkpoint / loop — each carrying only its own fields:

| Field | technique | action | checkpoint | loop |
|---|---|---|---|---|
| `id` | optional (derivable) | required | required | required |
| `technique` | required | — | — | — |
| `message` / `options` / `defaultOption` / `autoAdvanceMs` / `blocking` | — | — | ✔ (message+options required) | — |
| `loopType` / `variable` / `over` / `breakCondition` / `maxIterations` / `steps` | — | — | — | ✔ (loopType+steps required) |
| `name` | — | — | — | optional (guard's loop-label exemption) |
| `when` / `condition` / `required` | ✔ | ✔ | ✔ | ✔ |
| `actions` | ✔ (AP-68 implies `set` on technique steps) | ✔ | — | — |
| `triggers` | ✔ | ✔ | — | — |
| `description` | gone everywhere (AP-64) | | | |

Per-kind field placement (especially `actions`/`triggers`) is confirmed by the Phase-1 corpus scan
before it is final — the rule: forbid only what the guard-clean corpus already doesn't do. Most of
the `superRefine` dissolves into structural requirements; discriminated unions give downstream
TypeScript free narrowing.

**D2 — `required` becomes `z.literal(false).optional()`** on all step kinds (the guard flags
`required: true` as redundant noise; JSON-schema equivalent `const: false`). Consumers change from
`step.required` to `step.required !== false`. Full retirement of `step.required` stays in B12.

**D3 — `ActivitySchema` also gets `.strict()`, not just the `artifacts` deletion.** Without strict,
deleting the field means authored `artifacts[]` is silently stripped, not rejected — that does not
subsume a hard-zero guard. `artifactPrefix` (also server-computed) stays in the schema for now: the
loader assigns it onto the validated object, and evicting it into a runtime-only type is a
type-refactor beyond B4.

**D4 — Variable-name pattern: qualified snake_case, `^[a-z][a-z0-9]*(_[a-z0-9]+)+$`** (≥2 words).
Contingency: if the Phase-1 corpus scan finds workflow variables using the guard's 27-word `EXEMPT`
set (bare words like `tasks`, `type`), the schema becomes
`z.union([z.enum([...EXEMPT]), z.string().regex(...)])` — generated JSON as `anyOf` enum+pattern.

**D5 — Guard retirement, not duplication.** Delete `check-bound-step-purity.ts` and
`check-artifact-description.ts` plus their npm entries and test files (assertions move into schema
rejection tests). Narrow `check-identifier-qualification.ts` to the markdown-heading half only.
Sweep CI/docs for references to the removed scripts.

## Work plan

**Phase 1 — Recon and de-risking**
1. GitNexus impact analysis on `StepSchema`, `ActivitySchema`, `VariableDefinitionSchema`,
   `populateStepIds`, `flattenActivitySteps`; report blast radius.
2. Corpus dry-run: strict-parse every activity/workflow YAML across all 14 workflows against a
   prototype of the tightened schema. Decides D1 field placement, D4 exemption question, and
   whether a workflows-content PR is needed (expected: no).
3. Spike `zod-to-json-schema` output for a recursive discriminated union (`z.lazy` in the loop
   body). Biggest technical unknown — B5 exists because the generator already mishandles condition
   recursion. Fallback: pull the relevant slice of B5's generator fix forward.

**Phase 2 — Schema changes** (one commit each, `feat(schema):`)
4. Step per-kind strict discriminated union; migrate residual `superRefine`; fix type fallout
   across `src/` and `tests/e2e/walker.ts`.
5. `ActivitySchema`: delete `artifacts[]`, add `.strict()`. Verify `get_activity` synthesizes its
   artifact contract into the response payload, not onto the Activity object.
6. `VariableDefinitionSchema.name` pattern per D4.

**Phase 3 — Guard retirement + regeneration**
7. Remove the two subsumed guard scripts, npm entries, test files; narrow `check:identifiers`;
   sweep CI configs and docs.
8. Regenerate `schemas/*.json`; sync as `chore(schemas):` commit (e6a3d9c5 convention); update
   `schemas/README.md` and api-reference where they describe the step shape.

**Phase 4 — Tests and verification**
9. Rejection tests in `tests/schema-validation.test.ts`: one extraneous-field case per step kind,
   authored `artifacts[]` rejected, `required: true` rejected, bare variable name rejected.
10. Corpus-wide validation test: every activity file of all 14 workflows strict-parses — the
    permanent guardrail against the silent-skip loader hazard.
11. Full gate: `npm run typecheck`, `npm test`, remaining `check:*` guards,
    `gitnexus_detect_changes` before commit. Check whether the e2e definition-lint layer consumes
    the generated JSON schemas; regen baselines if so.

## Risks

- **Silent-skip amplification** (medium, mitigated): until B5 lands, a strict-schema failure makes
  an activity disappear silently. The corpus-wide test (task 10) is the mitigation.
- **Generator recursion** — the real unknown, spiked in task 3 before any schema code is written.
- **Type fallout** from the Step union (low; compile-time-driven, bounded by impact report).
- Effort: issue says S; with union type-fallout and the generator spike, realistically S+/M−,
  one PR of ~6–8 commits.

## Sequencing and PR shape

Single server PR to `main` on branch `feat/166-b4-zod-schema-tightening` (matching `feat/166-b3-*`
convention). No workflows-submodule pin bump expected; if the Phase-1 dry-run surfaces corpus
fixes, those go in a dedicated workflows worktree as a content PR that merges **first**, then the
server PR bumps the pin — same two-repo sequence as B2/B3.

## Status log

- 2026-07-06 — Plan authored; guards verified clean on corpus; Phase 1 started.
- 2026-07-06 — Phase 1 complete, all green; go for Phase 2:
  - **Corpus dry-run:** all 104 activity files / 14 workflows pass the prototype strict schema.
    No workflows-content PR needed.
  - **D1 refinements from step-key census** (technique 441, checkpoint 103, action 96, loop 33):
    step-level `triggers` has 0 corpus uses → dropped from all step kinds (zero-cost B12 slice
    pulled forward). Loop `name` used on all 33 loops → kept, loop-only. `actions` only on
    technique (26) and action (96) steps. `required` only 3 uses, all `false`, all on technique
    steps → `z.literal(false).optional()` on all kinds is safe.
  - **D4 contingency active:** 5/341 variables use bare exempt words (`target`, `dimensions`,
    `exclusions`) — all in the guard's `EXEMPT` set. Design: shared exemption module consumed by
    both `VariableDefinitionSchema` (enum ∪ pattern → generates `anyOf`) and the narrowed
    markdown-only guard.
  - **Generator spike clean:** recursive discriminated union renders `loop.steps` as
    `$ref: #/definitions/Step`, `additionalProperties: false` on every member, no `items: {}`
    degradation. No B5 coupling. Zod v3 constraint: `z.lazy` must wrap the loop's `steps` field —
    `discriminatedUnion` rejects lazy members.
  - **Impact:** GitNexus rates the traversal surface CRITICAL (11/12 execution flows through
    `flattenActivitySteps`/`populateStepIds`), but B4 changes the `Step` type, not signatures;
    no `src/` consumer reads the removed fields (only the retired guard reads
    `required === true`). Compile-time plumbing risk, gated by typecheck + corpus test + suite.
  - **Artifacts verification:** `ArtifactSchema`/`Artifact` have zero importers; `get_activity`
    synthesizes its contract as a local array (`workflow-tools.ts:93–103`); `artifactPrefix` is
    loader-assigned post-validation (`workflow-loader.ts:51,134`) and stays in the schema.
- 2026-07-06 — Phases 2–4 implemented on `feat/166-b4-zod-schema-tightening`; all gates green:
  - `StepSchema` → `z.discriminatedUnion('kind', ...)` with four `.strict()` members; step
    `description` and `triggers` removed; `required` → `z.literal(false).optional()`;
    `superRefine` dissolved into structural requirements; traversal helpers kind-narrowed.
    Type fallout: 9 errors in 2 files (`binding-provenance.ts`, `resource-tools.ts`), all fixed
    by kind-narrowing.
  - `ActivitySchema` `.strict()`; `artifacts[]` + `ArtifactSchema` deleted.
  - New `src/schema/identifiers.ts` (qualified pattern + shared AP-60 exemption list);
    `VariableDefinitionSchema.name` = qualified snake_case ∪ exemptions (generates `anyOf`).
  - Guards: `check:steps` / `check:artifacts` scripts + tests deleted, npm entries removed;
    `check:identifiers` narrowed to the markdown surface, importing the shared exemption list.
  - `schemas/*.json` regenerated: `activity.schema.json` fully `$ref`-correct;
    `workflow.schema.json` keeps its pre-existing B5-class `items: {}` degradation (present at
    HEAD; instance count 11→19 because the union repeats condition sites per member — B5 scope).
  - `schemas/README.md` updated (Artifact entity removed, closed-object statements, `required`
    row, variable-name row).
  - Tests: rejection cases per step kind, authored-`artifacts[]`/unknown-key rejection,
    `required: true` rejection, variable-name cases, corpus-wide strict-parse guardrail (raw
    `workflow.yaml` validated minus the loader-resolved `activities` field — raw files may hold
    string activity references, e.g. remediate-vuln).
  - Gates: typecheck 0 errors; vitest 434 passed / 14 skipped / 0 failed, snapshots unchanged;
    check:binding 0 NEW (267 baselined), check:identifiers/self-input/activity-tech/
    prism-lenses/anchors all OK; gitnexus detect_changes surface matches the intended edit set.
- Follow-ups (not this PR): `workflows/workflow-design/techniques/audit-anti-patterns.md:37`
  still names `scripts/check-artifact-description.ts` as the deterministic guard — content edit
  via the dedicated-worktree flow, fits B6; `workflow.schema.json` generator recursion → B5.
