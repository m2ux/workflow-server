# work-package — Design Session

**Created:** 2026-07-09  
**Mode:** Update  
**Status:** ✅ COMPLETE — session closed out. Update ACCEPTED, post-update review CLEAN (0 findings, no scope drift); commit `16f6cbcd` on `workflow/197-review-comment-verbatim`, PR [#199](https://github.com/m2ux/workflow-server/pull/199) open against `workflows`. Close-out + retrospective in [11-COMPLETE.md](11-COMPLETE.md).

---

## 🎯 Executive Summary

Update the `work-package` workflow to close a review-mode posting defect (issue [m2ux/workflow-server#197](https://github.com/m2ux/workflow-server/issues/197)): the review-mode `post-pr-review` step is mis-bound to `update-pr::render` (a PR-*description* PATCH), so the consolidated review the user approves is not the content posted to the PR. Minimal root-cause fix (scope confirmed at impact analysis, superseding the heavier mechanism weighed at requirements): rebind `post-pr-review` to post the rendered `review-summary.md` artifact **verbatim** as a PR review comment via `gh pr review --body-file`, ensure a light template-conformance rule exists on the review-summary technique (only if none does), and codify the attribution footer in the Consolidated Review Format. No conformance-verify loop, no new checkpoint, no new variables.

---

## Design Decisions

- **No new activity** — the change is confined to the existing `submit-for-review` activity (RE-1).
- **`post-pr-review` rebound to verbatim artifact post** — via `gh pr review {pr} --approve|--request-changes|--comment --body-file <review-summary.md>`; the current mis-binding to `update-pr::render` is corrected so the approved artifact is exactly what is posted. This is the root-cause fix (RE-4).
- **Minimal scope — no conformance machinery (supersedes RE-2/RE-3 at impact analysis).** The user judged the verify-step + re-render-loop + `review-summary-non-conformant` checkpoint + `summary_*` variables over-engineered. Dropped. Template conformance is guaranteed by posting the rendered artifact verbatim — the `review-summary` technique already binds the Consolidated Review Format and instructs "follow the loaded format exactly", so only a light rule is added *if one does not already exist*.
- **Attribution footer codified in `review-mode.md`** — the Consolidated Review Format section is the single source of truth for the footer the posted comment carries (RE-6).

See [03-assumptions-log.md](03-assumptions-log.md) for the full assumptions log.

---

## Compliance Findings

Quality review (08): 4 active-mode passes clean, 0 actionable findings. Scope verified minimal — no out-of-scope machinery present. See [08-quality-review.md](08-quality-review.md).

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| Nit (info) | Verbatim-posting contract stated in 3 worker-visible places | TECHNIQUE.md:79 / post-review-comment.md:8 / review-summary.md:47 | None — correct under AP-27 worker-visibility carve-out; recorded only |

---

## Scope Manifest

Confirmed and drafted during scope-and-draft — full manifest, block-index, and attestation in [06-scope-manifest.md](06-scope-manifest.md). 5 files modified + 1 created; all schema-valid (`validate-workflow-yaml.ts` PASS). `work-package` bumped 3.23.0 → 3.24.0.

- **create** `work-package/techniques/update-pr/post-review-comment.md` (v1.0.0) — posts `{review_summary}` verbatim via `gh pr review {pr_number} --{review_type} --body-file <file>`; `review_type` defaults to derive from the summary's Overall Rating (no new variable).
- **modify** `work-package/activities/13-submit-for-review.yaml` (1.8.0 → 1.9.0) — rebind `post-pr-review` from `update-pr::render` to `update-pr::post-review-comment` (the root-cause fix; one binding replacement).
- **modify** `work-package/techniques/update-pr/TECHNIQUE.md` (2.1.0 → 2.2.0) — add the op to the group Capability index + light `posting.review-comment-verbatim` rule.
- **modify** `work-package/resources/review-mode.md` (1.3.0 → 1.4.0) — codify the attribution footer in the Consolidated Review Format template body.
- **modify** `work-package/techniques/review-summary.md` (1.0.0 → 1.1.0) — render the footer + present the rendered artifact verbatim (never a paraphrase).
- **modify** `work-package/workflow.yaml` (3.23.0 → 3.24.0).

Chosen over reuse of `update-pr::render`: `render` PATCHes the PR *description*; a `gh pr review` verbatim post is a distinct operation, so a new minimal op was created rather than overloading `render`. Verbatim source: the posting op writes `{review_summary}` to a file and `--body-file`s it (keeps `review-summary.md` light). One flagged removal (the binding replacement) — intentional; `render` keeps 3 other live bindings. `has_unflagged_removals = false`.

Dropped as over-engineering: `verify-review-summary` step, re-render loop, `review-summary-non-conformant` checkpoint, `summary_*` variables, REVIEW-MODE.md/README.md edits.

---

## 📊 Activity Progress

| # | Activity | Mode | Status |
|---|----------|------|--------|
| 01 | Intake and Context | All | ✅ Complete |
| 03 | Requirements Refinement | Create, Update | ✅ Complete |
| 04 | Impact Analysis | Update | ✅ Complete |
| 06 | Scope and Draft | Create, Update | ✅ Complete |
| 08 | Quality Review | All | ✅ Complete |
| 09 | Validate and Commit | All | ✅ Complete — committed `16f6cbcd`, PR [#199](https://github.com/m2ux/workflow-server/pull/199) |
| 10 | Post-Update Review | Update | ✅ Complete — audit CLEAN, 0 findings; see [10-post-update-review.md](10-post-update-review.md) |
| 11 | Retrospective | All | ✅ Complete — close-out + retrospective in [11-COMPLETE.md](11-COMPLETE.md) |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Target workflow | `workflows/work-package/` |
| Issue | [m2ux/workflow-server#197](https://github.com/m2ux/workflow-server/issues/197) |
| PR | [m2ux/workflow-server#199](https://github.com/m2ux/workflow-server/pull/199) (base `workflows`) |
| Commit | `16f6cbcd` on `workflow/197-review-comment-verbatim` |

---

**Status:** ✅ Session complete. Validation CLEAN (`all_files_validated = true`), signed off at `pre-commit-attestation`, landed as commit `16f6cbcd` on `workflow/197-review-comment-verbatim` with PR [#199](https://github.com/m2ux/workflow-server/pull/199) open against `workflows`. Post-update review CLEAN (0 findings). Terminal close-out + retrospective recorded in [11-COMPLETE.md](11-COMPLETE.md). Follow-up (separate server→main): re-snapshot `scripts/binding-fidelity-baseline.json`.
