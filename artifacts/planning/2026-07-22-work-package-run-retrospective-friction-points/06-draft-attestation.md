# Draft Attestation — Pass B (#270)

> Record of the Pass B drafted/verified blocks. The Pass B content was authored at branch tip `1d51764` (commit `1d517643`); this attestation records verification of each block against the change goals rather than a fresh draft. See [scope manifest](06-scope-manifest.md) for the goal→file map.

## Verified blocks

| Block | File | Verification |
|-------|------|--------------|
| Publish-before-post steps | `work-package/activities/13-submit-for-review.yaml` | `publish-review-artifacts` step (line ~94) precedes `update-pr::post-review-comment` (line ~126); `artifact_publish_ref` bound through |
| Publish-ref link convention | `work-package/resources/review-mode.md` | `{ARTIFACT_PUBLISH_REF}` = publish commit SHA (preferred, immutable) or parent branch; never hardcode `main`; no `/blob/main/` literal remains |
| Review-type derivation honouring cap | `work-package/techniques/update-pr/post-review-comment.md` | `review_type` derived from Overall Rating per Review Type Selection table; inherits the rating-cap constraint |
| Rating-cap carve-in | `work-package/techniques/review-summary.md` | `rating-cap-carve-in` lifts the request-changes cap when the review's own findings refute the prior blocker; otherwise holds at/below Request Changes |
| Rating-cap derivation | `work-package/techniques/review-existing-feedback.md` | `rating_cap` set to request-changes tier on a Confirmed blocker-class concern |
| Review-type options | `work-package/activities/13-submit-for-review.yaml` (`review-summary-approval`) | approve / request-changes / comment / refine / skip-posting |
| Commit-ordering carve-out | `meta/techniques/workflow-engine/commit-and-persist.md` | `submit-for-review-in-activity-publish` — in-activity publish before `post-pr-review`; post-activity hook does not preempt it |

## Attestation

Every block above is understood and intentional. No unflagged removals detected beyond the single inventoried `/blob/main/` → `artifact_publish_ref` replacement ([impact analysis](05-impact-analysis.md)). YAML files are schema-conformant.
