---
metadata:
  version: 1.2.0
---

## Capability

View an existing PR via REST.

## Inputs

### owner

Repo owner.

### repo

Repo name.

### number

PR number.

### jq

*(optional)* `gh api --jq` expression selecting fields from the pull object. Default: full pull JSON.

## Protocol

1. `gh api repos/{owner}/{repo}/pulls/{number}` with `--jq {jq}` when `{jq}` is set.
