---
metadata:
  version: 1.1.1
---

## Capability

List pull requests via REST.

## Inputs

### branch_name

*(optional)* Head branch name. When set, the list is limited to open pulls whose head is `{owner}:{branch_name}`.

### list_query

*(optional)* Additional query string for the pulls list (e.g. `state=open&sort=updated`). Default `state=open` when `{branch_name}` is unset.

## Protocol

### 1. List Pulls

1. Apply [resolve-repo-coordinates](./resolve-repo-coordinates.md).
2. When `{branch_name}` is set: `gh api "repos/{owner}/{repo}/pulls?state=open&head={owner}:{branch_name}" --paginate`.
3. When `{branch_name}` is unset: `gh api "repos/{owner}/{repo}/pulls?{list_query}" --paginate` with `{list_query}` defaulting to `state=open`.
