---
metadata:
  version: 1.1.0
---

## Capability

Open a draft PR linked to the issue, assigned to the current GitHub user — composing work-package-specific title/body, then creating via meta [create-pr](../../../meta/techniques/github-cli-protocol/create-pr.md).

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
- Compose the PR title and body using the [Template (Initial)](../../resources/pr-description.md#template-initial) from pr-description. Reference `{issue_number}` in the PR title and body, formatting the issue link according to `{issue_platform}` (GitHub `#N` vs Jira `KEY-N`).

### 2. Create Draft PR

- Apply [create-pr](../../../meta/techniques/github-cli-protocol/create-pr.md) with `repo_path` `{target_path}`, `branch` `{branch_name}`, `base_branch` the repo default (or the configured base), `title` and `body` from step 1, and `draft` true; capture `{pr_number}` and `{pr_url}`
- Assign the PR to the current GitHub user via REST (`gh api` assignee endpoint) — do not use `gh pr edit` (`no-graphql-mutations`)
- Keep the PR as draft until implementation and review complete
