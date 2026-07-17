---
metadata:
  version: 1.0.0
---

## Capability

Mark an existing pull request ready for review.

## Inputs

### repo_path

Working tree of the repository that owns the PR (cwd for `gh`).

### pr_number

The pull request number to mark ready.

## Outputs

### pr_url

URL of the pull request after it is marked ready.

### pr_status

Status after the update (ready for review).

## Protocol

### 1. Mark Ready

- From `{repo_path}`, mark `{pr_number}` ready for review: `gh pr ready {pr_number}`
- Capture `{pr_url}` and `{pr_status}` from the resulting PR view
