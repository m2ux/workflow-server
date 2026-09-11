---
metadata:
  version: 1.1.1
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
2. `gh api repos/{owner}/{repo}/pulls/{pr_number} -X PATCH -f title="{title}"`.
