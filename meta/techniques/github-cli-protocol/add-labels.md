Add labels to an issue or PR via REST.

## Inputs

### owner

Repo owner

### repo

Repo name

### number

Issue or PR number

### labels

Comma-separated label names

## Protocol

1. `gh api repos/{owner}/{repo}/issues/{number}/labels -X POST -f labels={labels}`.
