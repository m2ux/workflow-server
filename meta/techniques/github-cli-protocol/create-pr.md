---
metadata:
  version: 1.0.0
---

## Capability

Open a draft (or ready) pull request for a feature branch, or reuse the existing PR for that branch and refresh its body.

## Inputs

### repo_path

Working tree of the repository in which to create the PR (cwd for `gh`).

### branch

Head branch to open the PR from.

### base_branch

Base branch the PR targets (e.g. `main`, `workflows`).

### title

PR title.

### body

PR body markdown.

### as_draft

*(optional, default: true)* When true, open as a draft (`--draft`). When false, open ready for review.

## Outputs

### pr_number

The pull request number.

### pr_url

URL of the pull request.

## Protocol

### 1. Resolve Existing Or Create

- From `{repo_path}`, if a PR already exists for `{branch}`, capture its `{pr_number}` and `{pr_url}` and update its body via [update-pr-description](./update-pr-description.md) (resolve `{owner}` / `{repo}` / `{number}` from `gh` context for that PR)
- Otherwise open the PR: `gh pr create --base {base_branch} --title "{title}" --body "{body}"` with `--draft` when `{as_draft}` is true; capture `{pr_number}` and `{pr_url}` from the command output

## Rules

### no-graphql-create-path

Do not use `gh pr edit` or other GraphQL mutations for assignee/body updates — use REST via [update-pr-description](./update-pr-description.md) / sibling ops (`no-graphql-mutations` on the group contract).
