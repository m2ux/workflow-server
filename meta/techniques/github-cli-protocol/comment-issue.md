---
metadata:
  version: 1.1.1
---

## Capability

Post a markdown comment to a GitHub issue via REST.

## Inputs

### issue_number

Issue number.

### body

Markdown comment body.

## Protocol

### 1. Post Comment

1. Apply [resolve-repo-coordinates](./TECHNIQUE.md#resolve-repo-coordinates).
2. `gh api repos/{$owner}/{$repo}/issues/{issue_number}/comments -f body="{body}"`.
