# Review-Mode Hardening - Test Plan

**Work Package:** Review-Mode Hardening: Config-Change & Interaction Defects
**Issue:** #145
**PR:** #147
**Created:** 2026-06-30
**Phase:** Initial placeholder (objectives only; source links added at finalize-documentation)

---

## Overview

The change set is workflow-definition-layer only (YAML activities + markdown techniques/resources). It is not exercised by unit tests but by the **3-layer E2E harness** in the server repo at `/home/mike1/projects/main/workflow-server/tests/e2e/`. The test strategy is therefore harness-centric: prove every new technique ref resolves, prove the review-mode walk absorbs the new gated steps without perturbing other policies, and prove the robot smoke-run writes the new artifacts.

> No formal unit tests are added — there is no source code in this change set. The skip-conditions in `create-test-plan` (documentation/definition change with existing harness coverage) apply; the harness is the test surface.

---

## Test Strategy

| Harness layer | File | What it proves for this work package |
|---------------|------|--------------------------------------|
| Definition lint (layer 2) | `tests/e2e/definition-lint.test.ts` | Every `group::operation` / technique ref on every policy walk resolves; `BASELINE_UNRESOLVED` stays `[]`. The NEW `review-existing-feedback` ref and every new bound step ref must resolve. |
| Deterministic walk + snapshot (layer 1) | `tests/e2e/snapshot.test.ts` (`[review-mode]` block), `all-paths-walk.test.ts`, `workflow-e2e.test.ts` | The `[review-mode]` walk includes the new gated steps + new artifacts; standard-mode walks unchanged; the 6-policy matrix reaches `complete`. |
| Agent smoke-run (layer 3) | `tests/e2e/robot-execution.test.ts` | Review-mode robot execution writes the new artifact stubs; the manifest matches the regenerated baseline. |

**Infrastructure:** Driven by `tests/e2e/policies.ts` (`reviewModePolicy`, `initialVariables: { is_review_mode: true }`, choice `workflow-path-selected: skip-optional`). No new fixtures/mocks needed; baselines are regenerated with `npx vitest run tests/e2e -u`.

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

| ID | Case | Requirement | Acceptance |
|----|------|-------------|------------|
| TB-1 | Prior PR feedback ingested + triaged before verdict; unaddressed external blocker caps Overall Rating | aug 1 | `review-existing-feedback` runs before any analysis activity; `rating_cap` reaches `review-summary` Overall Rating (cannot be "Comment Only") |
| TB-2 | `Config` swap triggers upstream-lifecycle trace over unchanged callers | aug 2 | `review-code` §2 sub-check fires on a Config/associated-type diff; imbalance → ≥ Minor finding |
| TB-3 | Producer/clearer ledger written; unmatched creation → classifiable finding | aug 3 | `structural-analysis` output carries the ledger; unmatched create appears in Bug Table and routes via `findings-classification` |
| TB-4 | Correct-but-harmful change classifies Major/Critical AND renders ≥ High (not downgraded) | aug 4 (Tasks 1,7) | `findings-classification` impact axis sets severity + `needs_code_fixes`; `review-mode.md` map renders Major→High |
| TB-5 | Reported runtime failure traced to code path + state precondition; mock-masked branch escalates harness as a finding | aug 5 | validate triage step traces each thread-reported error; multi-instance gate flags untested instances; mock-masked branch is a finding, not a default-Medium nit |
| TB-6 | Thread-reported runtime error ingested once, traced once (no double-count) | DD-4 | aug 5 consumes aug 1's `prior_feedback_triage` entries rather than re-scraping |

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

- Test-plan source links (TB-* → actual technique/activity sections at the merged commit) are added in phase 2 by the finalize-documentation technique.
- Verification commands (vitest runs, lint) execute automatically via the task-cycle and final validation — they are not listed as plan tasks.
