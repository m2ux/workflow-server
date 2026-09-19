---
metadata:
  version: 1.2.0
---

## Capability

Update the title of an existing PR via REST.

## Inputs

### pr_number

PR number.

### title

New PR title.

## Protocol

### 1. Patch Title

1. Apply [resolve-repo-coordinates](./resolve-repo-coordinates.md).
2. Write `{title}` to a temp file, per `github.authored-prose-by-file`.
3. `gh api repos/{owner}/{repo}/pulls/{pr_number} -X PATCH -F title=@<file>`.
