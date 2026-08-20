---
metadata:
  version: 1.3.0
---

## Capability

Confirmed consolidated review summary posted verbatim to the PR as a pull-request review.

## Inputs

### review_summary

The rendered consolidated review summary text, authored to the [Review Comment Template](../../resources/review-mode.md#review-comment-template).

### review_type

*(optional, enum: `approve` | `request-changes` | `comment`; default: derived from the summary's Overall Rating)* Which review event to post.

## Outputs

### review_posted

True once the review comment is posted to the `{pr_number}` PR; false when posting was skipped.

## Protocol

1. `{review_summary}` arrives as confirmed bytes; post it verbatim — never re-render, paraphrase, strip hyperlinks, or collapse the consolidated format into a free-form comment.
2. Resolve `{review_type}` against the Overall Rating already rendered in `{review_summary}`, per the review-mode [Review Type Selection](../../resources/review-mode.md#review-type-selection) table: `Request Changes` → `request-changes`, `Comment Only` → `comment`, `Approve` → `approve`. When `{review_type}` is unset, that table yields it. When it is set, it MUST NOT be more permissive than the table yields for the rendered rating: the rating already honours the Prior Feedback Triage rating cap, so a supplied `approve` over a capped rating would post a verdict the summary's own body contradicts. Hold the resolved value at the table's value and report the discrepancy rather than posting the more permissive one.
3. Map `{review_type}` to `{$review_event}`: `approve` → `APPROVE`, `request-changes` → `REQUEST_CHANGES`, `comment` → `COMMENT`.
4. Apply [post-pr-review](../../../meta/techniques/github-cli-protocol/post-pr-review.md)(*repo_path*=`{component_git_dir}`, *body*=`{review_summary}`, *review_event*=`{$review_event}`); set `{review_posted}` and `{posted_review_id}` from the op. This is a pull-request review, not a description body update ([render](./render.md)).
   > Where this run already posted a review, supply *review_id*=`{posted_review_id}` so the body is replaced in place and the review keeps its id, its state and its comment thread.
5. Reconcile before replacing an existing review: compare the `{live_review_body}` the op read against `{review_summary}`. Every difference is one of two things, and they are settled differently — this run's own pending change, which the replacement publishes, or an edit made to the live review out of band, which is adopted into `{review_summary}` and the artifact before the replacement goes out. The review API offers no concurrency token, so this comparison is what distinguishes the two cases, and it runs before the replacement.
6. If the PR cannot be found because `{pr_number}` does not exist, verify the PR number and check `gh` auth before retrying.

## Rules

### review-comment-not-body-render

This op posts a pull-request review via [post-pr-review](../../../meta/techniques/github-cli-protocol/post-pr-review.md). It is not [render](./render.md), which updates the PR description body from a template. Never substitute a description update for the review comment.
