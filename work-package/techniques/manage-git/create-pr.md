Open a draft PR linked to the issue, assigned to the current GitHub user.

## Inputs

### target_path

The working directory (worktree); all `gh` commands run from here

### branch_name

Feature branch to PR

### issue_number

Issue identifier (GitHub `#N` or Jira `KEY-N`)

### issue_platform

Platform where the issue lives (`github` or `jira`)

## Output

### pr_number

PR number

### pr_url

URL to the PR

## Protocol

### 1. Prepare PR Inputs

- BEFORE creating the PR: commit and push the planning folder to the parent (engineering) repo so the 📐 Engineering link resolves. Verify the URL will return 200 by confirming the commit is on the remote.
- Compose the PR body using the Initial template from [pr-description](../../resources/pr-description.md). Reference `issue_number` in the PR title and body.

### 2. Create and Assign Draft PR

- From `target_path`, create a draft PR: `gh pr create --draft --title "<title>" --body "<body>"`.
- Assign the PR to the current GitHub user: `gh pr edit <number> --add-assignee @me` in `target_path`.
- Keep the PR as draft until implementation and review complete.

## Errors

### pr_exists

**Cause:** PR already exists for this branch

**Recovery:** Use the existing PR
