# update-pr-description

Update the body of an existing PR via REST.

## Inputs

- **owner** — Repo owner (e.g., `m2ux`)
- **repo** — Repo name
- **number** — PR number

## Procedure

1. `gh api repos/{owner}/{repo}/pulls/{number} -X PATCH -f body=<content>`.

## Errors

### graphql-deprecation

**Cause:** `gh pr edit` or similar GraphQL-based mutation command failed with the Projects Classic deprecation error.

**Recovery:** Use the equivalent REST API endpoint via `gh api` (as in this operation's procedure).
