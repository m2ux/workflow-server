---
metadata:
  version: 3.1.0
---

## Capability

GitHub PR and issue tasks via the `gh` CLI, routing mutations through REST to avoid the Projects Classic GraphQL deprecation.

## Rules

### no-graphql-mutations

Do NOT use `gh` CLI commands that mutate PRs/issues via GraphQL (e.g., `gh pr edit`) — they fail under Projects Classic deprecation. Use `gh api` with REST endpoints for all mutating operations.

### read-ops-safe

Read operations via `gh` CLI ([view-pr](./view-pr.md), [view-issue](./view-issue.md), [list-prs](./list-prs.md), [list-issues](./list-issues.md)) are safe and preferred.

### json-on-single-item-views

Single-item views MUST pass `--json <fields>`. The default (field-less) view of one issue or PR resolves `projectCards`, which fails under the same Projects Classic deprecation as `no-graphql-mutations` — the whole command errors and returns nothing. `--json` selects a field set that omits `projectCards`, so it succeeds. List operations are unaffected.

### ask-before-replying

Ask the user before replying to PR comments or review feedback.
