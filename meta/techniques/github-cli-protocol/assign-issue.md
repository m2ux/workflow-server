---
metadata:
  version: 1.0.0
---

## Capability

Assign a user to a GitHub issue via the `gh` CLI.

## Inputs

### number

Issue number

### assignee

Assignee login, or `@me` for the current user

## Protocol

1. `gh issue edit {number} --add-assignee {assignee}`.
   - If the issue is already assigned to `{assignee}`, this is a no-op — skip silently.
