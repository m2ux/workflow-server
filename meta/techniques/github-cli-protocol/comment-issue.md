---
metadata:
  version: 1.1.0
---

## Capability

Post a markdown comment to a GitHub issue via REST.

## Inputs

### owner

Repo owner.

### repo

Repo name.

### number

Issue number.

### body

Markdown comment body.

## Protocol

1. `gh api repos/{owner}/{repo}/issues/{number}/comments -f body="{body}"`.
