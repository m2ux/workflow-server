---
metadata:
  version: 1.0.1
---

## Capability

Submit the applied changes for review on a feature branch as a pull request against the `workflows` branch, recording its URL.

## Inputs

### branch_name

Feature branch name for the update.

#### default

`prism-update-{next_index}`

## Outputs

### pull_request_url

URL of the opened pull request.

## Protocol

### 1. Ensure Feature Branch

- When the working tree is on the `workflows` branch, create and check out a feature branch `{branch_name}` from it; otherwise keep the existing feature branch.

### 2. Push Commits

- Push the branch commits to the remote: `git push origin {branch_name}`.

### 3. Create Pull Request

- Apply [create-pr](../../meta/techniques/github-cli-protocol/create-pr.md) with `branch_name` `{branch_name}`, `base_branch` `workflows`, a change-summary `title` and `body`, and `as_draft` false; set `{pull_request_url}` from the returned `{pr_url}`.
