---
metadata:
  version: 1.0.1
---

## Capability

Feature branch kept current with the default branch.

## Inputs

### default_branch

The default branch (typically `main`) fetched and rebased/merged into `{branch_name}`.

## Protocol

### 1. Bring the Branch Current

- From `{target_path}`, fetch `{default_branch}` and rebase or merge it into `{branch_name}` to bring the feature branch current.

### 2. Resolve Conflicts

- Resolve any merge conflicts before continuing. If the fetch and rebase/merge produces a conflict with the default branch, resolve the conflicts interactively, then retry.
