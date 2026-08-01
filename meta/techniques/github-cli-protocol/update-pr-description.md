---
metadata:
  version: 1.1.0
---

## Capability

Update the body of an existing PR via REST.

## Inputs

### owner

Repo owner (e.g., `m2ux`)

### repo

Repo name

### number

PR number

### body

*(optional when supplied via file)* PR body markdown. Prefer `-F body=@<file>` for multi-line bodies.

## Protocol

1. `gh api repos/{owner}/{repo}/pulls/{number} -X PATCH -f body="{body}"` (or `-F body=@<file>` when the body is on disk).
