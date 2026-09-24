---
metadata:
  version: 1.0.0
---

## Capability

List repository labels, or the labels on one issue, via REST.

## Inputs

### issue_number

*(optional)* Issue or pull request number. When set, the list is that issue's labels. When unset, the list is the repository's labels.

## Outputs

### label_records

Label objects the list returned, one JSON object per label.

## Protocol

### 1. Resolve Coordinates

1. Apply [resolve-repo-coordinates](./resolve-repo-coordinates.md).

### 2. List Labels

1. When `{issue_number}` is set: `gh api "repos/{owner}/{repo}/issues/{issue_number}/labels?per_page=100" --paginate`.
2. When `{issue_number}` is unset: `gh api "repos/{owner}/{repo}/labels?per_page=100" --paginate`.
3. Set `{label_records}` to the parsed array.
   > A page of 30 with no `--paginate` is a truncated inventory. The count of `{label_records}` is the count only because the call paginates.
