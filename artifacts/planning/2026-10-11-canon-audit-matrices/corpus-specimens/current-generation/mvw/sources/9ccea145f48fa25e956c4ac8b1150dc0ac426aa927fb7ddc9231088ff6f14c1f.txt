---
metadata:
  version: 1.3.0
---

## Capability

Update the body of an existing PR via REST.

## Inputs

### pr_number

PR number.

### body

PR body markdown.

## Outputs

### rendered_pr_body

The body now live on the PR after the patch.

## Protocol

### 1. Patch Body

1. Apply [resolve-repo-coordinates](./resolve-repo-coordinates.md).
2. Write `{body}` to a temp file, per `github.authored-prose-by-file`.
3. `gh api repos/{owner}/{repo}/pulls/{pr_number} -X PATCH -F body=@<file>`.
4. Set `{rendered_pr_body}` from the request body (or `.body` on the response).
