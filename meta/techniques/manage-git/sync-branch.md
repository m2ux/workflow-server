---
metadata:
  version: 1.0.0
---

## Capability

Fetch and rebase/merge from the default branch to keep the feature branch current.

## Inputs

### target_path

Path to the edit-side checkout the fetch and rebase/merge run in (per the [manage-git](./TECHNIQUE.md) group's directory-scope rule, edit-side git operations run inside `{target_path}`).

### branch_name

The feature branch brought current with the default branch.

### default_branch

The default branch (typically `main`) fetched and rebased/merged into `{branch_name}`.

## Output

### synced_branch

`{branch_name}` updated to include the latest default-branch commits, with any conflicts resolved. A side-effect op; the current feature branch is its product.

## Protocol

1. From `{target_path}`, fetch the default branch and rebase or merge it into `{branch_name}` to bring the feature branch current.
2. Resolve any merge conflicts before continuing. If the fetch and rebase/merge produces a conflict with the default branch, resolve the conflicts interactively, then retry.
3. Sync before pushing to avoid push-time conflicts.
