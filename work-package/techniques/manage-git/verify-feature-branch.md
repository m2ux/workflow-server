---
metadata:
  version: 1.0.0
---

## Capability

Inside the target worktree, verify the checkout is on a feature branch rather than `main`/`master`, and report the branch-state. With the worktree-creation flow this is always true on a fresh worktree; the check exists to handle resume cases where `{target_path}` pre-existed and an established worktree was reused.

## Inputs

### target_path

The worktree root the work package operates inside.

## Protocol

1. Inside `{target_path}`, run `git branch --show-current`.
2. Compare the result against `main` and `master`.
3. Set `on_feature_branch` to true when the current branch is neither `main` nor `master`, false otherwise.

## Outputs

### on_feature_branch

Boolean — true when the worktree is on a feature branch, false when on `main`/`master`.
