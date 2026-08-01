---
metadata:
  version: 1.1.0
---

## Capability

Open a draft (or ready) pull request for a feature branch, or reuse the existing PR for that branch and refresh its body.

## Inputs

### owner

*(optional when `{repo_path}` is set)* Repo owner.

### repo

*(optional when `{repo_path}` is set)* Repo name.

### repo_path

*(optional when `{owner}` and `{repo}` are set)* Working tree used to derive `{owner}/{repo}` from `origin` when those inputs are unset.

### branch

Head branch to open the PR from.

### base_branch

Base branch the PR targets (e.g. `main`, `workflows`).

### title

PR title.

### body

PR body markdown.

### as_draft

*(optional, default: true)* When true, open as a draft. When false, open ready for review.

## Outputs

### pr_number

The pull request number.

### pr_url

URL of the pull request.

## Protocol

### 1. Resolve Existing Or Create

- When `{owner}` or `{repo}` is unset, derive both from `git -C {repo_path} remote get-url origin` (SSH or HTTPS form; strip trailing `.git`).
- List open pulls for the head: `gh api "repos/{owner}/{repo}/pulls?state=open&head={owner}:{branch}" --jq '.[0]'`. When a PR exists, capture `{pr_number}` and `{pr_url}` from `.number` / `.html_url` and refresh the body via [update-pr-description](./update-pr-description.md).
- Otherwise create: `gh api repos/{owner}/{repo}/pulls -f title="{title}" -f head="{branch}" -f base="{base_branch}" -f body="{body}" -F draft={as_draft}`; capture `{pr_number}` from `.number` and `{pr_url}` from `.html_url`.
