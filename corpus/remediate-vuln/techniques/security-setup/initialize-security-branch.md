---
metadata:
  version: 1.1.0
---

## Capability

Fetch from the private fork's remote and check out a fresh local feature branch off the private fork, named for the advisory.

## Inputs

### base_remote

The remote naming the private fork, which the security branch is cut from.

### short_id

Short slug identifying the advisory, used to form the branch name.

## Outputs

### branch_name

Name of the local security feature branch, formed as `vuln/remediate-{short_id}` and checked out off the private fork.

### default_branch

The private fork's default branch, which the security branch syncs from and merges into.

## Protocol

### 1. Fetch Security Remote

- Fetch from `{base_remote}` inside `{target_path}` so the private fork's refs are current.

### 2. Resolve Default Branch

- Resolve `{default_branch}` from `git -C {target_path} ls-remote --symref {base_remote} HEAD`.
  > Where the remote reports no `HEAD`, take `main`, then `master`.

### 3. Create Security Branch

- Set `{branch_name}` to `` `vuln/remediate-{short_id}` ``.
- Check out a new local branch named `{branch_name}` off `{base_remote}/{default_branch}`.
