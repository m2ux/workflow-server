# Workflow Design: work-package — Complete

> Update · 2026-07-08

## Summary

Scoped update to the `work-package` workflow's `strategic-review` activity (`review-findings` checkpoint), resolving four findings from a prior compliance review (WP-SR-01…04). The checkpoint no longer prompts the user to dispose of a finding-free review, no longer silently auto-accepts real findings after 30s, gains a priority-based `selective-fixes` disposition, and makes `defer-findings` structurally distinct from a clean accept. Committed as `ca6ad520`, pushed, and opened as draft PR [#192](https://github.com/m2ux/workflow-server/pull/192) against `workflows`.

## What Was Delivered

- **Activities:** modified `work-package/activities/12-strategic-review.yaml` — `review-findings` checkpoint gains `condition` (`strategic_findings_summary != ""`), `blocking: true`, drops `autoAdvanceMs`/`defaultOption` + stale message line, adds `selective-fixes` option, differentiates `defer-findings`. v2.6.0 → 2.7.0.
- **Techniques:** modified `work-package/techniques/strategic-findings-analysis.md` — adds `review_passed` boolean output (`true` on the finding-free/minor path), protocol step 4, and the `finding-free-path-signals-passed` rule. v1.0.0 → 1.1.0.
- **Resources:** modified `work-package/activities/README.md` — mermaid edge labels for the `review-findings` checkpoint transitions now read truthfully.
- **Variables / rules:** added `strategic_fixes_selective` and `strategic_findings_deferred` (both boolean, default `false`) to `work-package/workflow.yaml`; `review_passed` declaration unchanged but gains a new producer. workflow.yaml v3.18.0 → 3.19.0.

## Design Decisions

Canonically recorded in the [assumptions log](03-assumptions-log.md) (A1–A5) and the planning [README Design Decisions](README.md#design-decisions). The one decision requiring user judgement:

- **A1 — finding-free proceed mechanism (Option B, user-accepted).** Between flipping the workflow-level `review_passed` default to `true` (Option A) and having the `strategic-findings-analysis` technique emit `review_passed: true` on the finding-free path (Option B), Option B was chosen and accepted by the user: it keeps the "did review pass" semantic co-located with the technique that computes finding state and touches no confusing workflow-level default. Rationale and the rejected Option A are in [03-assumptions-log.md §A1](03-assumptions-log.md).

## Scope Outcome

All 4 manifest items delivered ([scope manifest](06-scope-and-draft.md)); committed diff (4 files, +42/−10) matched the manifest exactly with no drift, confirmed by the post-update scope audit ([10-post-update-review.md](10-post-update-review.md)).

## Known Limitations & Deferrals

<!-- Canonical home. Other artifacts link here; do not duplicate this list elsewhere. -->
- **Review-mode routing unchanged (by design)** — under `is_review_mode == true` the restructured options still route to `submit-for-review` (review mode surfaces findings, it does not loop to fix). Intentional and out of scope for this fix (assumptions log A5).
- **Selective disposition is coarse-grained** — `selective-fixes` sets a single `strategic_fixes_selective` flag; the actual per-severity finding selection is deferred to the downstream fix path reading `strategic_findings_summary` (one severity-tagged line per finding). A per-finding option list is not schema-expressible as a dynamic list, so this is the deliberate shape (assumptions log A2).
- **Deferred to a separate future work package — review-mode gating of `pr-creation` and `review-outcome`.** `check:review-mode` flagged two pre-existing violations not caused by this commit: `work-package::start-work-package::pr-creation` and `work-package::submit-for-review::review-outcome` both auto-advance under review-reachable paths. Neither file was touched here. A future pass should gate these two checkpoints and run `--update-baseline` (the guard's baseline currently snapshots only `review-findings`, which this change fixed, so it is stale in both directions). Details in [10-post-update-review.md](10-post-update-review.md#out-of-scope-observations-not-caused-by-this-commit).
- **Server-side baseline follow-up — binding-fidelity / review-mode-gating baselines want a `--update-baseline` shrink.** `check-binding-fidelity` reports 1 baselined violation now fixed (the AP-61 stage-agnostic `review_passed` output) and `check-review-mode-gating` went 10 → 9; both baseline files should be refreshed on the server side after this PR merges. Not a blocker for the change ([09-validate-and-commit.md](09-validate-and-commit.md)).

## Workflow Retrospective

[messages: ~4 total, ~3 non-checkpoint · session quality: Smooth]

### Observations

<!-- Only categories that occurred. -->
- [process — mechanism decision] A1 (finding-free proceed path) surfaced a genuine design fork (Option A default-flip vs Option B technique-output) that no audit could settle — validity/convention checks confirmed the bug existed but the mechanism was a design judgement. Resolved cleanly at the requirements checkpoint with a single user selection (Option B). Root cause: a legitimate design choice, not a workflow-clarity gap.
- [checkpoint anomaly] `check:review-mode` reported 2 checkpoints (`pr-creation`, `review-outcome`) as "NEW" violations purely because the guard's baseline snapshots only `review-findings`. This is a stale-baseline artifact of the guard, not a workflow deviation — the two checkpoints are genuine pre-existing auto-advance cases the fix correctly left out of scope.
- [checkpoint anomaly] `check-binding-fidelity` prints "run --update-baseline to shrink" after the fix cleared one baselined violation — expected server-side baseline drift, correctly deferred rather than resolved in-session.
- No corrections, no re-clarifications, no frustration signals: the four findings were precisely specified by the prior compliance review, so intake through commit ran without rework. Both the impact-analysis preservation gate and the pre-commit attestation resolved on first presentation.

### Recommendations

1. **Low:** the review-mode-gating and binding-fidelity guards emit pre-existing whole-corpus violations as "NEW" against sparse/stale baselines, which forces every scoped session to re-explain the noise → seed these baselines completely (or make the guard diff against the target's own pre-change state) so a scoped fix only surfaces violations it actually introduces (`scripts/review-mode-gating-baseline.json`, `check-binding-fidelity` baseline).
2. **Low:** carry the two out-of-scope review-mode-gating observations (`pr-creation`, `review-outcome`) into a dedicated follow-up work package rather than leaving them as a retrospective note (see Known Limitations & Deferrals).

**Key takeaway:** A tightly-specified, single-checkpoint fix rode the update-mode path end-to-end with zero rework; the only friction was guard-baseline noise, not the workflow.
**Action required:** no — the two deferrals are recorded here for a future work package; no issue is required to close this session.
