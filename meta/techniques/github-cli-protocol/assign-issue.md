---
metadata:
  version: 1.1.1
---

## Capability

Assign a user to a GitHub issue via REST.

## Inputs

### issue_number

Issue number.

### assignee

Assignee login, or the literal `@me` for the authenticated user.

## Protocol

### 1. Resolve Assignee Login

1. When `{assignee}` is `@me`, set `{$assignee_login}` from `gh api user --jq .login`; otherwise set `{$assignee_login}` to `{assignee}`.

### 2. Assign

1. Apply [resolve-repo-coordinates](./resolve-repo-coordinates.md).
2. `gh api repos/{owner}/{repo}/issues/{issue_number}/assignees -f "assignees[]={$assignee_login}"`.
   - When the issue is already assigned to `{$assignee_login}`, this is a no-op — skip silently.
