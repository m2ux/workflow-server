---
metadata:
  version: 1.0.0
---

## Capability

Push all local commits to the remote feature branch.

## Inputs

### branch_name

The feature branch whose local commits are pushed to the remote (inherited from the [update-pr](./TECHNIQUE.md) group root).

### pr_number

The PR being updated (inherited from the [update-pr](./TECHNIQUE.md) group root).

## Output

### pushed_branch

The remote `{branch_name}` after a verified push: all local commits present on the remote, with any rejected push resolved by pull-and-rebase before retrying.

## Protocol

1. Push all local commits to the remote `{branch_name}`.
2. Verify the push succeeded.
3. If the push is rejected because the remote branch has diverged, pull and rebase before pushing again.
4. Do not update the `{pr_number}` PR until the push completes.
