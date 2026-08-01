---
metadata:
  version: 1.1.0
---

## Capability

List issues via REST.

## Inputs

### owner

Repo owner.

### repo

Repo name.

### query

*(optional)* Query string for the issues list (e.g. `state=open&labels=bug`). Default `state=open`. Pull requests appear in this endpoint unless filtered out in post-processing.

## Protocol

1. `gh api "repos/{owner}/{repo}/issues?{query}" --paginate`.
