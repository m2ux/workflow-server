---
metadata:
  version: 3.3.0
---

## Capability

GitHub PR and issue tasks via `gh api` REST endpoints. High-level `gh pr` / `gh issue` subcommands are not used — they resolve GraphQL paths that fail under Projects Classic deprecation and are unreliable in this environment.

## Rules

### rest-only

Every GitHub read and write in this technique is a `gh api` call against a REST path under `repos/{owner}/{repo}/…` (or `user`). Do not invoke `gh pr *`, `gh issue *`, or any command that posts to `api.github.com/graphql`.

### ask-before-replying

Ask the user before replying to PR comments or review feedback.
