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

### 1. Read the Live Review

1. Apply [resolve-repo-coordinates](./resolve-repo-coordinates.md).
2. Emit `{live_review_body}` as the body the API currently holds, so a caller can reconcile against it before it is replaced. A body read after the write is the write.
   > When `{review_id}` is supplied: `gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews/{review_id} --jq .body`.
   > Otherwise there is no review to read; leave `{live_review_body}` unset.

### 2. Post or Replace the Review

- Send the body and emit `{review_posted}` true with `{posted_review_id}` naming the review the API accepted.
  > Without `{review_id}`: `gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews -F body=@<file-or-body> -f event={review_event}` (use `-f body="{body}"` when the body is a single-line string).
  > With `{review_id}`: `gh api --method PUT repos/{owner}/{repo}/pulls/{pr_number}/reviews/{review_id} -F body=@<file-or-body>`, which keeps the review's id, state and comment thread. A second POST leaves two verdicts on one pull request.
