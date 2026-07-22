---
metadata:
  version: 1.1.0
---

## Capability

Push local commits on the feature branch to the configured push remote.

## Inputs

### target_path

Path to the edit-side checkout the push runs in (per the manage-git group's directory-scope rule, edit-side git operations run inside `{target_path}`).

### branch_name

The feature branch whose local commits are pushed to `{push_remote}`.

### push_remote

The git remote the push targets. Defaults to `origin`; a private consumer (stealth mode) sets it to its private remote (e.g. `security`) so no commit ever reaches a public destination.

`default: origin`

## Outputs

### pushed_branch

`{branch_name}` advanced on `{push_remote}` to include all local commits, with the push verified. A side-effect op; the synced remote branch is its product.

## Protocol

1. From `{target_path}`, push all local commits on `{branch_name}` to `{push_remote}`.
2. Verify the push succeeded.
