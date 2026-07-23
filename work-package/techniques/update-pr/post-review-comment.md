---
metadata:
  version: 1.0.2
---

## Capability

Confirmed consolidated review summary posted verbatim to the PR as a `gh pr review` comment.

## Inputs

### review_summary

The rendered consolidated review summary text, authored to the [Review Comment Template](../../resources/review-mode.md#review-comment-template).

### pr_number

The PR number to post the review to.

### review_type

*(optional, enum: `approve` | `request-changes` | `comment`; default: derived from the summary's Overall Rating)* Which `gh pr review` flag to use.

## Outputs

### review_posted

True once the review comment is posted to the `{pr_number}` PR; false when posting was skipped.


## Protocol

1. `{review_summary}` is confirmed by the user at the `review-summary-approval` checkpoint before this technique runs; post it verbatim — never re-render, paraphrase, strip hyperlinks, or collapse the consolidated format into a free-form comment.
2. When `{review_type}` is not supplied, derive it from the Overall Rating already rendered in `{review_summary}` per the review-mode [Review Type Selection](../../resources/review-mode.md#review-type-selection) table: `Request Changes` → `request-changes`, `Comment Only` → `comment`, `Approve` → `approve`. Because the Overall Rating already honours the Prior Feedback Triage rating cap, the derived flag inherits that constraint with no separate variable.
3. Write `{review_summary}` to a file **verbatim** — no re-rendering, no edits. The file content is exactly the confirmed summary bytes (byte-for-byte).
4. Post it as a PR review via `gh pr review {pr_number} --{review_type} --body-file <file>`, mapping `{review_type}` to the flag: `approve` → `--approve`, `request-changes` → `--request-changes`, `comment` → `--comment`. Do NOT use `gh pr edit` or the `pulls PATCH` API — those update the PR description, not a review comment.
5. Confirm the review posted and set `{review_posted}` true. If the PR cannot be found because `{pr_number}` does not exist, verify the PR number and check `gh` auth before retrying.

## Rules

### review-comment-not-body-render

This op posts a `gh pr review` comment. It is not [render](./render.md), which PATCHes the PR description body from a template. Never substitute a description PATCH for the review comment.
