---
metadata:
  version: 1.0.0
---

## Capability

Post the confirmed consolidated review summary to the PR **verbatim** as a `gh pr review` comment — the rendered `{review_summary}` reaches the PR byte-for-byte, unlike `render` which PATCHes the PR description body from a template.

## Inputs

### review_summary

The rendered consolidated review summary text, authored to the [Consolidated Review Format](../../resources/review-mode.md#consolidated-review-format) and confirmed by the user at the `review-summary-approval` checkpoint. Posted verbatim — never re-rendered or paraphrased.

### pr_number

The PR number to post the review to.

### review_type

*(optional, enum: `approve` | `request-changes` | `comment`; default: derive from the summary's Overall Rating)* Which `gh pr review` flag to use. When not supplied, derive it from the Overall Rating already rendered in `{review_summary}` per the review-mode [Review Type Selection](../../resources/review-mode.md#review-type-selection) table: `Request Changes` → `request-changes`, `Comment Only` → `comment`, `Approve` → `approve`. Because the Overall Rating already honours the Prior Feedback Triage rating cap, the derived flag inherits that constraint with no separate variable.

## Outputs

### review_posted

True once the review comment is posted to the `{pr_number}` PR; false when posting was skipped.

## Protocol

1. Write `{review_summary}` to a file **verbatim** — no re-rendering, no edits. The file content is exactly the confirmed summary bytes.
2. Post it as a PR review via `gh pr review {pr_number} --{review_type} --body-file <file>`, mapping `{review_type}` to the flag: `approve` → `--approve`, `request-changes` → `--request-changes`, `comment` → `--comment`. Do NOT use `gh pr edit` or the `pulls PATCH` API — those update the PR description, not a review comment.
3. Confirm the review posted and set `{review_posted}` true. If the PR cannot be found because `{pr_number}` does not exist, verify the PR number and check `gh` auth before retrying.
