# Work-Package Review-Mode Path — Comprehension Artifact

> **Last updated**: 2026-06-30
> **Work packages**: #145 — Harden review-mode path against config-change & interaction defects (`2026-06-30-review-mode-harden-config-defects`)
> **Coverage**: The review-mode (`is_review_mode == true`) path of the `work-package` workflow end-to-end — detection, branching activities/steps, the review techniques (`review-code`, `review-diff`, `review-test-suite`, `findings-classification`, `review-summary`), the structural pass, the severity model, and the binding/schema/E2E-harness constraints that edits to this path must respect. Authored as the codebase-comprehension reference for the five planned augmentations.
> **Related artifacts**: [work-package-workflow-content.md](work-package-workflow-content.md), [workflow-server-schemas.md](workflow-server-schemas.md), [prism-workflow.md](prism-workflow.md), [orchestration.md](orchestration.md)

> **Subject note**: The "codebase" comprehended here is the **workflow-definition layer** of the `work-package` workflow (the `workflows` submodule, subdir `work-package/`), not the TypeScript server source. Paths below are relative to that worktree (`work-package/`) unless prefixed. The reference worktree for this work package is `/home/mike1/projects/work/workflow-server/2026-06-30-review-mode-harden-config-defects/work-package/`. The E2E-harness baselines live in the server repo at `tests/e2e/`.

---

## Architecture Overview

### Project Structure

The `work-package` workflow is a directory of declarative definitions:

- `workflow.yaml` — workflow root (variables, version, activity list).
- `activities/NN-<name>.yaml` — 15 activity definitions; steps are ordered, each `kind: technique | action | checkpoint | loop | decision`.
- `techniques/` — composed technique contracts (markdown with `## Capability / ## Inputs / ## Protocol / ## Outputs / ## Rules`); grouped techniques are subfolders with a `TECHNIQUE.md` base contract that descendants inherit.
- `resources/` — prose guides loaded via `get_resource` (e.g. `review-mode.md`, `rust-substrate-code-review.md`, `test-suite-review.md`).
- `REVIEW-MODE.md` — top-level human-facing description of the mode (mirrors `resources/review-mode.md`).

There is **no schema construct for review mode**. It is plain workflow state: a boolean `is_review_mode` (default `false`) plus `condition:` clauses on steps / checkpoints / transitions that branch on it. There is no `skipActivities` list and no mode `defaults` block — "skipped" activities are skipped only because their steps and inbound transitions are gated `is_review_mode != true`.

### Review-Mode Variable Set

| Variable | Set by | Role |
|----------|--------|------|
| `is_review_mode` | `detect-review-mode` step + `review-mode-detection` checkpoint in `01-start-work-package.yaml` | Master gate; every mode-specific branch reads it |
| `review_pr_url` | `review-mode-detection` technique | PR under review |
| `pr_number` / `branch_name` | `review-mode-detection` technique (resolved from PR, branch checked out) | downstream review targeting |
| `review_ticket_ref` | `review-mode-detection` technique | tracker ticket extracted from PR body/commits |
| `review_pr_captured` | `review-pr-reference` checkpoint | confirms a PR was provided |
| `review_summary` | `review-summary` technique (in `submit-for-review`) | consolidated comment text |
| `review_posted` | `review-summary-approval` checkpoint | whether posted to PR |
| `needs_code_fixes` / `needs_test_improvements` | `findings-classification` technique | routing flags (drive the post-impl review-fix loop in standard mode; in review mode classification is documentation-only) |

### Review-Mode Activity Walk (deterministic baseline)

From the committed E2E snapshot `[review-mode]` (`tests/e2e/__snapshots__/snapshot.test.ts.snap`), the path is:

`start-work-package → design-philosophy → codebase-comprehension → plan-prepare → assumptions-review → implement → lean-coding-audit → post-impl-review → validate → strategic-review → submit-for-review → complete`

(The snapshot drives review mode via `skip-optional`; `implement` still appears as an activity but its create-only steps are gated out.)

### Where Review Mode Branches (the spine)

| Activity (file) | Review-mode behavior | Key gated steps |
|-----------------|----------------------|-----------------|
| `01-start-work-package.yaml` | Detect mode, capture PR ref, skip branch/PR creation | `detect-review-mode`, checkpoint `review-mode-detection`, `capture-pr-reference`, checkpoint `review-pr-reference`, `create-review-worktree` (vs `create-component-worktree`/`derive-branch-name`/`create-pr` gated `!= true`) |
| `02-design-philosophy.yaml` | Assess ticket completeness, force-skip elicitation | `assess-ticket-completeness`, `set-review-mode-path` |
| `05-implementation-analysis.yaml` | Analyze **pre-change** baseline from base branch | (review-only baseline steps) |
| `08-implement.yaml` | SKIPPED — steps + inbound transition gated `!= true` | — |
| `09-lean-coding-audit.yaml` | Read-only review; apply path / confirmation checkpoint gated out | — |
| `10-post-impl-review.yaml` | Compare PR vs expected; code/structural/test review; classify | `code-review`, `structural-analysis-inline`, `test-suite-review`, `classify-and-route-findings` |
| `11-validate.yaml` | Document failures as findings (no fix) | `document-failures` (= `findings-classification`), `assess-test-coverage` (= `review-test-suite`) — both gated `== true` |
| `12-strategic-review.yaml` | Document cleanup recommendations (no apply) | `document-cleanup-recommendations` (`== true`) vs `apply-cleanup` (`!= true`) |
| `13-submit-for-review.yaml` | Generate + post consolidated review comments, then end | `consolidate-review-findings`, `generate-review-summary`, `post-pr-review`, checkpoint `review-summary-approval` (all `== true`) |
| `14-complete.yaml` | Retrospective only | — |

### How a Review Run Reaches Its Verdict

1. `post-impl-review` runs `review-diff` (manual-diff index + per-block rationale), then `review-code`, then the structural lens `prism/structural-analysis` (inline when not `complex`; otherwise `dispatch-prism`), then `review-test-suite`, then `findings-classification` (`classify-and-route-findings`).
2. `validate` (review mode) runs `findings-classification` (`document-failures`) over test/build/lint diagnostics, then `review-test-suite` (`assess-test-coverage`). No fix loop (`fix-failures`/`fix-revalidate-cycle` are gated `!= true`).
3. `strategic-review` documents findings + cleanup recommendations.
4. `submit-for-review` runs `findings-classification` again (`consolidate-review-findings`) over the union of findings, then `review-summary` (`generate-review-summary`) renders the consolidated comment per `resources/review-mode.md#consolidated-review-format`, presents it at `review-summary-approval`, and posts via `update-pr::render` (`post-pr-review`). The **Overall Rating** (Approve / Request Changes / Comment Only) lives in that rendered summary; review-type selection maps Critical/High → `--request-changes`.

### Design Patterns

- **State-driven mode, not schema mode** — one boolean + ordinary conditions; maximally composable, no special engine path.
- **Document-not-apply inversion** — every place standard mode *applies* a change, review mode swaps to a *document* step gated on the same boolean (`apply-cleanup` ↔ `document-cleanup-recommendations`; `fix-failures` ↔ `document-failures`).
- **Single classify-route technique reused 3×** — `findings-classification` is bound in validate, post-impl-review, and submit-for-review. Any change to its severity axes propagates to all three.
- **Resource owns the output format** — `review-summary` renders strictly from `resources/review-mode.md#consolidated-review-format`; the resource is the authoritative format owner.

---

## Key Abstractions

### Review Techniques (current contracts)

| Technique | Inputs (key) | Outputs | Severity scale | Notes |
|-----------|--------------|---------|----------------|-------|
| `review-code.md` (v2.0.0) | `changed_files`, `project_type`, `planning_folder_path` | `code_review_report` (`code-review.md`) | critical/high/medium/low/informational | §2 already does a gitnexus blast-radius (`detect-changes` + `impact` upstream) to set a severity ceiling. **No** associated-type/trait-impl swap sub-check on `Config` binding changes (augmentation 2 target). |
| `review-diff.md` (v1.0.0) | `branch_name`, `planning_folder_path` | `change_block_index` (`change-block-index.md`), `manual_diff_review_report` (`manual-diff-review.md`), `has_critical_blocker` | (per-block, user-flagged) | Index + rationale; user interviews flagged blocks. |
| `review-test-suite.md` (v2.0.0) | `changed_files`, `planning_folder_path` | `test_suite_review_report` (`test-suite-review.md`) | critical/high/medium/low | §2 diff-aware coverage map (`coverage_gaps`/`update_candidates`). **No** reported-failure triage or multi-instance coverage gate yet (augmentation 5 target). |
| `findings-classification.md` (v1.0.0) | `findings_to_classify`, `code_review_findings`, `test_review_findings` | `needs_code_fixes`, `needs_test_improvements` | **Critical / Major / Minor / Nit / Informational** | §1 "Classify Findings" judges by impact but has **no impact-based axes** (unbounded growth / economic / liveness / migration) and no "correct-but-harmful ⇒ Major+" rule (augmentation 4 target). `needs_code_fixes` = any code-review finding ≥ Minor. |
| `review-summary.md` (v1.0.0) | `consolidated_findings`, `review_mode_resource` | `review_summary` | renders the resource's Severity Definitions | Renders Executive Summary + per-category findings + Action Items. **No** existing-feedback triage section (augmentation 1 render target). |
| `review-mode-detection.md` (v1.0.0) | `user_request`, `pr_reference` | `is_review_mode`, `review_pr_url`, `pr_number`, `branch_name`, `review_ticket_ref` | — | Detects review intent, captures PR, extracts ticket. |
| `respond-to-pr-review.md` (v2.0.0) | `review_comments` | `review_analysis`, `requires_replan` | required/suggestion/question/nit | Operates on **the own PR's reviewer feedback after posting** (in `submit-for-review`'s `process-review-comments`), NOT on ingesting prior external feedback before forming a verdict. This is the closest existing technique to augmentation 1 but is a different concern. |

### Structural Pass (`prism/structural-analysis.md`, v1.1.0)

- Applies the **L12** structural lens (`prism/resources/l12.md`): falsifiable claim → dialectic → improvements → structural invariant → **conservation law** → meta-law → **Bug Table** (each bug classified fixable/structural).
- Output `structural_analysis` (`structural-analysis.md`) with `conservation_law`, `meta_law`, `bug_table`, `concealment_mechanism`, `structural_invariant`.
- Bound in `post-impl-review` as `structural-analysis-inline` (gated NOT-complex; complex routes to `dispatch-prism`). It is the natural host for augmentation 3's **lifecycle/conservation ledger** (all producers vs all clearers, set-wide coverage) — the lens already speaks "conservation law," so the ledger extends an existing concept rather than inventing one.
- The validate activity (`11-validate.yaml`) does **not** itself invoke the structural lens; the prompt frames augmentation 3 as "structural pass behind validate / used by validate / review-code" — the actual structural-lens binding lives in `post-impl-review`, and validate consumes its findings via `findings-classification`. **Binding point to confirm in planning:** whether the conservation ledger lands in `structural-analysis.md` (the lens technique) and/or as a `review-code` sub-check, and how validate references it.

### Error / State Handling in the Definition Layer

- "State" is the workflow variable bag; producers/consumers communicate through declared `inputs[]`/`outputs[]` (the `variable-binding` contract). A step consumes/produces exactly its bound operation's composed signature — incomplete signature = binding gap, not implicit convention.
- Conditions/transitions read outputs by name or dotted path (`validation_results.validation_passed`).

---

## Design Rationale

### Why one boolean instead of a mode schema
- **Observation**: `is_review_mode` + conditions, no `skipActivities`.
- **Hypothesized rationale**: keeps the engine generic; review mode is "just another path," fully exercised by the existing 6-policy E2E matrix without bespoke machinery.
- **Trade-offs**: optimizes for composability and testability; sacrifices locality — review-mode behavior is scattered across ~10 activities, so an augmentation that "hardens review mode" almost always touches several files and must keep their conditions consistent.
- **Implications for changes**: each augmentation must pick a host that is already on the review-mode walk and gate any review-only additions on `is_review_mode == true`.

### Why `findings-classification` is reused, not forked
- **Observation**: same technique in validate / post-impl-review / submit-for-review.
- **Hypothesized rationale**: one severity scale, one routing definition; DRY.
- **Trade-offs**: a single point to change severity semantics (augmentation 4) — but every consumer inherits the change, so the `needs_code_fixes` gate must stay coherent across all three call sites.

### Severity-scale divergence (live inconsistency to resolve)
- **Observation**: `findings-classification` uses **Critical / Major / Minor / Nit / Informational**; `review-code` uses **critical/high/medium/low/informational**; `resources/review-mode.md` Severity Definitions and `review-summary` use **Critical / High / Medium / Low**.
- **Implication for augmentation 4**: adding impact-based axes and a "correct-but-harmful ⇒ Major+" rule lands in `findings-classification` (Major exists only there). The cross-file constraint (success criterion "rated above safe") means the new rule must also be reflected where the rating is *rendered* — `resources/review-mode.md` Severity Definitions and the `review-summary` output — or a correct-but-harmful finding will be reclassified down at render time. Planning must decide whether to unify the scales or map Major→High at the render boundary.

---

## Data Flow and Operational Context

### Data Flow Map (the five augmentations)

| # | Augmentation | Producer (where authored) | Consumer / render | Cross-file constraint |
|---|--------------|---------------------------|-------------------|------------------------|
| 1 | NEW `review-existing-feedback.md` — ingest & rebut prior PR comments; Confirmed/Refuted/Superseded triage; unaddressed external blocker **caps the rating** | New technique, wired into review-mode branch of `01-start-work-package.yaml` or `15-codebase-comprehension.yaml` | Triage rendered in `review-summary` output (and thus `resources/review-mode.md` format) | rating-cap ↔ review-summary render: the cap must reach the Overall Rating in `review-summary`; the new technique's output var must be an input the summary reads. New technique ref MUST resolve (lint baseline is empty). |
| 2 | `review-code.md` (and/or `review-diff.md`) — mandatory associated-type / trait-impl swap blast-radius sub-check when a `Config` binding changes | new §/sub-check in `review-code.md` Protocol | feeds `findings-classification` via the code-review findings subset | severity axes ↔ needs_code_fixes: a config-swap finding must classify ≥ Minor to set `needs_code_fixes`. |
| 3 | Lifecycle/conservation ledger — all producers vs all clearers, set-wide coverage | structural lens (`prism/structural-analysis.md`) bug-table/conservation section, and/or `review-code` structural sub-check; consumed via `11-validate.yaml` | unmatched creation ⇒ finding | conservation ledger ↔ validate: validate reads structural findings through `findings-classification`; the ledger's "unmatched create" must surface as a classifiable finding. |
| 4 | `findings-classification.md` §1 — impact-based severity axes (unbounded state growth, economic/spam, liveness/halt, migration/upgrade); correct-but-harmful ⇒ Major+ and sets `needs_code_fixes` | `findings-classification.md` §1 "Classify Findings" + new output coupling | propagates to validate, post-impl-review, submit-for-review; rendered in `review-summary` | severity axes ↔ needs_code_fixes gate (existing rule: ≥ Minor sets flag — Major+ already qualifies); rating render must not downgrade (see scale divergence above). |
| 5 | `11-validate.yaml` + `review-test-suite.md` — reported-failure triage (every PR-thread runtime error traced to code path + state precondition) + multi-instance coverage gate (untested instances auto-flagged; mock-masked branch escalates the harness as a finding) | `review-test-suite.md` new §, and a validate step that triages reported failures | findings into the review summary | reported-failure triage overlaps augmentation 1 (prior PR-thread comments) — coordinate so a reported runtime error from a PR thread is ingested once (augmentation 1) and traced (augmentation 5) without double-counting. |

### Invariant Alignment

| Invariant | Producer enforces? | Consumer assumes? | Gap |
|-----------|--------------------|--------------------|-----|
| Every created storage record has a matching clearer on every path | NO — structural lens currently does L12 conservation conceptually but no explicit producer/clearer ledger | validate/summary assume structural findings cover it | **The original #145 defect** — augmentation 3 closes it |
| Correct-but-harmful change is rated above "safe" | NO — `findings-classification` judges by impact in prose but has no axis for unbounded growth | `review-summary` renders whatever severity it gets | augmentation 4 closes it |
| Prior external reviewer warnings are ingested before verdict | NO — `respond-to-pr-review` only handles the own PR's post-posting feedback | verdict assumes all signal considered | augmentation 1 closes it |
| Every reported runtime failure / untested variant becomes a finding | PARTIAL — `review-test-suite` does diff-aware coverage but no reported-failure triage / multi-instance gate | summary assumes failures surfaced | augmentation 5 closes it |

### Execution Context

- The five augmentations are authored as definition-layer edits only (no server `src/`/`schemas/` changes — confirmed by DP-2).
- The deterministic E2E walk drives review mode via the `review-mode` policy (`tests/e2e/policies.ts`, `initialVariables: { is_review_mode: true }`, choice `workflow-path-selected: skip-optional`).

### Operational Scenarios (harness impact of edits)

| Scenario | Effect on this path | Risk |
|----------|---------------------|------|
| Add a new review-only step (gated `== true`) | Appears in the `[review-mode]` snapshot `stepsExecuted`; standard-mode snapshots unchanged | Snapshot baseline drift — must regenerate with `npx vitest run tests/e2e -u` intentionally |
| Add a new technique file (e.g. `review-existing-feedback.md`) | Server must resolve its ref on the review-mode walk | **Lint gate** `BASELINE_UNRESOLVED = []` — any unresolved ref fails. Ref must be bare (activity-group / current-workflow fallback) or qualified correctly. |
| New declared artifact output | Robot-execution writes a stub; appears in `artifactsWritten` | 3c manifest + snapshot drift — update baselines |
| Change `findings-classification` axes | All 3 call sites inherit | Branch-matrix (`workflow-e2e.test.ts`) must still reach `complete`; severity render must stay coherent |

---

## Domain Concept Mapping

### Glossary

| Domain term | Technical construct | Description |
|-------------|---------------------|-------------|
| Review mode | `is_review_mode` boolean + conditions | adapts work-package for reviewing an existing PR |
| Verdict / Overall Rating | `review_summary` Executive Summary (Approve / Request Changes / Comment Only) | the review's bottom line, rendered from `resources/review-mode.md` |
| Routing flag | `needs_code_fixes` / `needs_test_improvements` | set by `findings-classification`; gates the post-impl review-fix loop (standard mode) |
| Conservation law | L12 lens concept in `prism/structural-analysis` | the structural invariant the change set must preserve — host for the producer/clearer ledger |
| Blast radius | gitnexus `detect-changes` + `impact upstream` in `review-code` §2 | callers/processes a change touches; sets severity ceiling |
| Config binding swap | (augmentation 2) | a `Config` associated-type / trait-impl change that silently re-governs untouched code |
| Triage (Confirmed/Refuted/Superseded) | (augmentation 1) | disposition of each prior PR comment before verdict |

### Domain Model

The review-mode path is a pipeline of evidence-gathering techniques (diff → code → structural → tests → validation) whose findings funnel into one classifier (`findings-classification`) and one renderer (`review-summary`). The five augmentations each strengthen one stage of that pipeline; their coupling is through the shared classifier's severity semantics and the shared renderer's format.

---

## Schema / Binding Constraints to Respect (for the edit phase)

- **Bound-step purity (AP-64)**: steps are `id` + `technique` + structural only — **no `name`/`description`** on technique steps. Deviations (`step.technique.inputs/outputs`) carry only what differs from same-name binding / defaults.
- **Activity-group shorthand**: a bare op id resolves to `<activity>::op` first; otherwise current-workflow standalone/group-base, then fails. Foreign groups (e.g. `prism/…`, `meta` layer) are written qualified.
- **Signature is the contract**: every `{name}` a protocol reads is a declared input (or has a `default`); every emitted value is a declared output. A new technique (augmentation 1) must declare its inputs/outputs and inherit `techniques/TECHNIQUE.md` base (the 6 common inputs).
- **Qualified identifiers (AP-60)**: ids are qualified noun phrases, no bare single words.
- **Generic-not-overfit / canonical rename**: align a caller's bag variable to the operation's canonical input id; bridge with a per-call rename only as a last resort.
- **Lint baseline is empty** (`BASELINE_UNRESOLVED = []`): every operation/technique ref on every policy walk must resolve.
- **Snapshot + robot baselines** must be regenerated intentionally when steps/artifacts change (`npx vitest run tests/e2e -u`); the branch-matrix (`workflow-e2e.test.ts`) must keep all 6 policies reaching `complete`.
- **Technique markdown structure**: `## Capability / ## Inputs / ## Protocol / ## Outputs / ## Rules`; grouped subfolders inherit `TECHNIQUE.md`.
- **Documentation voice**: definition prose describes the system as-is (no "now/previously/deprecated"); evolution narration belongs only in planning artifacts.

---

## Open Questions

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| 1 | Where does augmentation 1's new technique bind — `01-start-work-package` (review-mode branch) or `15-codebase-comprehension`? | Open (planning decision) | Both are on the review-mode walk; start-work-package already owns PR capture (`review-mode-detection`), making it the more natural ingest point, but comprehension is where prior-feedback context would inform investigation. Defer to plan-prepare. | Data Flow Map #1 |
| 2 | Does the conservation ledger (aug 3) live in `prism/structural-analysis` (lens, shared across workflows) or as a `review-code` sub-check local to work-package? | Open (planning decision) | The lens already encodes "conservation law" — extending it is generic; but editing the shared prism technique affects other workflows. A work-package-local `review-code` sub-check is lower-blast-radius. Trade-off to weigh in planning. | Structural Pass |
| 3 | Are the three severity scales unified, or is Major mapped to High only at the `review-summary` render boundary? | Open (planning decision) | `findings-classification` is the only scale with "Major"; `review-summary`/`review-mode.md` use High. Unifying is cleaner but touches more files; a render-time map is contained. | Severity-scale divergence |
| 4 | How is double-counting avoided between aug 1 (prior PR comments) and aug 5 (reported runtime failures from PR threads)? | Open (planning decision) | A reported runtime error in a PR thread is both "prior feedback" (ingest/rebut) and "reported failure" (trace to code path). Coordinate so it is ingested once and traced once. | Data Flow Map #5 |
| 5 | Does `11-validate.yaml` gain a new step for reported-failure triage, or does it stay inside `review-test-suite` invoked by `assess-test-coverage`? | Open (planning decision) | Prompt names both `11-validate.yaml` and `review-test-suite.md` for aug 5; the multi-instance gate fits `review-test-suite`, the reported-failure triage may warrant a dedicated validate step gated `is_review_mode == true`. | Data Flow Map #5 |

### Remaining follow-up items (out of scope)

- Unifying the project-wide severity vocabulary across *all* techniques (beyond the review path) — broader than #145.
- The pre-existing 6 step-unbound (situational) checkpoints and the `elicitation-only` routing-through-research note recorded in the E2E README — not touched by these augmentations.

---
*This artifact is part of a persistent knowledge base. It is augmented across
successive work packages to build cumulative codebase understanding.*
