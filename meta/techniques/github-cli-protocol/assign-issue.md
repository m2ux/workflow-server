---
metadata:
  version: 1.1.0
---

## Capability

Assign a user to a GitHub issue via REST.

## Inputs

### owner

Repo owner.

### repo

Repo name.

### number

Issue number.

### assignee

Assignee login. When the caller means the authenticated user, resolve login first with `gh api user --jq .login` and pass that login as `{assignee}`.

## Protocol

1. `gh api repos/{owner}/{repo}/issues/{number}/assignees -f "assignees[]={assignee}"`.
   - If the issue is already assigned to `{assignee}`, this is a no-op — skip silently.
