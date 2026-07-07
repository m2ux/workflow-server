---
metadata:
  version: 1.0.0
---

## Capability

Push the workflow's feature branch, open (or update) a pull request against the `workflows` branch, and mark it ready for review.

## Outputs

### pr_url

URL of the pull request opened (or updated) for the workflow change.

### pr_number

The pull request number.

## Protocol

### 1. Push Branch

- Push `{workflow_branch}` to `origin` in the workflows repo and verify the push succeeded

### 2. Open Or Update PR

- Compose the PR title and body from the session's artifacts: the title names the workflow and the change (create / update); the body summarizes the change, lists the scope manifest from `{scope_manifest}`, and links the planning folder `{planning_folder_path}` (its completion summary and review artifacts)
- Open a draft PR for `{workflow_branch}` against the `workflows` branch (`gh pr create --base workflows --draft`); if a PR already exists for the branch, update its description instead. Capture `{pr_url}` and `{pr_number}`

### 3. Mark Ready

- Once the description is finalized and schema validation has passed, mark the PR ready for review (`gh pr ready`)
