# update-pr-title

Update the title of an existing PR via REST.

## Inputs

### owner

Repo owner

### repo

Repo name

### number

PR number

## Procedure

1. `gh api repos/{owner}/{repo}/pulls/{number} -X PATCH -f title=<title>`.
