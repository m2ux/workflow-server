---
metadata:
  version: 1.1.1
---

## Capability

Update the body of an existing PR via REST.

## Inputs

### pr_number

PR number.

### body

PR body markdown. Multi-line bodies may be supplied from a file via `-F body=@<file>`.

## Protocol

### 1. Patch Body

1. Apply [resolve-repo-coordinates](./TECHNIQUE.md#resolve-repo-coordinates).
2. `gh api repos/{$owner}/{$repo}/pulls/{pr_number} -X PATCH -f body="{body}"` (or `-F body=@<file>` when the body is on disk).
