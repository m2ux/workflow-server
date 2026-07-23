# Assumptions Log — Pass B (#270)

> Design assumptions surfaced during requirements-refinement for the Pass B (#270) update. Resolvable items converge here; open judgements defer to Gate 2 (`approve-to-commit`).

## Settled (resolved during refinement)

| # | Assumption | Category | Outcome |
|---|------------|----------|---------|
| S-1 | Pass B targets `work-package` (primary) + `meta` (coupled) on the existing `workflow/work-package-review-mode-friction-271` branch | Activity Boundaries | Settled — same branch / PR #274 as Pass A; additive |
| S-2 | `artifact_publish_ref` prefers a commit SHA over a branch name | Variable State | Settled — SHA is immutable, so posted links never drift |
| S-3 | The publish-before-post steps live inside `13-submit-for-review`, not a new activity | Activity Boundaries | Settled — keeps the review-submit atomic; no graph change |

## Open judgements (→ Gate 2)

| # | Assumption | Category | Risk | Status |
|---|------------|----------|------|--------|
| B-1 | The `commit-after-activity` carve-out is expressed as a scoping cross-reference on the meta `commit-and-persist` technique rather than a conditional in the operation body | Rule Scope | Medium | Open |
| B-2 | `review-summary-approval` presents the rating-cap carve-in and review-type as a single batched checkpoint vs two sequential checkpoints | Checkpoint Necessity | Low | Open |
| B-3 | `artifact_publish_ref` falls back to the workflows branch name when no SHA is resolvable | Variable State | Low | Open |

## Notes

- Open judgements batch into Gate 2 (`approve-to-commit`); no mid-flow per-assumption interviews (headless default).
- Outcomes recorded here are the single canonical home for assumptions (see canonical-home-map).
