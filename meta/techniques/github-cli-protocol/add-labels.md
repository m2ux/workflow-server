---
metadata:
  version: 1.0.1
---

## Capability

Add labels to an issue or PR via REST.

## Inputs

### issue_number

Issue or PR number.

### labels

Comma-separated label names.

## Protocol

### 1. Add Labels

1. Apply [resolve-repo-coordinates](./TECHNIQUE.md#resolve-repo-coordinates).
2. `gh api repos/{$owner}/{$repo}/issues/{issue_number}/labels -X POST -f labels={labels}`.
