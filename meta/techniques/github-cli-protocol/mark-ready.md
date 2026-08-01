---
metadata:
  version: 1.1.1
---

## Capability

Mark an existing pull request ready for review via REST.

## Inputs

### pr_number

The pull request number to mark ready.

## Outputs

### pr_url

URL of the pull request after it is marked ready.

### pr_status

Status after the update (ready for review).

## Protocol

### 1. Mark Ready

1. Apply [resolve-repo-coordinates](./TECHNIQUE.md#resolve-repo-coordinates).
2. `gh api repos/{$owner}/{$repo}/pulls/{pr_number} -X PATCH -F draft=false`.
3. Set `{pr_url}` from `.html_url` and `{pr_status}` to ready for review.
