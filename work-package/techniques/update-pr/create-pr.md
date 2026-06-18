---
metadata:
  version: 1.0.0
---

## Capability

Open a draft PR linked to the issue, assigned to the current GitHub user.

## Inputs

### issue_number

Issue identifier (GitHub `#N` or Jira `KEY-N`)

### issue_platform

Platform where the issue lives (`github` or `jira`)

## Outputs

### pr_number

PR number

### pr_url

URL to the PR

## Protocol

### 1. Prepare PR Inputs

- BEFORE creating the PR: commit and push `{planning_folder_path}` to the parent (engineering) repo so the 📐 Engineering link resolves. Verify the URL will return 200 by confirming the commit is on the remote.
- Compose the PR body using the Initial template from [pr-description](../../resources/pr-description.md). Reference `{issue_number}` in the PR title and body, formatting the issue link according to `{issue_platform}` (GitHub `#N` vs Jira `KEY-N`).

### 2. Create and Assign Draft PR

- From `{target_path}`, open a draft PR for the `{branch_name}` feature branch: `gh pr create --draft --title "<title>" --body "<body>"`. Capture the returned `{pr_number}` and `{pr_url}` from the command output. If a PR already exists for this branch, use the existing PR instead of creating a new one.
- Assign the PR to the current GitHub user: `gh pr edit {pr_number} --add-assignee @me` in `{target_path}`.
- Keep the PR as draft until implementation and review complete.
