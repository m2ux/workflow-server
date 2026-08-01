---
metadata:
  version: 1.1.0
---

## Capability

Mark an existing pull request ready for review via REST.

## Inputs

### owner

*(optional when `{repo_path}` is set)* Repo owner.

### repo

*(optional when `{repo_path}` is set)* Repo name.

### repo_path

*(optional when `{owner}` and `{repo}` are set)* Working tree used to derive `{owner}/{repo}` from `origin` when those inputs are unset.

### pr_number

The pull request number to mark ready.

## Outputs

### pr_url

URL of the pull request after it is marked ready.

### pr_status

Status after the update (ready for review).

## Protocol

### 1. Mark Ready

- When `{owner}` or `{repo}` is unset, derive both from `git -C {repo_path} remote get-url origin` (SSH or HTTPS form; strip trailing `.git`).
- `gh api repos/{owner}/{repo}/pulls/{pr_number} -X PATCH -F draft=false`
- Capture `{pr_url}` from `.html_url` and set `{pr_status}` to ready for review.
