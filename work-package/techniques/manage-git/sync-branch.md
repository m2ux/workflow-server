---
metadata:
  version: 1.0.0
---

## Capability

Fetch and rebase/merge from the default branch to keep the feature branch current.

## Protocol

1. From `{target_path}`, fetch the default branch and rebase or merge it into `{branch_name}` to bring the feature branch current.
2. Resolve any merge conflicts before continuing. If the fetch and rebase/merge produces a conflict with the default branch, resolve the conflicts interactively, then retry.
3. Sync before pushing to avoid push-time conflicts.
