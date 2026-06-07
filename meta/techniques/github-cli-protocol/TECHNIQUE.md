---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 3.0.0
  order: 3
  legacy_id: 3
---

# Github CLI Protocol

## Capability

Operations for common GitHub PR and issue tasks via the `gh` CLI, routing mutations through REST endpoints to avoid the Projects Classic GraphQL deprecation.

## Rules

### no-graphql-mutations

Do NOT use `gh` CLI commands that mutate PRs/issues via GraphQL (e.g., `gh pr edit`) — they fail under Projects Classic deprecation. Use `gh api` with REST endpoints for all mutating operations.

### read-ops-safe

Read operations via `gh` CLI ([view-pr](./view-pr.md), [list-prs](./list-prs.md), [list-issues](./list-issues.md)) are safe and preferred.

### ask-before-replying

Ask the user before replying to PR comments or review feedback.
