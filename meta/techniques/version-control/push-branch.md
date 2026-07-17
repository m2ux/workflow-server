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

### remote

*(optional, default: `origin`)* Remote name to push to.

## Outputs

### pushed_branch

The branch that was pushed (`{remote}/{branch}` form or the branch name when verification only needs the local name).

## Protocol

### 1. Push Branch

- From `{repo_path}`, push `{branch}` to `{remote}`: `git push {remote} {branch}`
- Verify the push succeeded; capture `{pushed_branch}`
