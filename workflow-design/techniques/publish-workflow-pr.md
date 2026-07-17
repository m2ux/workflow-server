---
metadata:
  version: 1.1.0
---

## Capability

Compose the workflow-design PR title and body, then publish via meta push / create-pr / mark-ready — open (or refresh) a draft PR against `workflows` and mark it ready for review.

## Outputs

### pr_title

PR title naming the workflow and the change (create / update).

### pr_body

PR body summarizing the change, listing `{scope_manifest}`, and linking `{planning_folder_path}` (completion summary and review artifacts).

### pr_url

URL of the pull request opened (or updated).

### pr_number

The pull request number.

## Protocol

### 1. Push Branch

- Apply [push-branch](../../meta/techniques/version-control/push-branch.md) with `repo_path` the workflows worktree and `branch` `{workflow_branch}`

### 2. Compose PR Description

- Compose `{pr_title}` and `{pr_body}` from the session's artifacts: the title names the workflow and the change (create / update); the body summarizes the change, lists the scope manifest from `{scope_manifest}`, and links the planning folder `{planning_folder_path}` (its completion summary and review artifacts)

### 3. Create Or Update Draft PR

- Apply [create-pr](../../meta/techniques/github-cli-protocol/create-pr.md) with `repo_path` the workflows worktree, `branch` `{workflow_branch}`, `base_branch` `workflows`, `title` `{pr_title}`, `body` `{pr_body}`, and `draft` true; capture `{pr_number}` and `{pr_url}`

### 4. Mark Ready

- Once the description is finalized and schema validation has passed, apply [mark-ready](../../meta/techniques/github-cli-protocol/mark-ready.md) with `repo_path` the workflows worktree and `{pr_number}`
