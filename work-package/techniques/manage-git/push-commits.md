---
metadata:
  version: 1.0.0
---

## Capability

Push local commits on the feature branch to the remote.

## Inputs

### target_path

Path to the edit-side checkout the push runs in (per the [manage-git](./TECHNIQUE.md) group's directory-scope rule, edit-side git operations run inside `{target_path}`).

### branch_name

The feature branch whose local commits are pushed to `origin`.

## Output

### pushed_branch

`{branch_name}` advanced on `origin` to include all local commits, with the push verified. A side-effect op; the synced remote branch is its product.

## Protocol

1. From `{target_path}`, push all local commits on `{branch_name}` to `origin`.
2. Verify the push succeeded.
