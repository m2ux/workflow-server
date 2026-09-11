---
metadata:
  version: 1.0.0
---

## Capability

Confirmation that the target path is on a feature branch rather than main or master.

## Outputs

### on_feature_branch

Boolean — true when the worktree is on a feature branch, false when on `main`/`master`.

## Protocol

1. Inside `{target_path}`, run `git branch --show-current`.
2. Compare the result against `main` and `master`.
3. Set `{on_feature_branch}` to true when the current branch is neither `main` nor `master`, false otherwise.

## Rules

### resume-preexisted-worktree

`{on_feature_branch}` is read off the live checkout at `{target_path}`, whether that worktree was created this run or reused from an earlier one. A [create-worktree](../../../meta/techniques/version-control/create-worktree.md) invariant is not a substitute for the reading.
