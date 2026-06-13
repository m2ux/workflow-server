---
metadata:
  version: 1.0.0
---

## Capability

Push all local commits on the security feature branch to the `security` remote only, so the fix reaches the designated private fork and no public destination.

## Outputs

### pushed_branch

`{branch_name}` advanced on the `security` remote to include all local commits, with the push verified. A side-effect op; the synced private branch is its product.

## Protocol

### 1. Push Secure Commits

- From `{target_path}`, push all local commits on `{branch_name}` to the `security` remote with `` `git push security HEAD` ``.
- Verify the push succeeded and reached the private fork.
