# Scope Manifest — Pass B (#270)

> File-level change inventory for the Pass B (#270) update. **Verified at branch tip `1d51764`** — all four change goals are already implemented by commit `1d517643` ("publish review artifacts before post (#270)"). This manifest records the implementing files and their verification status rather than a fresh drafting order. Links [design specification](03-design-specification.md) (goals) and [impact analysis](05-impact-analysis.md) (blast radius).

## Change-goal → file map (verified)

| Goal | Implementing file(s) | Status |
|------|----------------------|--------|
| Publish-ref links (`artifact_publish_ref`, SHA preferred) | `work-package/resources/review-mode.md`, `work-package/techniques/update-pr/post-review-comment.md` | ✅ no `blob/main` remains; SHA/branch fallback, never hardcode main |
| Publish-before-post | `work-package/activities/13-submit-for-review.yaml` (`publish-review-artifacts` step before `update-pr::post-review-comment`) | ✅ verified |
| Commit-ordering carve-out | `meta/techniques/workflow-engine/commit-and-persist.md` (`submit-for-review-in-activity-publish`) | ✅ verified |
| Rating-cap carve-in + review-type options | `work-package/techniques/review-summary.md` (`rating-cap-carve-in`), `work-package/activities/13-submit-for-review.yaml` (`review-summary-approval` options) | ✅ verified |

## Files touched by the Pass B commit (reference)

- `work-package/activities/13-submit-for-review.yaml` — publish-before-post steps, `artifact_publish_ref` links, review-type options
- `work-package/resources/review-mode.md` — `artifact_publish_ref` link convention + Review Type Selection table
- `work-package/techniques/review-summary.md` — `rating_cap` + `rating-cap-carve-in`
- `work-package/techniques/review-existing-feedback.md` — `rating_cap` derivation from prior-feedback triage
- `work-package/techniques/update-pr/post-review-comment.md` — review-type derivation honouring the rating cap
- `meta/techniques/workflow-engine/commit-and-persist.md` — commit-ordering carve-out

## Structural design / drafting order

No structural change: no activities added/removed/reordered; `artifact_publish_ref` added as an additive review-mode variable. Drafting order is N/A — the Pass B content is already authored at the tip. This run's drafting loop is a verification attestation.

## Notes

- Pass A (#271) surfaces on the same branch are preserved and out of scope here.
- Version bumps on `work-package` / `meta` accompany the authored change at the tip.
