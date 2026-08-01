---
metadata:
  version: 1.1.0
---

## Capability

List pull requests via REST.

## Inputs

### owner

Repo owner.

### repo

Repo name.

### query

*(optional)* Query string for the pulls list (e.g. `state=open&sort=updated`). Default `state=open`.

## Protocol

1. `gh api "repos/{owner}/{repo}/pulls?{query}" --paginate`.
