---
metadata:
  version: 1.0.0
---

## Capability

Fetch and rebase/merge from the default branch to keep the feature branch current.

## Inputs

### target_path

The working directory (worktree)

### branch_name

Feature branch to sync

## Protocol

1. From `target_path`, fetch the default branch and rebase or merge it into `branch_name` to bring the feature branch current.
2. Resolve any merge conflicts before continuing.
3. Sync before pushing to avoid push-time conflicts.

## Errors

### merge_conflict

**Cause:** Conflict when syncing with the default branch

**Recovery:** Resolve conflicts interactively, then retry
