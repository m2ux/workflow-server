# B6 + B12 — Truth-in-docs pass + retire-candidate sweep

Date: 2026-07-07. Backlog items B6 and B12 of epic [#166](https://github.com/m2ux/workflow-server/issues/166)
(schema/technique/disclosure review, 2026-07-03), batched per the epic's implementation-order note
(same field-ledger evidence, same schema/API doc surface). Evidence base:
[field-ledger.md](../2026-07-03-schema-technique-disclosure-review/field-ledger.md) (risks 1–6 drive B6),
[corpus-consumption-audit.md](../2026-07-03-schema-technique-disclosure-review/corpus-consumption-audit.md) §§2–3 and
[technique-structural-census.md](../2026-07-03-schema-technique-disclosure-review/technique-structural-census.md) §5 (drive B12),
[evaluation-report.md](../2026-07-03-schema-technique-disclosure-review/evaluation-report.md) friction items F3/F6/F10/F11/F14.

## Scope

**B6 — truth-in-docs pass (F3, F6, F11).** Make the schema/API documentation surface state what the
server actually does, field by field: fix the `blocking`/auto-advance contradiction
(api-reference.md claimed `blocking: false` was required; `respond_checkpoint`'s gate checks only
`defaultOption` + `autoAdvanceMs`); document `transitionTo`/`skipActivities` as recorded-not-applied;
document the `when`→`condition` dismissal asymmetry; document the variable model as-is (bag starts
empty, no seeding/coercion/required-check); and **fix** (not just document) the F11 manifest warn
logic — the one code change in the batch.

**B12 — retire-candidate sweep (F10, F14).** Flag the dead-weight schema surface for the next
schema **major**: `author`, `triggers`/`passContext`, `decisions`, `emit`/`message` verbs,
`skipActivities`, `breakCondition`, `>=`/`<=`, `step.required`, `isDefault`, `blocking`
(enforce-or-remove), `Initial`/`Final` wrapping, `outputs[].artifact.action`. Flagging only —
no compatibility change ships now.

Server-repo docs + one warn-only validation fix; engineering-branch register. No workflows-content
changes (no dedicated workflows worktree needed).

## Design decisions

**D1 — F11 is a code fix in `validateStepManifest`, not a doc caveat.** Three false-warning classes
removed (`src/utils/validation.ts`):
- *Missing*: only ungated top-level steps are required; a `when`/`condition`-gated step may be
  legitimately absent (the agent evaluated the gate and skipped it).
- *Unexpected*: the known-id set is `flattenActivitySteps` (top-level + loop bodies, the existing
  single traversal), so loop-body ids reported per iteration are accepted — but never required,
  since the iteration count is agent-determined and may be zero.
- *Order*: relative-subsequence check over top-level ids (declaration-index map, last-seen
  comparison) replaces the positional comparison, which false-positived whenever a gated step was
  skipped. Duplicate ids (loop iterations of one step) compare equal and pass.

**D2 — Zod `describe` strings are part of the truth-in-docs surface.** Agents read the generated
JSON schemas via the `workflow-server://schemas` resource, so the misleading descriptions were fixed
at the Zod source and `npm run build:schemas` regenerated the artifacts. Fields touched: `blocking`,
effect `setVariable`/`transitionTo`/`skipActivities`, `when`/`condition` (incl. the dismissal
asymmetry), step `required`, `actions[]`/`set`, `breakCondition`/`maxIterations`,
`triggers`/`passContext`, `decisions`, `transitions`, `outcome`, `author`, and
`variables[].type`/`defaultValue`/`required`.

**D3 — Field-by-field classification lives in `schemas/README.md`; the API doc gets the boundary.**
New "Enforcement Model" section in `schemas/README.md`: a per-construct table classifying every
field engine-enforced / advisory / agent-interpreted, distilled from the field-ledger. New
"Enforcement Boundary" section in `docs/api-reference.md` (three-class summary + the
single-declarative-path statement) linking to the table. Row-level fixes throughout both files plus
`checkpoint_model.md`, `workflow-fidelity.md` (Layer 5 rewritten — the "all steps required / exact
match" design-constraint paragraph was false), and `state_management_model.md` (variable
initialization is the orchestrator's job).

**D4 — B6's variable-model wording is current-behavior-only, structurally isolated.** B7 changes
that behavior (seeding, type honoring); the affected sentences are self-contained so the B7 touch-up
is a trivial re-statement, per the epic's B6↔B7 soft-overlap note.

**D5 — The B12 register is a planning artifact, not system documentation.** The documentation-voice
rule forbids deprecation narration in system docs, so the register lives in the review's planning
folder on the `engineering` branch:
[retire-candidates-schema-major.md](../2026-07-03-schema-technique-disclosure-review/retire-candidates-schema-major.md).
Shape: R1–R12 rows (server behavior today / corpus usage / disposition / migration), provisional
entries P1 (`actions[].set`) and P2 (variable-model trio) to resolve after B7, considered-and-kept
non-candidates, and a disposition path (one batch behind a schema-major bump, sequenced after B7 so
the corpus migrates once).

## Risks

- GitNexus rated `validateStepManifest` CRITICAL — centrality (it sits on the `next_activity`
  path), not behavior: one direct caller, warn-only string output, and the delta is strictly fewer
  false warnings. Gated by unit tests + the e2e walk baselines.
- e2e snapshot baselines embed `manifestStatus`; regeneration required and the diff had to be
  audited to contain nothing else.

## Status log

- 2026-07-07 — Implemented and verified in the main working tree:
  - `validateStepManifest` rewrite per D1; 7 new unit tests in `tests/validation.test.ts`
    (gate-omission, executed-gated acceptance, loop-body ids, unknown ids, subsequence order both
    ways, empty output). Existing mcp-server manifest tests unaffected (fixture activity has ample
    ungated steps; reversed manifests still trip the order check).
  - Zod describe fixes per D2 + `schemas/activity.schema.json` / `schemas/workflow.schema.json`
    regenerated.
  - Doc surfaces per D3: `docs/api-reference.md` (per-effect enforcement wording on
    `respond_checkpoint`, auto-advance truth, `condition_not_met` asymmetry, warn-only
    transition/`transition_condition`/manifest semantics, Enforcement Boundary section),
    `schemas/README.md` (Enforcement Model table + ~12 row-level fixes), `checkpoint_model.md`,
    `workflow-fidelity.md`, `state_management_model.md`.
  - B12 register authored per D5.
  - Gates: typecheck clean; `npx vitest run` 454 passed / 0 failed / 14 skipped; e2e walk
    baselines regenerated — diff exclusively `manifestStatus: warning → valid` ×19 (the phantom
    warnings the fix removes); `gitnexus_detect_changes` scope matches the edit set exactly.
- 2026-07-07 — Delivered:
  - Register committed to `engineering` (1798df75).
  - Server PR [#175](https://github.com/m2ux/workflow-server/pull/175) →
    `main` (merge 7e8daf0a, --admin as usual), branch `feat/166-b6-b12-truth-in-docs`, 3 commits:
    `fix(validation)` / `docs(schemas)` / `chore` (.engineering pointer bump). Local branch
    deleted; remote left on GitHub.
  - B6 and B12 ticked in #166 (gh api PATCH; order cells → ✅ done).
  - GitNexus reindexed; stats-banner refresh committed straight to main (aa56475f).
- 2026-07-07 — Register P1/P2 subsequently resolved by B7 (90cc5371 on `engineering`): `set`
  retired at the B12 major; the variable-model trio leaves the register (seeding shipped).

## Follow-ups (not this batch)

- B12 execution is the next schema major: one migration batch, after B7 (P1/P2 now resolved).
  R10 `blocking` carries the one open enforce-or-remove decision.
- `workflows/workflow-design/techniques/audit-anti-patterns.md:37` still names the deleted
  `check-artifact-description.ts` (carried over from B4's follow-up list; content edit via the
  dedicated-worktree flow).
- B6's variable-model sentences were superseded by B7's seeding change; B7's own docs pass covers
  the re-statement (see `2026-07-07-166-b7-variable-model/plan.md`).
