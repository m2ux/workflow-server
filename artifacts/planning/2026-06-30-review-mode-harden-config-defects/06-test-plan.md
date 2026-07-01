# Review-Mode Hardening - Test Plan

**Work Package:** Review-Mode Hardening: Config-Change & Interaction Defects
**Issue:** #145
**PR:** #147
**Created:** 2026-06-30
**Finalized:** 2026-07-01 (source links added at `complete`; harness verified green in-branch — see [validation report](11-validation.md))
**Phase:** Finalized — each layer linked to its harness source file; verification results recorded

---

## Overview

The change set is workflow-definition-layer only (YAML activities + markdown techniques/resources). It is not exercised by unit tests but by the **3-layer E2E harness** in the server repo at `/home/mike1/projects/main/workflow-server/tests/e2e/`. The test strategy is therefore harness-centric: prove every new technique ref resolves, prove the review-mode walk absorbs the new gated steps without perturbing other policies, and prove the robot smoke-run writes the new artifacts.

> No formal unit tests are added — there is no source code in this change set. The skip-conditions in `create-test-plan` (documentation/definition change with existing harness coverage) apply; the harness is the test surface.

---

## Test Strategy

| Harness layer | Source file | What it proves for this work package |
|---------------|-------------|--------------------------------------|
| Definition lint (layer 2) | [`tests/e2e/definition-lint.test.ts:39`](../../../tests/e2e/definition-lint.test.ts#L39) (`BASELINE_UNRESOLVED = []`); walk at [`:49`](../../../tests/e2e/definition-lint.test.ts#L49); assertion at [`:71`](../../../tests/e2e/definition-lint.test.ts#L71) | Every `group::operation` / technique ref on every policy walk resolves; `BASELINE_UNRESOLVED` stays `[]`. The NEW `review-existing-feedback` ref and every new bound step ref must resolve. |
| Deterministic walk + snapshot (layer 1) | [`tests/e2e/snapshot.test.ts:28`](../../../tests/e2e/snapshot.test.ts#L28) (`[review-mode]` block); [`tests/e2e/workflow-e2e.test.ts:33`](../../../tests/e2e/workflow-e2e.test.ts#L33) (6-policy matrix, review-mode row) | The `[review-mode]` walk includes the new gated steps + new artifacts; standard-mode walks unchanged; the 6-policy matrix reaches `complete`. |
| Agent smoke-run (layer 3) | [`tests/e2e/robot-execution.test.ts`](../../../tests/e2e/robot-execution.test.ts) | Review-mode robot execution writes the new artifact stubs; the manifest matches the regenerated baseline. |

**Infrastructure:** Driven by [`tests/e2e/policies.ts:86`](../../../tests/e2e/policies.ts#L86) (`reviewModePolicy`, `initialVariables: { is_review_mode: true }` at [`:88`](../../../tests/e2e/policies.ts#L88), choice `workflow-path-selected: skip-optional` at [`:89`](../../../tests/e2e/policies.ts#L89)). No new fixtures/mocks needed; baselines are regenerated with `npx vitest run tests/e2e -u`.

---

## Test Cases

### Definition lint

| ID | Case | Requirement | Acceptance |
|----|------|-------------|------------|
| TL-1 | New `review-existing-feedback` ref resolves on the review-mode walk | aug 1 (Tasks 4,5) | Ref present in observed-resolved set; `BASELINE_UNRESOLVED` still `[]` |
| TL-2 | New reported-failure-triage step ref in `11-validate` resolves | aug 5 (Task 6) | Ref resolves on review-mode walk; lint green |
| TL-3 | `review-summary` reads `prior_feedback_triage` / `rating_cap` — every `{name}` is a declared input | aug 1 render (Task 7) | No binding gap; signature-is-the-contract honored |
| TL-4 | No standard-mode ref regressed | all augs | Standard-mode policy walks resolve unchanged |

### Deterministic walk + snapshot

| ID | Case | Requirement | Acceptance |
|----|------|-------------|------------|
| TW-1 | `[review-mode]` `stepsExecuted` gains exactly the new gated steps | augs 1,5 (Tasks 5,6) | Snapshot diff shows only the intended new review-only step ids |
| TW-2 | `[review-mode]` `artifactsWritten` gains the new artifacts (existing-feedback triage, etc.) | augs 1 (Tasks 4,5) | New artifact entries present; manifest matches |
| TW-3 | Standard-mode snapshots unchanged | all augs (gating) | No diff in non-review snapshot blocks |
| TW-4 | 6-policy matrix reaches `complete` | all augs | `workflow-e2e.test.ts` green for all policies, review-mode included |

### Behavioral acceptance (verified by reading the regenerated artifacts / walk, not auto-asserted)

Source column links each case to the definition-layer site that implements the behavior (paths in the `workflows` submodule at merged commit; `work-package/` and `prism/` are submodule-relative).

| ID | Case | Requirement | Source | Acceptance |
|----|------|-------------|--------|------------|
| TB-1 | Prior PR feedback ingested + triaged before verdict; unaddressed external blocker caps Overall Rating | aug 1 | `work-package/techniques/review-existing-feedback.md`; bound at `work-package/activities/01-start-work-package.yaml` (`ingest-prior-feedback` step); rendered via `work-package/techniques/review-summary.md` + `work-package/resources/review-mode.md#consolidated-review-format` | `review-existing-feedback` runs before any analysis activity; `rating_cap` reaches `review-summary` Overall Rating (cannot be "Comment Only") |
| TB-2 | `Config` swap triggers upstream-lifecycle trace over unchanged callers | aug 2 | `work-package/techniques/review-code.md` §2 (Config/associated-type sub-check, delegates walk to structural ledger per DD-2) | `review-code` §2 sub-check fires on a Config/associated-type diff; imbalance → ≥ Minor finding |
| TB-3 | Producer/clearer ledger written; unmatched creation → classifiable finding | aug 3 | `prism/techniques/structural-analysis.md` (Conservation Law / Bug Table producer/clearer ledger) | `structural-analysis` output carries the ledger; unmatched create appears in Bug Table and routes via `findings-classification` |
| TB-4 | Correct-but-harmful change classifies Major/Critical AND renders ≥ High (not downgraded) | aug 4 (Tasks 1,7) | `work-package/techniques/findings-classification.md` §1 (impact axes); render map in `work-package/resources/review-mode.md` Severity Definitions | `findings-classification` impact axis sets severity + `needs_code_fixes`; `review-mode.md` map renders Major→High |
| TB-5 | Reported runtime failure traced to code path + state precondition; mock-masked branch escalates harness as a finding | aug 5 | `work-package/activities/11-validate.yaml` (`triage-reported-failures` step); multi-instance gate in `work-package/techniques/review-test-suite.md` | validate triage step traces each thread-reported error; multi-instance gate flags untested instances; mock-masked branch is a finding, not a default-Medium nit |
| TB-6 | Thread-reported runtime error ingested once, traced once (no double-count) | DD-4 | `work-package/activities/11-validate.yaml` `triage-reported-failures` consumes `prior_feedback_triage` from `review-existing-feedback.md` | aug 5 consumes aug 1's `prior_feedback_triage` entries rather than re-scraping |

---

## Acceptance Criteria Matrix

| Requirement (success criterion) | Test case(s) |
|---------------------------------|--------------|
| Prior feedback ingested before verdict; rating cap | TB-1, TW-2, TL-1 |
| Config blast-radius / lifecycle trace | TB-2, TL-? (resolves via existing `review-code` binding) |
| Conservation ledger; unmatched create → finding | TB-3 |
| Correct-but-harmful ≥ High, not downgraded | TB-4, TL-3 |
| Reported-failure triage + multi-instance gate | TB-5, TB-6, TL-2, TW-1 |
| Harness stays green | TL-1..4, TW-1..4 |

---

## Notes

- Test-plan source links (TB-* → actual technique/activity sections; harness layers → e2e source files with line anchors) are finalized above. Definition-layer paths are submodule-relative within `workflows`; harness paths are server-repo-relative.
- Verification commands (vitest runs, lint) execute automatically via the task-cycle and final validation — they are not listed as plan tasks.

## Verification results (in-branch, 2026-07-01)

Recorded from the [validation report](11-validation.md), which ran the harness against the feature definitions via a reversible detached checkout of `2c2b9e94` in the main-checkout `workflows` dir (restored afterward):

| Layer | Case(s) | Result |
|-------|---------|--------|
| Definition lint | TL-1..4 | ✅ PASS — `BASELINE_UNRESOLVED = []`; every new/edited ref resolves on every policy walk |
| Deterministic walk | TW-4 | ✅ PASS — all 6 `workflow-e2e` policies reach `complete` (review-mode included) |
| Snapshot | TW-1..3 | ⚠️ 6 EXPECTED diffs — the two intended review-mode step additions (`ingest-prior-feedback`, `triage-reported-failures`) fire only under review mode; a pre-existing AP-43 artifact-declaration spill surfaces `prior-feedback-triage.md` in all 6 policy declarations. **No standard-mode `stepsExecuted` regression.** Baseline regeneration is a deferred coordinated follow-up (see [COMPLETE.md](14-COMPLETE.md)). |
| Typecheck | — | ✅ PASS — `tsc --noEmit` clean (no server `src/` changed) |

> **Deferred:** TW-1/TW-2/TB-* auto-assertion against the regenerated `[review-mode]` snapshot + robot manifest is pending the coordinated server-repo baseline bump (the baseline lives in the server repo, not PR #147). In-branch, the walk was verified by inspecting the snapshot diff, not by a committed baseline.
