---
metadata:
  version: 1.0.0
---

## Capability

List pull request reviews via REST.

## Inputs

### pr_number

Pull request number.

## Outputs

### pr_reviews

JSON array of reviews from the paginated list.

## Protocol

### 1. List Reviews

1. Apply [resolve-repo-coordinates](./resolve-repo-coordinates.md).
2. `gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews --paginate`; set `{pr_reviews}` to the parsed array.
