# Assumptions Log

> work-package review-summary conformance gate · #197 · updated 2026-07-09

## Log

One row per assumption, updated in place. IDs: two-letter phase prefix + sequence.

| ID | Phase/Task | Category | Risk | Assumption — rationale | Resolution | Outcome |
|----|------------|----------|------|------------------------|------------|---------|
| RE-1 | Requirements | Activity Boundaries | L | No new activity is needed — the entire change lives inside the existing `submit-for-review` activity (`13-submit-for-review.yaml`), because the issue scopes the gap and its fix to that one activity, explicitly analogising to the `verify-body` mechanism which already lives there — the ambiguity source is the issue reading (it names only that activity + its technique/resource). | Issue text (four requested parts all target `13-submit-for-review.yaml` / `review-summary.md` / `update-pr/*` / `review-mode.md`) | Confirmed |
| RE-2 | Requirements | Schema Construct Choice | L | The conformance gate is realised as a `verify-review-summary` technique step + a re-render loop gated on a `summary_conforms`-style variable + a `review-summary-non-conformant` checkpoint — structurally mirroring `verify-body` / `verify-pr-body-rerender` / `body-non-conformant` in the same activity. | Issue text (explicitly directs mirroring the existing PR-body mechanism); convention audit against the existing three constructs | Confirmed |
| RE-3 | Requirements | Technique Selection | M | The `verify-review-summary` conformance operation is authored to mirror `update-pr::verify-body`'s shape but homed with the review-summary rendering technique (near `review-summary.md`), not inside the `update-pr/` group — because the check is over the `generate-review-summary` artifact (a review comment body), not the PR description, so binding it into the PR-description group would overfit the group's semantics (generic-not-overfit). Exact file/group placement is a scope-and-draft detail settled by the naming-convention audit. | Convention audit (audit-conformance) — deferred concrete placement to scope-and-draft | Validated |
| RE-4 | Requirements | Technique Selection | L | `post-pr-review` is rebound to post the `generate-review-summary` artifact verbatim via `gh pr review {pr} --approve\|--request-changes\|--comment --body-file <review-summary.md>`, and the current mis-binding to `update-pr::render` (a `gh api` PR-description PATCH) is corrected; any free-form-draft substitution path is removed. | Issue text (requested part 1, explicit including the mis-binding note) | Confirmed |
| RE-5 | Requirements | Rule Scope | L | The conformance check verifies (a) required sections present — metadata header (PR/Reviewers/Reports/Date), Executive Summary, Overall Rating, Prior Feedback Triage, per-category sections, Action Items, Severity Definitions, attribution footer — and (b) section titles are not hyperlinked; these become a `review-summary-conformance` rule set on the verify technique, mirroring the `verify-body` conformance rules. | Issue text (requested part 2, enumerated checks) | Confirmed |
| RE-6 | Requirements | Rule Scope | L | The attribution footer is codified as part of the Consolidated Review Format section in `resources/review-mode.md` itself (not only referenced from the verify technique), so the format resource is the single source of truth the verify check binds against. | Issue text (requested part 3) | Confirmed |
| RE-7 | Requirements | Checkpoint Necessity | L | The optional part 4 (tighten `review-summary.md` step wording so the approval checkpoint presents the rendered artifact / faithful excerpt, never a paraphrase) is in scope as a wording refinement, gated as OPTIONAL per the issue — it does not add a new construct, only strengthens an existing step's technique wording. | Issue text (requested part 4, marked optional) | Confirmed |

## Wrap-Up

7 assumptions — all confirmed or validated (issue-determined or convention-resolvable). No genuine open design judgements remained after reconciliation, so the assumption-interview loop is skipped.

- RE-3 (verify-technique placement) was the only assumption with a real design degree of freedom; it was settled by the naming-convention audit (generic-not-overfit) rather than a user checkpoint, with concrete file placement deferred to scope-and-draft.
- Takeaway: the change is a faithful mirror of an existing, proven in-activity conformance mechanism onto a second posting path, so nearly every decision is pinned by the precedent rather than open.
