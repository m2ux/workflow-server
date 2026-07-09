# Workflow Design: work-package — Complete

> Update · 2026-07-09

## Summary

Closed a review-mode posting defect in the `work-package` workflow (issue [#197](https://github.com/m2ux/workflow-server/issues/197)): the `post-pr-review` step was mis-bound to `update-pr::render`, which PATCHes the PR *description* — so the consolidated review the user approves was never the content posted to the PR. The fix rebinds `post-pr-review` to a new op that posts the rendered `review-summary` **verbatim** as a `gh pr review` comment, and codifies the attribution footer in the Consolidated Review Format so the posted text is the single authored artifact. `work-package` bumped 3.23.0 → 3.24.0.

## What Was Delivered

- **Activities:** modified `13-submit-for-review.yaml` (1.8.0 → 1.9.0) — one binding replacement: `post-pr-review` rebound `update-pr::render` → `update-pr::post-review-comment`.
- **Techniques:** created `update-pr/post-review-comment.md` (v1.0.0), posting `{review_summary}` verbatim via `gh pr review {pr_number} --{review_type} --body-file <file>`; modified `update-pr/TECHNIQUE.md` (2.1.0 → 2.2.0, group op-index + `posting.review-comment-verbatim` rule) and `review-summary.md` (1.0.0 → 1.1.0, render footer + present verbatim, no new signature).
- **Resources:** modified `review-mode.md` (1.3.0 → 1.4.0) — attribution footer codified in the Consolidated Review Format template body.
- **Variables / rules:** no new variables (`review_summary`, `pr_number`, `review_posted` pre-exist; `review_type` derives from the summary's Overall Rating). New light rule `posting.review-comment-verbatim`.

## Design Decisions

Canonically recorded in [03-assumptions-log.md](03-assumptions-log.md) and the [planning README](README.md#design-decisions). The one decision worth surfacing here for the retrospective: the scope was revised **down** at impact analysis from the issue's proposed conformance machinery to a minimal root-cause rebind, on explicit user direction (see Workflow Retrospective).

## Scope Outcome

All 6 manifest items delivered ([manifest](06-scope-manifest.md)); no drift. Post-update review CLEAN, 0 findings ([10-post-update-review.md](10-post-update-review.md)).

## Known Limitations & Deferrals

- **`review_type` flag derivation is implicit** — the posting op derives `--approve|--request-changes|--comment` from the summary's Overall Rating plus the `review-summary-approval` choice, rather than from an explicit variable. Intentional (no new variable), but the mapping lives only in the op protocol + review-mode table; a future edge case in rating wording could mis-derive the flag.
- **`scripts/binding-fidelity-baseline.json` re-snapshot deferred** — the corpus binding baseline must be re-generated to absorb the new op + rebind. This is a SEPARATE server→main follow-up (not part of PR [#199](https://github.com/m2ux/workflow-server/pull/199), which targets `workflows`).
- **Dropped conformance machinery** — `verify-review-summary` step, re-render loop, `review-summary-non-conformant` checkpoint, and `summary_*` variables were deliberately not built (see retrospective). If verbatim-posting proves insufficient in practice, a lightweight conformance check remains a future option.

## Workflow Retrospective

[messages: ~6 total, ~2 non-checkpoint · session quality: Minor friction]

### Observations

- [correction] "don't over-engineer" — requirements → impact-analysis handoff — the issue as filed proposed a heavy conformance gate (verify step + re-render loop + a new `review-summary-non-conformant` checkpoint + `summary_*` variables). The user steered emphatically to a minimal root-cause rebind. Root cause: the requirements activity took the issue's proposed *mechanism* at face value instead of first isolating the *defect* (a single mis-binding) and asking whether the mechanism was warranted.
- [process] Scope was correctly revised down at impact analysis (RE-2/RE-3 superseded), and the reduced scope held clean through quality-review, validate-commit, and post-update-review — the correction landed early and propagated cleanly.
- [checkpoint] No checkpoint anomalies. Delegated authority was used to resolve internal design checkpoints (new-op-vs-reuse, footer home, version bumps); the material gates (commit/PR) were surfaced plainly.

### Recommendations

1. **Medium:** Requirements refinement anchored on the issue's proposed solution rather than the underlying defect → when an issue proposes a mechanism, add an explicit "separate defect from proposed remedy; size the remedy to the defect" prompt before elaborating requirements, so the minimal-fix option is weighed *before* the heavy design is drafted (affected section: `work-package` requirements-refinement / `workflow-design` requirements activity).

**Key takeaway:** The workflow executed cleanly; the only friction was over-scoping the fix in requirements before the user pulled it back to root-cause — a "size the remedy to the defect" gate would have caught it upstream.
**Action required:** no — recommendation is a minor process refinement, not a blocker; capture as backlog if the pattern recurs.
