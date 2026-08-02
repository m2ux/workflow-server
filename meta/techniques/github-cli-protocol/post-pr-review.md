---
metadata:
  version: 1.0.0
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

## Outputs

### review_posted

True once the review is accepted by the API.

## Protocol

### 1. Post Review

1. Apply [resolve-repo-coordinates](./resolve-repo-coordinates.md).
2. `gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews -F body=@<file-or-body> -f event={review_event}` (use `-f body="{body}"` when the body is a single-line string).
3. Set `{review_posted}` true on success.
