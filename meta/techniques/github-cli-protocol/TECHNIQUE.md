---
metadata:
  version: 3.0.0
---

## Capability

GitHub PR and issue tasks via the `gh` CLI, routing mutations through REST to avoid the Projects Classic GraphQL deprecation.

## Rules

### no-graphql-mutations

Do NOT use `gh` CLI commands that mutate PRs/issues via GraphQL (e.g., `gh pr edit`) — they fail under Projects Classic deprecation. Use `gh api` with REST endpoints for all mutating operations.

### read-ops-safe

Read operations via `gh` CLI ([view-pr](./view-pr.md), [view-issue](./view-issue.md), [list-prs](./list-prs.md), [list-issues](./list-issues.md)) are safe and preferred.

### ask-before-replying

Ask the user before replying to PR comments or review feedback.
