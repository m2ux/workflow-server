---
metadata:
  version: 1.2.0
---

## Capability

Draft PR linked to the issue and assigned to the current GitHub user.

## Inputs

### issue_number

Issue identifier (GitHub `#N` or Jira `KEY-N`)

### issue_platform

Platform where the issue lives (`github` or `jira`)

### target_path

Working tree of the repository in which to create the PR.

### branch_name

Head branch to open the PR from.

## Outputs

### pr_number

PR number

### pr_url

URL to the PR


## Protocol

### 1. Prepare PR Inputs

- BEFORE creating the PR: honor [push-before-linking](../manage-artifacts/TECHNIQUE.md#push-before-linking) for `{planning_folder_path}`.
- Compose the PR title and body using the [Template (Initial)](../../resources/pr-description.md#template-initial). Reference `{issue_number}` per `{issue_platform}` (GitHub `#N` vs Jira `KEY-N`).

### 2. Create Draft PR

- Apply [create-pr](../../../meta/techniques/github-cli-protocol/create-pr.md) with `repo_path` `{target_path}`, `branch_name` `{branch_name}`, `base_branch` the repo default (or the configured base), `title` and `body` from step 1, and `as_draft` true; capture `{pr_number}` and `{pr_url}`

### 3. Assign Current User

- Apply [assign-issue](../../../meta/techniques/github-cli-protocol/assign-issue.md) with `issue_number` `{pr_number}` and `assignee` `@me` (PR numbers share the issues assignees endpoint).
- Keep the PR as draft until implementation and review complete
