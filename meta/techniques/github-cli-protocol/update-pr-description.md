---
metadata:
  version: 1.2.0
---

## Capability

Update the body of an existing PR via REST.

## Inputs

### pr_number

PR number.

### body

PR body markdown. Multi-line bodies may be supplied from a file via `-F body=@<file>`.

## Outputs

### rendered_pr_body

The body now live on the PR after the patch.

## Protocol

### 1. Patch Body

1. Apply [resolve-repo-coordinates](./resolve-repo-coordinates.md).
2. `gh api repos/{owner}/{repo}/pulls/{pr_number} -X PATCH -f body="{body}"` (or `-F body=@<file>` when the body is on disk).
3. Set `{rendered_pr_body}` from the request body (or `.body` on the response).
