---
metadata:
  version: 1.0.0
---

## Capability

Confirmation that the target path is on a feature branch rather than main or master.

## Inputs

### target_path

The worktree root the work package operates inside.

## Outputs

### on_feature_branch

Boolean — true when the worktree is on a feature branch, false when on `main`/`master`.


## Protocol

1. Inside `{target_path}`, run `git branch --show-current`.
2. Compare the result against `main` and `master`.
3. Set `on_feature_branch` to true when the current branch is neither `main` nor `master`, false otherwise.

## Rules

### resume-preexisted-worktree

On a fresh [create-worktree](./create-worktree.md) path this check is always true. It exists for resume cases where `{target_path}` already existed and an established worktree was reused — report `{on_feature_branch}` from the live checkout, do not assume create-worktree invariants.
