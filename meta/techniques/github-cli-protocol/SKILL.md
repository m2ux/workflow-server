---
name: github-cli-protocol
description: GitHub CLI operations for common PR and issue tasks, with GraphQL-deprecation workarounds.
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

## Operations

| Operation | Purpose |
|---|---|
| [update-pr-description](update-pr-description.md) | Update the body of an existing PR via REST |
| [update-pr-title](update-pr-title.md) | Update the title of an existing PR via REST |
| [add-labels](add-labels.md) | Add labels to an issue or PR via REST |
| [view-pr](view-pr.md) | View an existing PR (read-only) |
| [list-prs](list-prs.md) | List PRs (read-only) |
| [list-issues](list-issues.md) | List issues (read-only) |

## Rules

### no-graphql-mutations

Do NOT use `gh` CLI commands that mutate PRs/issues via GraphQL (e.g., `gh pr edit`) — they fail under Projects Classic deprecation. Use `gh api` with REST endpoints for all mutating operations.

### read-ops-safe

Read operations via `gh` CLI ([view-pr](view-pr.md), [list-prs](list-prs.md), [list-issues](list-issues.md)) are safe and preferred.

### ask-before-replying

Ask the user before replying to PR comments or review feedback.
