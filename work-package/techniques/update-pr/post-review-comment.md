---
metadata:
  version: 1.0.3
---

## Capability

Confirmed consolidated review summary posted verbatim to the PR as a pull-request review via REST.

## Inputs

### review_summary

The rendered consolidated review summary text, authored to the [Review Comment Template](../../resources/review-mode.md#review-comment-template).

### pr_number

The PR number to post the review to.

### review_type

*(optional, enum: `approve` | `request-changes` | `comment`; default: derived from the summary's Overall Rating)* Which review event to post.

### target_repo

*(optional)* GitHub repository as `owner/repo`. When unset, derived from `origin` on `{target_path}`.

### target_path

*(optional)* Working tree used to derive `owner/repo` when `{target_repo}` is unset.

## Outputs

### review_posted

True once the review comment is posted to the `{pr_number}` PR; false when posting was skipped.


## Protocol

1. `{review_summary}` arrives as confirmed bytes; post it verbatim — never re-render, paraphrase, strip hyperlinks, or collapse the consolidated format into a free-form comment.
2. Resolve `{review_type}` against the Overall Rating already rendered in `{review_summary}`, per the review-mode [Review Type Selection](../../resources/review-mode.md#review-type-selection) table: `Request Changes` → `request-changes`, `Comment Only` → `comment`, `Approve` → `approve`. When `{review_type}` is unset, that table yields it. When it is set, it MUST NOT be more permissive than the table yields for the rendered rating: the rating already honours the Prior Feedback Triage rating cap, so a supplied `approve` over a capped rating would post a verdict the summary's own body contradicts. Hold the resolved value at the table's value and report the discrepancy rather than posting the more permissive one.
3. Write `{review_summary}` to a file **verbatim** — no re-rendering, no edits. The file content is exactly the confirmed summary bytes (byte-for-byte).
4. Set `{$review_event}` from `{review_type}`: `approve` → `APPROVE`, `request-changes` → `REQUEST_CHANGES`, `comment` → `COMMENT`. Split `{target_repo}` into `{$owner}` / `{$repo}` (or derive from `origin` on `{target_path}`). Post: `gh api repos/{$owner}/{$repo}/pulls/{pr_number}/reviews -F body=@<file> -f event={$review_event}`. Do not PATCH `repos/.../pulls/{pr_number}` for this step — that updates the PR description, not a review comment.
5. Confirm the review posted and set `{review_posted}` true. If the PR cannot be found because `{pr_number}` does not exist, verify the PR number and check `gh` auth before retrying.

## Rules

### review-comment-not-body-render

This op posts a pull-request review via `…/pulls/{pr_number}/reviews`. It is not [render](./render.md), which PATCHes the PR description body from a template. Never substitute a description PATCH for the review comment.
