# Work Package: Review-Mode Hardening — Config-Change & Interaction Defects - Complete ✅

**Date:** 2026-07-01
**Type:** Enhancement
**Status:** DELIVERED — PR open, awaiting merge (see Status note)
**Branch:** feat/145-review-mode-harden-config-defects
**PR:** [#147](https://github.com/m2ux/workflow-server/pull/147)
**Issue:** [#145](https://github.com/m2ux/workflow-server/issues/145)

> **Status note.** This document records the final delivered state of the work. At close-out, PR #147 is **OPEN and not yet merged** (`mergeStateStatus: BLOCKED`, `mergedAt: null`). The feature branch is fully committed and pushed (`4f72a20b`, `c6e10666`, `2c2b9e94`). Per the completion-timing rule, this captures what was built, tested, and deferred; the merged-status flip and the coordinated baseline regeneration are recorded as deferred follow-ups below and are performed when the PR merges.

---

## Summary

Hardened the `work-package` workflow's review-mode path so it catches a class of defect that slipped through a real review: a one-line `Config` change that is locally correct but globally harmful (unbounded orphan-storage growth on every routine governance close). The change delivers five coordinated definition-layer augmentations — ingest-and-rebut existing PR feedback, a config-change blast-radius trace, a producer/clearer conservation ledger, an impact-based severity axis, and a reported-failure triage plus multi-instance coverage gate — across one new technique, four edited techniques, one shared lens, one resource, and two activity definitions. No server source (`src/`, `schemas/`) changed.

---

## What Was Implemented

### Task 1: Reconcile severity vocabulary across classifier and render boundary (aug 4 core) ✅
**Deliverables:**
- `work-package/techniques/findings-classification.md` §1 — impact-based severity axes (unbounded state growth, economic/spam, liveness/halt, migration/upgrade) orthogonal to code-correctness; correct-but-harmful ⇒ Major/Critical + sets `needs_code_fixes`.
- `work-package/resources/review-mode.md` Severity Definitions — documented Major→High / Minor→Medium / Nit→Low render map (DD-1).

### Task 2: Config associated-type / trait-impl swap blast-radius sub-check (aug 2) ✅
**Deliverables:**
- `work-package/techniques/review-code.md` §2 — a `Config` impl / associated-type change triggers a mandatory upstream-lifecycle trace over unchanged callers; delegates the set-wide balance walk to the structural ledger (DD-2 dedup, per the lean-coding audit).

### Task 3: Producer/clearer conservation ledger in the structural lens (aug 3) ✅
**Deliverables:**
- `prism/techniques/structural-analysis.md` — Conservation Law / Bug Table extended to require a written ledger of all producers vs all clearers, proving set-wide balance on every path; purely additive (no signature change, preserves cross-workflow bindings).

### Task 4: NEW technique `review-existing-feedback.md` (aug 1) ✅
**Deliverables:**
- `work-package/techniques/review-existing-feedback.md` — ingest ALL prior PR comments/reviews (human + bot) before independent analysis; build a Confirmed/Refuted/Superseded triage table; emit `prior_feedback_triage` artifact + a `rating_cap` output that caps the Overall Rating on an unaddressed external blocker. Single ingest of reported failures (DD-4).

### Task 5: Wire aug 1 into review-mode branch of start-work-package ✅
**Deliverables:**
- `work-package/activities/01-start-work-package.yaml` — bound-pure `ingest-prior-feedback` step (AP-64), placed after PR capture, gated `is_review_mode == true`; resolves via activity-group shorthand.

### Task 6: Reported-failure triage in validate + multi-instance coverage gate (aug 5) ✅
**Deliverables:**
- `work-package/activities/11-validate.yaml` — `triage-reported-failures` step gated `is_review_mode == true`, consuming aug 1's `prior_feedback_triage` (no re-scrape, DD-4).
- `work-package/techniques/review-test-suite.md` — multi-instance coverage gate; a mock-masked unreachable branch escalates the HARNESS as a finding (not a default-Medium nit).

### Task 7: Render existing-feedback triage + rating cap in review-summary (aug 1 render) ✅
**Deliverables:**
- `work-package/resources/review-mode.md#consolidated-review-format` — Prior Feedback Triage section; documented rating cap.
- `work-package/techniques/review-summary.md` — `prior_feedback_triage` + `rating_cap` declared inputs; protocol renders the triage section and applies the cap.

### Task 8: Regenerate E2E baselines + verify 3-layer harness ⚠️ Partially deferred
**Delivered in-branch:** definition-lint green (`BASELINE_UNRESOLVED = []`), 6-policy `workflow-e2e` matrix reaches `complete`, typecheck clean, snapshot diff inspected and confirmed to contain only the two intended review-mode step additions plus a pre-existing AP-43 artifact-declaration spill.
**Deferred:** committing the regenerated `[review-mode]` snapshot + robot manifest — the baseline lives in the SERVER repo, not PR #147 (see Deferred Items).

---

## Test Results

The change set is workflow-definition-layer only; no unit tests are added (there is no source code). The test surface is the 3-layer E2E harness in the server repo. Results recorded from the [validation report](11-validation.md) (harness run against feature definitions via a reversible detached checkout, restored afterward):

| Layer | Source | Result |
|-------|--------|--------|
| Definition lint | `tests/e2e/definition-lint.test.ts` | ✅ PASS — `BASELINE_UNRESOLVED = []`; every new/edited ref resolves on every policy walk |
| Deterministic walk (6-policy matrix) | `tests/e2e/workflow-e2e.test.ts` | ✅ PASS — all 6 policies reach `complete`, review-mode included |
| Snapshot | `tests/e2e/snapshot.test.ts` | ⚠️ 6 EXPECTED diffs (intended review-mode step additions + pre-existing AP-43 spill); no standard-mode `stepsExecuted` regression |
| Typecheck | `tsc --noEmit` | ✅ PASS — clean (no server `src/` changed) |

**Test Summary:**
- ✅ Definition-lint clean; every technique/activity ref resolves.
- ✅ 6/6 workflow-e2e policies reach terminal `complete`.
- ⚠️ Snapshot baseline diff is expected and gated to the coordinated regeneration follow-up.

See the finalized [test plan](06-test-plan.md) for per-case source links and acceptance detail.

---

## Files Changed

Definition-layer only, in the `workflows` submodule (paths submodule-relative). `+188 / −3` (excluding pre-existing base-ref noise).

**New Files (1):**
- `work-package/techniques/review-existing-feedback.md` — aug 1 ingest-and-rebut technique.

**Modified Files (8):**
- `prism/techniques/structural-analysis.md` — producer/clearer conservation ledger (aug 3).
- `work-package/activities/01-start-work-package.yaml` — `ingest-prior-feedback` step binding (aug 1).
- `work-package/activities/11-validate.yaml` — `triage-reported-failures` step binding (aug 5).
- `work-package/resources/review-mode.md` — Severity render map + Prior Feedback Triage section (augs 1, 4).
- `work-package/techniques/findings-classification.md` — impact-based severity axes (aug 4).
- `work-package/techniques/review-code.md` — Config blast-radius sub-check (aug 2).
- `work-package/techniques/review-summary.md` — triage + rating-cap render inputs (aug 1).
- `work-package/techniques/review-test-suite.md` — multi-instance coverage gate (aug 5).

---

## Success Criteria Results

| Criterion | Target | Actual | Status |
|-----------|--------|--------|--------|
| Prior feedback ingested + triaged before verdict; rating cap | Implemented | `review-existing-feedback` + render cap (Tasks 4,5,7) | ✅ Met |
| Config/type swap triggers upstream-lifecycle trace | Implemented | `review-code` §2 sub-check (Task 2) | ✅ Met |
| Producer/clearer ledger; unmatched create → finding | Implemented | structural-analysis ledger (Task 3) | ✅ Met |
| Correct-but-harmful ≥ High, not downgraded | Implemented | impact axis + Major→High render map (Tasks 1,7) | ✅ Met |
| Reported-failure triage + multi-instance gate | Implemented | validate triage + review-test-suite gate (Task 6) | ✅ Met |
| `definition-lint` `BASELINE_UNRESOLVED = []` | `[]` | `[]` | ✅ Met |
| 6 `workflow-e2e` policies reach `complete` | 6/6 | 6/6 | ✅ Met |
| Standard-mode snapshots unchanged | No regression | No standard-mode `stepsExecuted` change | ✅ Met |

---

## What Was NOT Implemented

- ❌ **Committed `[review-mode]` snapshot + robot-manifest baseline regeneration** — Deferred: the baseline (`tests/e2e/__snapshots__/snapshot.test.ts.snap`) lives in the SERVER repo, not in PR #147 (which targets the `workflows` orphan branch). Requires a coordinated server-repo change after #147 merges (see Deferred Items).
- ❌ **Project-wide severity-vocabulary unification beyond the review path** — Out of scope for #145 (follow-up item; DD-1 bridges the two live scales with a documented render map instead).
- ❌ **Server source / schema changes** — Out of scope; confirmed definition-layer-only (comprehension DP-2). Review mode is state-driven, no engine change needed.

---

## Known Limitations & Caveats

- ⚠️ **Runtime step-order dependency is placement-enforced, not schema-enforced** — `ingest-prior-feedback` must sit after `review-mode-detection` populates `review_pr_url`/`pr_number` in `01-start-work-package.yaml`. Correct as authored; a future reorder could silently break the ordering (SA-1, Informational).
- ⚠️ **Two severity vocabularies coexist** — `findings-classification` (Critical/Major/Minor/Nit/Informational) remains the canonical classification scale; `review-mode.md`/`review-summary` (Critical/High/Medium/Low) is the render scale. A documented Major→High/Minor→Medium/Nit→Low map bridges them (DD-1). Reclassification correctness depends on that map staying in sync.
- ⚠️ **Behavioral acceptance is agent-verified, not auto-asserted** — the definition techniques' semantic behavior (triage tables, ledger, rating cap) is validated by the agent at execution time and by inspecting the walk, consistent with every other technique in this workflow; the deterministic harness asserts ref-resolution + walk-completeness, not technique semantics.

---

## Design Decisions

Recorded in full in the [work package plan](06-work-package-plan.md) (DD-1…DD-5). Summary:

### DD-1: Reconcile severity by render-time mapping, not a full rename
**Decision:** Keep `findings-classification`'s scale canonical; add a documented Major→High map in the authoritative `review-mode.md` resource.
**Rationale:** Contained; preserves the three-call-site `needs_code_fixes` = "≥ Minor" routing semantics; avoids regressing the post-impl review-fix loop. **Alternatives:** full rename (rejected — broader than #145, regression risk).

### DD-2: Conservation ledger extends the shared `prism` lens, not a work-package-local fork
**Decision:** Add the producer/clearer ledger to `prism/structural-analysis.md`.
**Rationale:** The lens already encodes "Conservation Law" + Bug Table; additive extension benefits every consuming workflow and keeps the concept single-sourced. The lean-coding audit later used this to dedup aug-2's restated walk down to a pointer.

### DD-3 / DD-4: Aug 1 binds after PR capture; single ingest of reported failures
**Decision:** `ingest-prior-feedback` binds in `01-start-work-package.yaml` after `review-mode-detection`; aug 5 consumes aug 1's triage rather than re-scraping the thread.
**Rationale:** Keeps ingest strictly before analysis; a thread-reported runtime error is ingested once and traced once (no double-count).

### DD-5: Aug 5 split — dedicated validate triage step + coverage gate in review-test-suite
**Rationale:** Failure-triage (reasons over the PR thread + state preconditions) is distinct from coverage; splitting keeps each concern gate-able and snapshot-able.

---

## Lessons Learned

### What Went Well
- Sequencing leaves-before-callers (settle severity vocabulary first, producers next, wiring, render, baselines last) meant each augmentation bound against a settled contract; the 6-policy matrix stayed green throughout.
- The lean-coding audit caught a genuine aug-2/aug-3 procedural duplication and collapsed `review-code`'s restated conservation walk to a pointer at the canonical ledger — the one material leanness win, applied without behavior change.
- Treating the change as "one defect-class remediation decomposed into five coupled edits" (not five independent features) kept the render boundary coherent — the original defect was precisely a render-time downgrade, and DD-1 closed it at the authoritative owner.

### What Could Be Improved
- The E2E baseline living in a different repo from the definition change (server repo vs `workflows` orphan branch) forces a coordinated two-repo follow-up to regenerate the snapshot. A single-repo baseline, or a documented cross-repo regeneration runbook, would remove this seam.
- Validation required a reversible detached-checkout dance in the main-checkout `workflows` dir because the harness resolves definitions from the working tree. A harness flag to point at an arbitrary definitions path would make cross-branch validation first-class instead of manual.

---

## Deferred Items (coordinated follow-up)

**Baseline regeneration + submodule pointer bump (after #147 merges):**
A coordinated server-repo change must, together:
1. Bump the `workflows` submodule pointer to the merged commit of #147.
2. Regenerate the `[review-mode]` baseline in `tests/e2e/__snapshots__/snapshot.test.ts.snap` and the robot-execution manifest via `npx vitest run tests/e2e -u`, reviewing the diff so only review-mode entries change.

In-branch validation already confirmed definition-lint clean (`BASELINE_UNRESOLVED = []`) and all 6 `workflow-e2e` policies reaching `complete`; the regeneration is a mechanical baseline refresh, not a behavior change. This is tracked, not silent.

---

**Status:** ✅ DELIVERED AND VALIDATED IN-BRANCH — awaiting PR #147 merge + coordinated baseline follow-up
