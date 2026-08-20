---
metadata:
  version: 1.1.0
---

## Capability

Post a pull request review (approve, request changes, or comment) via REST.

## Inputs

### pr_number

Pull request number.

### body

Review body markdown. Multi-line bodies may be supplied from a file via `-F body=@<file>`.

### review_event

Review event: `APPROVE`, `REQUEST_CHANGES`, or `COMMENT`.

### review_id

*(optional)* Id of a review already on this pull request. When supplied, that review's body is replaced and its id, state and comment thread survive; when absent, a new review is posted.

## Outputs

### review_posted

True once the review is accepted by the API.

### posted_review_id

Id of the review the API accepted — the handle a later update addresses.

### live_review_body

The body the API holds for `{review_id}`, read before any replacement. Unset when no `{review_id}` was supplied.

## Protocol

### 1. Post Review

1. Apply [resolve-repo-coordinates](./resolve-repo-coordinates.md).
2. `gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews -F body=@<file-or-body> -f event={review_event}` (use `-f body="{body}"` when the body is a single-line string).
3. Set `{review_posted}` true and `{posted_review_id}` from the response.

### 2. Update an Existing Review

Reached only when `{review_id}` is supplied, in place of step 1.

1. Read the review the API currently holds — `gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews/{review_id} --jq .body` — and emit it as `{live_review_body}`. This read precedes the write: a body compared after the replacement compares the replacement with itself.
2. `gh api --method PUT repos/{owner}/{repo}/pulls/{pr_number}/reviews/{review_id} -F body=@<file-or-body>`. The review keeps its id, its state and its comment thread; posting a second review would leave two verdicts on one pull request.
3. Set `{review_posted}` true and `{posted_review_id}` to `{review_id}`.
