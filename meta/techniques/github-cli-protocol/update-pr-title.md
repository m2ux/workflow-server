---
metadata:
  version: 1.0.0
---

## Capability

Update the title of an existing PR via REST.

## Inputs

### owner

Repo owner

### repo

Repo name

### number

PR number

## Protocol

1. `gh api repos/{owner}/{repo}/pulls/{number} -X PATCH -f title=<title>`.
