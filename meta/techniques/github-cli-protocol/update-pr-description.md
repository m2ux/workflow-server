---
metadata:
  version: 1.0.0
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

## Protocol

1. `gh api repos/{owner}/{repo}/pulls/{number} -X PATCH -f body=<content>`. Use this REST endpoint rather than `gh pr edit` or other GraphQL-based mutation commands: if those fail with a Projects Classic deprecation error, fall back to this `gh api` REST call.
