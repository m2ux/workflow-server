# Design Specification — Pass B (#270): Publish-Before-Post & Review-Mode Close-Out

> Update-mode specification covering only the dimensions that change for issue [#270](https://github.com/m2ux/workflow-server/issues/270), on branch `workflow/work-package-review-mode-friction-271` (PR [#274](https://github.com/m2ux/workflow-server/pull/274)). Pass A (#271) work on the same branch stays; Pass B is additive. Baseline: `work-package` v3.35.0, `meta` v5.7.0.

## Purpose

Close the consolidated-review template abandonment caused by dead `/blob/main/` Plan/Reports links and the missing publish-before-post step in review mode. Reviewers must be able to follow Plan/Reports links at post time, and the review-summary approval must offer a rating-cap / review-type choice.

## Change Goals (Pass B)

1. **Publish-ref links** — Plan/Reports links resolve at post time via an `artifact_publish_ref` (SHA preferred) instead of hardcoded `/blob/main/` links, so posted review comments never point at a moving or wrong ref.
2. **Publish-before-post** — `13-submit-for-review` gains explicit publish steps that push the review artifacts to the publish ref *before* the review comment is posted, so the links it contains are live.
3. **Commit-ordering carve-out** — `submit-for-review` is carved out of the blanket `commit-after-activity` ordering (meta `commit-and-persist` / version-control), so the in-activity publish ordering is not preempted by the generic post-activity commit.
4. **Rating-cap self-refutation carve-in + review-type options** — `review-summary-approval` offers the rating-cap self-refutation carve-in and explicit review-type options at approval time.

## Dimensions That Change

### Activities

- **`work-package/13-submit-for-review`** — add publish-before-post steps; link Plan/Reports via `artifact_publish_ref`; gate the publish on review mode. *(modify)*
- **`work-package` review-summary approval surface** — add rating-cap carve-in and review-type checkpoint options. *(modify)*

### Techniques / Resources

- **`work-package` review-mode techniques** — `publish-review-artifacts.md`, `review-mode.md`, `review-summary.md`, `post-review-comment.md` updated to produce/consume `artifact_publish_ref` and order publish-before-post. *(modify)*
- **`meta` commit-and-persist / version-control techniques** — carve `submit-for-review` out of `commit-after-activity` ordering. *(modify)*

### Variables

- **`artifact_publish_ref`** (string, work-package review-mode state) — the resolved publish ref (SHA preferred) used to build Plan/Reports links at post time.

### Rules

- Cross-reference the `commit-after-activity` / `explicit-commit` scoping so the `submit-for-review` carve-out is unambiguous.

## Dimensions Unchanged

Workflow identity/tags, the activity graph shape (no activities added/removed), the Pass A (#271) surfaces already on the branch, and the `meta` dispatch model.

## Constraints

- Additive only; no removals beyond what impact-analysis flags.
- Documentation voice: declarative present tense; no evolution narrative in system docs.
- Conventional Commits + DCO sign-off on the workflows branch.
