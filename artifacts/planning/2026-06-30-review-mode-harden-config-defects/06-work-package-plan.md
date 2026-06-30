# Review-Mode Hardening: Config-Change & Interaction Defects - Implementation Plan

**Date:** 2026-06-30
**Priority:** HIGH
**Status:** Ready
**Estimated Effort:** 4-6h agentic + 2h review

---

## Overview

### Problem Statement

The `work-package` workflow's review-mode path judges a PR by reading the proposed change in isolation — does the newly written line look correct? That frame let a real, merge-rated defect through: a single-line `Config` change that was locally correct but globally harmful (it silently re-governed untouched code and leaked storage on every routine governance close). Five gaps combined: prior reviewer feedback was never ingested, the config blast-radius was never traced, no lifecycle/conservation ledger proved every created record is cleared, the severity model had no "correct-but-harmful" axis, and reported runtime failures / untested variants were silently downgraded. This plan hardens the review-mode path against all five so the class of defect cannot pass un-flagged again.

### Scope

**In Scope:**
- One NEW technique (`review-existing-feedback.md`) and edits to four existing techniques (`review-code.md`, `review-test-suite.md`, `findings-classification.md`, plus the shared `prism/structural-analysis.md` lens), one resource (`resources/review-mode.md`), and two activity definitions (`01-start-work-package.yaml`, `11-validate.yaml`).
- Wiring (step bindings) so every new technique ref resolves on the review-mode walk and the new findings reach the `review-summary` render boundary.
- Severity-scale reconciliation across `findings-classification` / `review-code` / `review-mode.md` so a reclassified finding is not downgraded at render.
- Intentional regeneration of the E2E `[review-mode]` snapshot + robot baselines; keep `definition-lint` (`BASELINE_UNRESOLVED = []`) green and all 6 `workflow-e2e` policies reaching `complete`.

**Out of Scope (with reasons):**
- Unifying the project-wide severity vocabulary across *all* techniques beyond the review path — broader than #145 (follow-up item).
- TypeScript server source (`src/`, `schemas/`) — confirmed definition-layer-only by the comprehension (DP-2); no engine change is needed for a state-driven mode.
- The 6 pre-existing situational (step-unbound) checkpoints and the `elicitation-only` routing note — untouched by these augmentations.

---

## Research & Analysis

*See companion planning artifacts for full details:*
- **Comprehension:** `/home/mike1/projects/main/workflow-server/.engineering/artifacts/comprehension/review-mode-path.md` (binding points, constraints, invariant-alignment table)
- **Portfolio synthesis:** `…/comprehension/portfolio-synthesis.md` (convergent invariants to restore; hazards while restoring)
- **Design philosophy:** `02-design-philosophy.md` (Inventive Prevention; Complex; skip-optional path)

### Key Findings Summary

**From comprehension (binding points confirmed):**
- Review mode is a **scattered boolean-gated path**, not a localized feature — every review-only addition must be hosted on an activity already on the review-mode walk and gated `is_review_mode == true`.
- `findings-classification` is **bound at three call sites** (`post-impl-review::classify-and-route-findings`, `11-validate::document-failures`, `13-submit-for-review::consolidate-review-findings`) — any severity-axis change propagates to all three.
- **Three divergent severity scales are live** (the load-bearing constraint): `findings-classification` = Critical/Major/Minor/Nit/Informational; `review-code` = critical/high/medium/low/informational; `resources/review-mode.md` Severity Definitions + `review-summary` = Critical/High/Medium/Low. A reclassification in `findings-classification` is silently downgraded unless the render boundary is reconciled.
- The structural lens (`prism/structural-analysis.md`, shared across workflows) already names a **"Conservation Law"** and a **Bug Table** — the natural host for aug 3's producer/clearer ledger, but it is a foreign/shared technique (blast-radius beyond work-package).
- `review-summary` renders **strictly** from `resources/review-mode.md#consolidated-review-format`; the resource owns the format. The Overall Rating (Approve / Request Changes / Comment Only) lives in that rendered summary, and review-type selection maps Critical/High → `--request-changes`.

**From design philosophy:**
- Classification: Inventive / Prevention + Improvement, Complex. Cause is known; the remedy is five coordinated cross-file augmentations that must compose without regressing the path.

### Confirmed inputs (for downstream tasks)
- `branch_name = feat/145-review-mode-harden-config-defects`
- `pr_number = 147` (`https://github.com/m2ux/workflow-server/pull/147`)
- `target_path = /home/mike1/projects/work/workflow-server/2026-06-30-review-mode-harden-config-defects` (subdir `work-package/`)
- E2E baselines live in the server repo at `/home/mike1/projects/main/workflow-server/tests/e2e/`.

---

## Proposed Approach

### Solution Design

Treat the five augmentations as **one defect-class remediation decomposed into five edits whose coupling is the load-bearing concern** (portfolio finding #9). Sequence the work so the shared severity vocabulary is settled *first* (it sits at the junction of augs 1, 3, 4 and everything renders through `review-summary`), then add the producing techniques (which depend on the settled scale), then wire bindings, then render, then regenerate baselines. Each new producer must (a) declare a complete signature and inherit `techniques/TECHNIQUE.md`, (b) bind on an activity already on the review-mode walk gated `is_review_mode == true`, (c) emit a finding that classifies ≥ the routing threshold so it reaches the summary, and (d) render coherently at the `review-mode.md` boundary without downgrade.

### Key design decisions

**DD-1 — Severity scale: reconcile by render-time mapping, formalized in the resource (not a full rename).**
`findings-classification` is the only scale carrying **Major** and is reused at three call sites; `review-mode.md`/`review-summary` use **High**. Renaming every scale to one vocabulary touches more files and risks regressing the post-impl review-fix routing semantics (`needs_code_fixes` = ≥ Minor). Instead: keep `findings-classification`'s Critical/Major/Minor/Nit/Informational as the canonical classification scale, and add an explicit, documented **Major→High / Minor→Medium / Nit→Low mapping** to `resources/review-mode.md` Severity Definitions (the authoritative render owner), so a reclassified "correct-but-harmful ⇒ Major+" finding renders as High (merge-blocker-recommended) rather than being dropped. `review-code`'s lowercase critical/high/medium/low/informational already aligns to the render scale and stays as-is. This is the contained, generic-not-overfit resolution.

**DD-2 — Conservation ledger (aug 3): extend the shared `prism/structural-analysis.md` lens, not a work-package-local fork.**
The lens already encodes "Conservation Law" + a fixable/structural Bug Table; adding an explicit **producer/clearer ledger** (every creation site vs every clearing site, set-wide, per path) extends an existing concept generically and benefits every workflow that uses the lens, rather than inventing a duplicate concept local to work-package. The blast-radius is acceptable because the addition is purely additive to the lens protocol/output (no signature break); the existing structural-analysis output already lands in `post-impl-review` via `structural-analysis-inline`, and validate consumes structural findings through `findings-classification` — so an "unmatched create" already has a path to a classifiable finding.

**DD-3 — Aug 1 binds in `01-start-work-package.yaml` review-mode branch, after PR capture.**
start-work-package already owns PR capture (`review-mode-detection` → `review_pr_url`/`pr_number`), so it is the natural ingest point for "read ALL prior PR comments before independent analysis." Binding here (rather than `15-codebase-comprehension`) keeps the ingest strictly before any analysis activity and avoids editing the optional comprehension activity. The technique emits a `prior_feedback_triage` artifact + a `rating_cap` output that `review-summary` reads to cap the Overall Rating.

**DD-4 — Double-count avoidance between aug 1 and aug 5.**
A runtime error reported in a PR thread is both "prior feedback" (aug 1 ingests/rebuts it) and "reported failure" (aug 5 traces it to a code path). Resolve by making aug 1 the **single ingest** that produces the triage table, and aug 5's reported-failure triage **consumes** the ingested reported-failure entries (keyed off the same `prior_feedback_triage` artifact) rather than re-scraping the thread — traced once, ingested once.

**DD-5 — Aug 5 split: dedicated validate step for reported-failure triage; multi-instance gate inside `review-test-suite`.**
The reported-failure triage warrants a dedicated `11-validate.yaml` step gated `is_review_mode == true` (it reasons over the PR thread + state preconditions, distinct from coverage). The multi-instance / mock-masked-branch gate is a coverage concern and fits inside `review-test-suite.md` (already bound in validate as `assess-test-coverage` and in post-impl-review as `test-suite-review`).

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Render-time severity map formalized in resource (DD-1) | Contained; preserves routing semantics; one authoritative owner | Two vocabularies coexist (documented map bridges them) | **Selected** |
| Full severity-scale rename to one vocabulary | Single vocabulary | Touches all 3 techniques + render; risks `needs_code_fixes` regression; broader than #145 | Rejected |
| Conservation ledger as work-package-local `review-code` sub-check | Lower blast-radius | Duplicates the lens's existing "Conservation Law"; non-generic; misses other workflows | Rejected (DD-2) |
| Aug 1 binds in `15-codebase-comprehension` | Prior feedback informs investigation | Comprehension is optional/skipped on this path; ingest could land after analysis starts | Rejected (DD-3) |
| Reuse `respond-to-pr-review` for aug 1 | Existing technique | Different contract — it handles the OWN PR's post-posting feedback, not ingest-before-verdict (tempting-but-wrong path, portfolio #4) | Rejected |
| One mega validate step for all of aug 5 | Single step | Conflates failure-triage with coverage; harder to gate/snapshot | Rejected (DD-5) |

### Assumptions

- `is_review_mode == true` is the sole gate for every new review-only step; standard-mode walks are unperturbed (verified by keeping standard-mode snapshots unchanged). *(Assumptions-log: Scope Decisions)*
- `review_pr_url` / `pr_number` are populated by `review-mode-detection` before the aug-1 ingest step runs. *(Dependency Assumptions)*
- Adding axes to `findings-classification` keeps `needs_code_fixes` = "≥ Minor" coherent (Major+ already qualifies), so the post-impl review-fix loop semantics are unchanged. *(Design Approach)*
- The shared `prism/structural-analysis.md` edit is purely additive (no input/output signature change), so no other workflow's binding breaks. *(Dependency Assumptions)*
- `definition-lint` `BASELINE_UNRESOLVED` stays `[]`: every new `group::operation` ref resolves via activity-group shorthand / current-workflow fallback. *(Test Strategy)*

---

## Implementation Tasks

> Ordered leaves-before-callers: settle the shared severity vocabulary and the classifier first (everything renders/routes through it), then the producing techniques, then the wiring that binds them, then the render boundary, then baseline regeneration last (it observes the finished walk).

### Task 1: Reconcile severity vocabulary across the classifier and render boundary (aug 4 core)
**Goal:** Settle the shared scale before any producer depends on it. Implements DD-1.
**Deliverables:**
- `work-package/techniques/findings-classification.md` §1 "Classify Findings" — add **impact-based severity axes orthogonal to code-correctness**: unbounded state growth, economic/spam, liveness/halt, migration/upgrade. Add the rule that a **correct-but-harmful** change (e.g. storage leak on a routine action) classifies **Major or Critical** and sets `needs_code_fixes`. Add a new output coupling so the impact axis is carried on each finding. Keep the Critical/Major/Minor/Nit/Informational scale and the "≥ Minor routes" semantics.
- `work-package/resources/review-mode.md` Severity Definitions — add the documented **Major→High, Minor→Medium, Nit→Low** render mapping so a reclassified finding renders above "safe" (High = should-fix-before-merge) instead of being downgraded. Keep the resource as the authoritative format owner.
- Documentation voice: describe the axes/mapping as the system as-is (no "now/previously").

### Task 2: Config associated-type / trait-impl swap blast-radius sub-check (aug 2)
**Goal:** Make a `Config` impl / associated-type change trigger a mandatory upstream-lifecycle trace.
**Deliverables:**
- `work-package/techniques/review-code.md` Protocol — add a sub-check to §2 (Bound Review Scope, already does gitnexus `detect-changes` + `impact upstream`): **when a diff changes a `Config` impl or associated type**, enumerate every upstream read/write site keyed on that type and verify the full state lifecycle (creation + every termination path) stays balanced, *including unchanged upstream code*. A detected imbalance is a finding that must classify ≥ Minor (so it sets `needs_code_fixes` per Task 1's scale) and, when it causes unbounded growth, Major+ via the new impact axis.
- Keep `review-code`'s lowercase severity vocabulary (aligns to the render scale via DD-1).

### Task 3: Producer/clearer conservation ledger in the structural lens (aug 3)
**Goal:** Prove set-wide creation↔cleanup balance, not just the diff's path. Implements DD-2.
**Deliverables:**
- `prism/techniques/structural-analysis.md` — extend the Conservation Law / Bug Table sections to require a **written ledger of all producers vs all clearers of a resource**, proving set-wide coverage; "no new bug" is valid only if the invariant holds on **every producing path**. An unmatched creation surfaces as a Bug-Table finding (classified, so it reaches `findings-classification`). Purely additive to protocol/output — no signature change (preserves cross-workflow bindings per DD-2 assumption).

### Task 4: NEW technique `review-existing-feedback.md` (aug 1)
**Goal:** Ingest and rebut ALL prior PR feedback before independent analysis; cap the rating on an unaddressed external blocker. Implements DD-3/DD-4.
**Deliverables:**
- `work-package/techniques/review-existing-feedback.md` — new technique inheriting `techniques/TECHNIQUE.md` (the 6 common inputs). Declares: **Inputs** (`review_pr_url`, `pr_number` from the bag; plus the inherited common set), **Protocol** (ingest ALL existing PR comments + reviews — human + bot — via `gh pr view --json comments,reviews` plus `gh api .../pulls/{n}/comments` for inline threads, BEFORE independent analysis; build a **triage table** marking each prior finding **Confirmed / Refuted / Superseded** with reasoning), and **Outputs**: a `prior_feedback_triage` artifact (the triage table) and a `rating_cap` output (an unaddressed external blocker-class comment caps the Overall Rating so it **cannot** be "Comment Only / no blocker"). Reported runtime errors in the thread are captured here once and consumed by aug 5 (DD-4) — no re-scrape.
- `## Capability / ## Inputs / ## Protocol / ## Outputs / ## Rules` structure; qualified-identifier ids; documentation voice.

### Task 5: Wire aug 1 into the review-mode branch of start-work-package (binding)
**Goal:** Make `review-existing-feedback` execute on the review-mode walk, after PR capture, and resolve in lint. Implements DD-3.
**Deliverables:**
- `work-package/activities/01-start-work-package.yaml` — add a bound-pure technique step (id + technique only, AP-64) referencing `review-existing-feedback`, placed after `capture-pr-reference` / `review-pr-reference` (so `review_pr_url`/`pr_number` exist), gated `condition: is_review_mode == true`. Use activity-group shorthand / current-workflow ref so the bare technique id resolves (lint `BASELINE_UNRESOLVED` stays `[]`). Declare any new artifact output so robot-execution writes its stub.

### Task 6: Reported-failure triage step in validate + multi-instance coverage gate in review-test-suite (aug 5)
**Goal:** Every reported runtime error becomes a traced finding; untested instance-generic variants auto-flag; a mock-masked branch escalates the HARNESS as a finding. Implements DD-4/DD-5.
**Deliverables:**
- `work-package/activities/11-validate.yaml` — add a **reported-failure-triage** technique step gated `is_review_mode == true`: every runtime error in the PR thread (consumed from aug 1's `prior_feedback_triage`, DD-4) traced to a specific code path + state precondition (reproduced, or statically traced with triggering conditions named). Bind it to the appropriate review technique (likely `review-test-suite` via a deviation, or `review-existing-feedback`'s consumed entries) so the ref resolves; keep existing `document-failures` / `assess-test-coverage` steps.
- `work-package/techniques/review-test-suite.md` Protocol — add a **multi-instance coverage gate**: any instance of instance-generic / multi-instance code not exercised by tests is auto-flagged; a branch unreachable under the current mock **escalates the HARNESS as a finding** (not a default-Medium nit). Findings classify ≥ Minor so they route.

### Task 7: Render the existing-feedback triage and rating-cap in review-summary (aug 1 render boundary)
**Goal:** Make the triage table and the capped Overall Rating actually appear in the posted summary. Implements DD-1/DD-3.
**Deliverables:**
- `work-package/resources/review-mode.md#consolidated-review-format` — add a **Prior Feedback Triage** section (Confirmed/Refuted/Superseded table) to the template, and document that an unaddressed external blocker caps the **Overall Rating** (cannot be "Comment Only"). Keep the resource as the authoritative owner.
- `work-package/techniques/review-summary.md` — add `prior_feedback_triage` and `rating_cap` as declared **Inputs** the summary reads, and have the Protocol render the triage section + apply the cap to the Overall Rating. (Signature-is-the-contract: every `{name}` the protocol reads is a declared input.)

### Task 8: Regenerate E2E baselines intentionally and verify the 3-layer harness
**Goal:** Absorb the new review-only steps/artifacts into the `[review-mode]` baseline without regressing other policies.
**Deliverables:**
- Regenerate the `[review-mode]` `stepsExecuted` / `artifactsWritten` in `tests/e2e/__snapshots__/snapshot.test.ts.snap` and the robot-execution manifest via `npx vitest run tests/e2e -u`, reviewing the diff so only review-mode entries (new steps + new artifacts) change and standard-mode snapshots are untouched.
- Confirm `definition-lint.test.ts` still observes `BASELINE_UNRESOLVED = []` (every new `group::operation` / technique ref resolves on every policy walk).
- Confirm `workflow-e2e.test.ts` 6-policy matrix still reaches `complete` (review-mode policy especially).
- Verify README + mermaid + both review-mode docs (`work-package/REVIEW-MODE.md` and `resources/review-mode.md`) stay accurate in the worktree.

---

## Success Criteria

*Each criterion maps to one invariant the comprehension's Invariant-Alignment table says the augmentations must restore.*

### Functional Requirements
- [ ] Prior external reviewer warnings are ingested and triaged (Confirmed/Refuted/Superseded) **before** the verdict; an unaddressed external blocker caps the Overall Rating (aug 1 / Tasks 4,5,7).
- [ ] A `Config` impl / associated-type swap triggers a mandatory upstream-lifecycle blast-radius trace over unchanged callers (aug 2 / Task 2).
- [ ] The structural pass produces a written producer/clearer ledger; an unmatched creation surfaces as a classifiable finding (aug 3 / Task 3).
- [ ] A correct-but-harmful change (unbounded growth / economic / liveness / migration) classifies Major/Critical, sets `needs_code_fixes`, and renders **above "safe"** (≥ High) — not downgraded at the render boundary (aug 4 / Tasks 1,7).
- [ ] Every reported runtime failure is traced to a code path + state precondition; untested multi-instance variants auto-flag; a mock-masked branch escalates the harness as a finding (aug 5 / Task 6).

### Quality Requirements
- [ ] `definition-lint` `BASELINE_UNRESOLVED` remains `[]` (every new ref resolves).
- [ ] `[review-mode]` snapshot + robot baselines regenerated intentionally; standard-mode snapshots unchanged.
- [ ] All 6 `workflow-e2e` policies reach `complete`.
- [ ] Bound-step purity (AP-64), activity-group shorthand, qualified identifiers, signature-is-the-contract, and documentation voice honored across all edits.

### Measurement Strategy
- Run the 3-layer harness (`npx vitest run tests/e2e`) and inspect the snapshot diff to confirm only the intended review-mode steps/artifacts changed.
- Trace each augmentation's output variable to its `review-summary` render to confirm no severity downgrade and that the rating cap reaches the Overall Rating.

---

## Testing Strategy

See `06-test-plan.md` for full detail. Summary:

### Definition-lint (layer 2)
- Every new `group::operation` / technique ref on every policy walk resolves; `BASELINE_UNRESOLVED` stays `[]`.

### Deterministic walk + snapshot (layer 1)
- `[review-mode]` walk includes the new gated steps and new artifacts; standard-mode walks unchanged; 6-policy matrix reaches `complete`.

### Agent smoke-run (layer 3)
- Review-mode robot execution writes the new artifact stubs (`review-existing-feedback` output, etc.) and the manifest matches.

---

## Dependencies & Risks

### Requires (Blockers)
- [ ] `review-mode-detection` populates `review_pr_url`/`pr_number` before the aug-1 ingest step (ordering within `01-start-work-package.yaml`).
- [ ] The shared `prism/structural-analysis.md` edit stays signature-additive (no cross-workflow binding break).

### Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| New technique ref fails to resolve → lint red | HIGH | MEDIUM | Use activity-group shorthand / current-workflow ref; verify with definition-lint immediately after Task 5 |
| Severity reclassification downgraded at render (the original defect class) | HIGH | MEDIUM | DD-1 formalizes the Major→High map in the authoritative resource; Task 7 makes `review-summary` apply the cap; success-criterion explicitly checks "rated above safe" |
| Editing shared `prism` lens regresses another workflow | MEDIUM | LOW | Keep edit purely additive (no signature change); run full 6-policy matrix |
| Snapshot drift hides an unintended standard-mode change | MEDIUM | MEDIUM | Review the `-u` diff line-by-line; assert standard-mode snapshots unchanged |
| Aug 1 / aug 5 double-count a thread-reported runtime error | LOW | MEDIUM | DD-4: aug 1 is the single ingest; aug 5 consumes its entries rather than re-scraping |

---

**Status:** Ready for implementation
