---
metadata:
  version: 1.0.0
---

## Capability

List top-level comments on an issue or pull request via REST (issues comments endpoint).

## Inputs

### issue_number

Issue or pull request number.

## Outputs

### issue_comments

JSON array of issue comments from the paginated list.

## Protocol

### 1. List Comments

1. Apply [resolve-repo-coordinates](./resolve-repo-coordinates.md).
2. `gh api repos/{owner}/{repo}/issues/{issue_number}/comments --paginate`; set `{issue_comments}` to the parsed array.
