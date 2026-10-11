---
metadata:
  version: 1.0.0
---

## Capability

List inline pull request review comments via REST.

## Inputs

### pr_number

Pull request number.

## Outputs

### pr_review_comments

JSON array of inline review comments from the paginated list.

## Protocol

### 1. List Review Comments

1. Apply [resolve-repo-coordinates](./resolve-repo-coordinates.md).
2. `gh api repos/{owner}/{repo}/pulls/{pr_number}/comments --paginate`; set `{pr_review_comments}` to the parsed array.
