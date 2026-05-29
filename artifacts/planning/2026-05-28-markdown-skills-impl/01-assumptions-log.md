# Assumptions Log — Markdown Skills Migration Implementation

**Work Package:** markdown-skills-impl
**Date:** 2026-05-28

This log captures assumptions made during the design-philosophy activity. It is updated in subsequent activities as further assumptions surface and are resolved.

---

## Categories

- **Problem Interpretation** — what the problem actually is and what counts as fixing it.
- **Complexity Assessment** — how risky / how big the change is.
- **Workflow Path** — which optional activities to run.
- **Design Approach** — design-level choices made during plan-prepare.
- **Task Breakdown** — task ordering and granularity.
- **Dependency Assumptions** — pre-conditions or content the plan relies on.
- **Test Strategy** — what test coverage is sufficient.
- **Scope Decisions** — what is deferred or out of scope.

---

| ID | Assumption | Category | Resolvability | Status |
|----|-----------|----------|---------------|--------|
| A-001 | The pre-migrated content at `.engineering/artifacts/planning/2026-05-22-claude-skills-migration/legacy/{work-package,meta}/` is structurally complete and conforming to the conventions in `sample/resources/workflow-canonical/SKILL.md`. | Problem Interpretation | code-analyzable | Confirmed (comprehension §9 spot-check; full audit folded into Task A1's read pass) |
| A-002 | The existing `workflow-server` source has a TOON loader and `get_skill` that delivers TOON-projected content; replacing the loader requires only swapping the parsing layer, not the public MCP surface. | Complexity Assessment | code-analyzable | Confirmed (comprehension §7.1 — swap points are `tryLoadSkill` and `tryReadSkillRaw` only) |
| A-003 | `workflows/meta/{techniques,resources}/` content can serve dual purpose (meta-workflow's local content + cross-workflow shared content) without resolution ambiguity because precedence is workflow-local → `meta`. | Problem Interpretation | code-analyzable | Confirmed (comprehension §7.2 — explicit two-tier lookup replaces scan-all) |
| A-004 | The 10 workflow folders under `workflows/` each retain their existing `workflow.toon` + `activities/` unchanged; the migration adds sibling `techniques/` and `resources/` folders without disturbing them. | Complexity Assessment | judgement | Confirmed (comprehension §9 — `workflow-loader`, `activity-loader`, `parseActivityFilename` untouched) |
| A-005 | Two-PR coordination (content first, source second) avoids a window where the server expects markdown but finds none, OR where content exists but the loader still reads TOON. | Workflow Path | judgement | Accepted (judgement call; reinforced by the legacy-TOON feature flag in Task B2 as a brief-window safety fallback) |
| A-006 | A shared `projectSkillToToon(skill)` function is the right shape for the projection layer (vs inlining the projection in each consumer site). | Design Approach | judgement | Accepted (comprehension §7.6 portfolio lens — keeps projection contract testable in isolation; one named function for `readSkill` + `readSkillRaw` + `get_skill` consumers) |
| A-007 | The legacy TOON loader can be retained behind a feature flag (`SKILL_LOADER_LEGACY_TOON`) for one release cycle as a safety fallback, then removed in Phase C. | Task Breakdown | judgement | Accepted (mitigates the brief-window risk of source-merging before content-merging; the flag itself is removed in Task C2) |
| A-008 | The migration script lives at `scripts/migrate-skills/` and is committed on the source-side branch (Task B6); the content-side branch consumes it via a local copy or symlink to populate Phase A. | Task Breakdown | judgement | Accepted (keeps the script in the workflow-server repo where similar tooling lives; avoids dual-source script maintenance) |
| A-009 | Capturing TOON output baselines from the legacy loader before any source-side change merges is the canonical way to pin projection identity. | Test Strategy | code-analyzable | Confirmed (the only way to compare new-loader projection output against pre-migration on-wire shape; baseline capture is part of the script in Task A1/B6) |
| A-010 | TOON resources can be deleted in Phase C, but markdown resources must continue to live under `<workflow>/resources/<slug>/SKILL.md` (the new shape from Task A2), not the legacy `NN-<name>.md` shape. | Scope Decisions | code-analyzable | Confirmed (the migration script in A1 emits the new shape; the resource-loader's `parseResourceFilename` regex stays format-agnostic but the loader only matches `.md`) |
| A-011 | The 14 work-package activities resolve skill and resource references identically after the flip — no activity-file changes needed. | Dependency Assumptions | code-analyzable | Confirmed (comprehension §7.3 — `resolveOperations` + `formatOperationsBundle` are format-agnostic; activity files are unchanged) |
| A-012 | Five ADRs (forward-referenced in design philosophy) will be authored alongside implementation, not as a separate task in this plan. | Scope Decisions | judgement | Accepted (each ADR has its surface area surfaced by a specific implementation task; authoring fits naturally into the implementation activity, not a dedicated plan task) |
| A-013 | The `guides/` legacy fallback in `resource-loader.ts:99-103` is left in place — orthogonal to this migration and worth a separate follow-up. | Scope Decisions | code-analyzable | Confirmed (comprehension Q9 — out of scope; `getResourceDir` continues to fall back to `guides/`) |
| A-014 | The `workflow.skills.primary` legacy preamble path in `get_workflow` continues to resolve during the transition — the markdown loader handles it; sunsetting it is a follow-on, not part of this migration. | Scope Decisions | code-analyzable | Confirmed (comprehension Q8 — primary-skill path resolves through the same `readSkillRaw`, which routes to the markdown loader after B2) |

---

## Reconciliation plan

- **A-001 through A-005** were carried into the `codebase-comprehension` activity. A-001 through A-004 moved from Open to Confirmed during that activity (see [02-codebase-comprehension.md §9](02-codebase-comprehension.md)). A-005 remained Open as a judgement call and is now Accepted with mitigation noted (the legacy-TOON feature flag in Task B2 covers the brief-window risk).
- **A-006 through A-014** were added in the `plan-prepare` activity. Code-analyzable items (A-009, A-010, A-011, A-013, A-014) were reconciled by direct reference to comprehension findings. Judgement calls (A-006, A-007, A-008, A-012) are Accepted with rationale in the table.
- No `has_resolvable_assumptions` items remain Open — the reconciliation loop has converged. All assumptions are either Confirmed (code-resolved) or Accepted (judgement with rationale).

---

## Resolution legend

- **Confirmed** — resolved by direct code inspection or by test evidence already on the branch.
- **Accepted** — resolved by design rationale or by referencing established prior art / pre-resolved orchestrator context.
- **Open** — not yet resolved; will be revisited in a later activity.
- **Deferred** — judgement item escalated to the user via the `assumption-decision` checkpoint; outcome captured here once the user responds.

After `plan-prepare`: 9 Confirmed (A-001, A-002, A-003, A-004, A-009, A-010, A-011, A-013, A-014), 5 Accepted (A-005, A-006, A-007, A-008, A-012), 0 Open. Loop terminated.

---

## Assumptions-review outcome (2026-05-29)

Activity `assumptions-review` (session `SUQLKL`) re-evaluated each entry:

- **Code-analyzable Confirmed items (A-001, A-002, A-003, A-004, A-009, A-010, A-011, A-013, A-014):** verifications already cited the comprehension artifact; no further code analysis required. Status held at **Confirmed**.
- **Judgement Accepted items (A-005, A-006, A-007, A-008, A-012):** reversibility check (`gitnexus-operations::reversibility-signal`-style heuristic — does the assumption commit a path that is expensive to undo?) finds each is either easily reversible *or* has an explicit mitigation already wired into the plan:
  - **A-005** (two-PR coordination): mitigated by the legacy-TOON feature flag in Task B2 (brief-window safety fallback).
  - **A-006** (`projectSkillToToon` shape): an extract-function refactor; reversible at low cost. Plan Task B3 isolates the projection contract so an alternative shape can be substituted without touching consumers beyond the single seam.
  - **A-007** (legacy-TOON feature flag retained one cycle): the flag and its removal are explicit deliverables (Task B2 adds; Task C2 removes). Cost-of-reversal is one revert of Task C2.
  - **A-008** (migration script lives in source repo at `scripts/migrate-skills/`): script location is a maintenance choice with no wire impact; movable in a follow-on without touching the loader.
  - **A-012** (ADRs authored alongside implementation): each ADR's surface lives in a specific task; deferring the ADR writeup to implement doesn't change the implementation plan.

Outcome: **no assumption requires stakeholder escalation**. All 14 assumptions remain reconciled (9 Confirmed, 5 Accepted, 0 Open, 0 Deferred). The `assumption-decision` interview loop is therefore not triggered (`has_open_assumptions = false`), and no issue-tracker summary is posted (`has_deferred_assumptions = false`).

Variables emitted:

- `has_open_assumptions = false`
- `has_resolvable_assumptions = false`
- `has_deferred_assumptions = false`
- `stakeholder_review_complete = true`
- `task_assumptions` — per-task notes already enumerated below under "TODOs derived from plan-prepare"; the implement loop consumes that section directly.

---

## TODOs derived from plan-prepare

Implementation tasks for `assumptions-review` to validate alongside the assumptions above. Full task definitions live in [05-work-package-plan.md](05-work-package-plan.md).

**Phase A — Content placement** (worktree: `/home/mike1/projects/work/workflows/2026-05-28-markdown-skills-impl/`)

- [ ] A1. Author the migration script at `scripts/migrate-skills/migrate.ts` — copies `legacy/{work-package,meta}/{techniques,resources}/` into `workflows/<workflow>/{techniques,resources}/<slug>/SKILL.md`. Idempotent.
- [ ] A2. Run the script and commit migrated content (~150 files) — one commit per workflow.
- [ ] A3. Update top-level and meta READMEs to document the new layout.

**Phase B — Source side** (worktree: `/home/mike1/projects/work/workflow-server/2026-05-28-markdown-skills-impl/`)

- [ ] B1. Add `src/loaders/markdown-skill-loader.ts` with `tryLoadMarkdownSkill` and `tryReadMarkdownSkillRaw`; covers single-file and op-as-child-files shapes.
- [ ] B2. Refactor `tryLoadSkill` / `tryReadSkillRaw` in `src/loaders/skill-loader.ts:59-96` to dispatch to the markdown reader; legacy TOON branch retained behind `SKILL_LOADER_LEGACY_TOON` flag. Remove the `parseActivityFilename as parseSkillFilename` alias.
- [ ] B3. Add `projectSkillToToon(skill)` to `src/loaders/skill-loader.ts` — shared projection consumed by `readSkillRaw` and `get_skill`.
- [ ] B4. Replace cross-workflow scan-all with workflow-local → `meta` precedence in `readSkill:147-165` and `readSkillRaw:192-209`; delete `findWorkflowsWithSkills`.
- [ ] B5. Flip `resource-loader.ts:140-160` two-pass TOON-then-markdown loop to markdown-only.
- [ ] B6. Commit `scripts/migrate-skills/` on the source branch; add `npm run migrate-skills` to `package.json`.
- [ ] B7. Add fixture tree at `tests/fixtures/markdown-skills/` and the 16 test cases (PR126-TC-01 through PR126-TC-16) per [05-test-plan.md](05-test-plan.md).

**Phase C — Cutover** (after Phase A and B merge)

- [ ] C1. Delete legacy `workflows/<workflow>/skills/*.toon` and `workflows/<workflow>/resources/*.toon` on the content branch.
- [ ] C2. Remove the `SKILL_LOADER_LEGACY_TOON` flag and the legacy-TOON branch in `tryLoadSkill` / `tryReadSkillRaw`; delete `findSkillFile` and any dead legacy code paths.

---

## Implementation-time additions (2026-05-29, activity `implement`)

These items surfaced during code authoring and were resolved inline rather than
escalated. Each is recorded for traceability:

| ID | Assumption | Category | Resolvability | Status |
|----|-----------|----------|---------------|--------|
| A-015 | `## Operations` H3 subheadings inside a `SKILL.md` are presentation-only grouping headers when they do not themselves contain `## Procedure` (e.g. workflow-engine's "Discovery and session" / "Activity lifecycle" / "Checkpoint protocol" sections wrap op-link tables, not operation bodies). | Design Approach | code-analyzable | Confirmed (workflow-engine SKILL.md inspection — no H3 carries an inline `## Procedure`; operations live in child files). |
| A-016 | Markdown parse failures (e.g. an op-child file missing `## Procedure`) should be surfaced to callers as `SkillNotFoundError` via the existing `Result` contract, not as synchronous throws. The parser still raises a `MarkdownSkillParseError` internally so the source location and missing-section name reach the log. | Design Approach | code-analyzable | Confirmed — `tryLoadSkillInWorkflow` and `tryReadSkillRawInWorkflow` catch and log the parse error; existing test contract (Result-typed `readSkill`) is preserved. |
| A-017 | The resource-loader needs to resolve refs in TWO post-migration shapes: legacy flat `NN-<name>.md` (still on the workflows branch during the transition) and the new folder shape `<slug>/SKILL.md`. Folder-shape lookup is keyed by slug or by frontmatter `id:`. | Scope Decisions | code-analyzable | Confirmed — `findFolderResource` handles the new shape alongside the legacy flat shape; no consumer-side changes required because resource refs in workflow files already use id strings (e.g. `meta/bootstrap-protocol`) that the loader resolves either way. |
| A-018 | The TOON projection (`projectSkillToToon`) emits canonical field order (id, version, capability, description, inputs, protocol, output, rules, errors, resources, operations) rather than letting the in-memory Skill object's accidental key insertion order leak into the wire payload. Anything outside that canonical set is appended at the end of the projection. | Design Approach | judgement | Accepted — keeps the wire shape deterministic across runs; consumers parsing TOON do not depend on field order, but pinning it makes future projection-identity baselines stable. |

All four items resolved cleanly during implementation; none required stakeholder
escalation.
