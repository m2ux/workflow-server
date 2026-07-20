---
metadata:
  version: 1.0.0
---

## Capability

Push a local branch to its remote without staging or committing.

## Inputs

### repo_path

Working tree of the repository to push from.

### branch

Local branch name to push.

### remote_name

*(optional, default: `origin`)* Remote name to push to.

## Outputs

### pushed_branch

The branch that was pushed (`{remote_name}/{branch}` form or the branch name when verification only needs the local name).

## Protocol

### 1. Push Branch

- From `{repo_path}`, push `{branch}` to `{remote_name}`: `git push {remote_name} {branch}`
- Verify the push succeeded; capture `{pushed_branch}`
