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

### force_with_lease

*(optional)* True where the local branch has been rewritten and the remote must be moved to match it. False or unset for an ordinary fast-forward push.

#### default

`false`

## Outputs

### pushed_branch

The branch that was pushed (`{remote_name}/{branch}` form or the branch name when verification only needs the local name).

## Protocol

### 1. Push Branch

- From `{repo_path}`, push `{branch}` to `{remote_name}`: `git push {remote_name} {branch}`
  > At `{force_with_lease}` true, push with `--force-with-lease` instead, which moves the remote to a rewritten local branch and refuses where the remote holds a commit the local branch has not seen.
- Verify the push succeeded; capture `{pushed_branch}`
