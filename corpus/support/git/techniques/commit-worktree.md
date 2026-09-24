---
metadata:
  version: 1.0.0
---

## Capability

Stage, commit, and push files on the branch checked out in a linked worktree.

## Inputs

### worktree_path

Absolute path of the linked worktree. Its git common directory is the parent checkout's.

### paths

Array of file paths to stage, relative to `{worktree_path}`.

### commit_message

Conventional Commits message (e.g., `docs(work-package): activity-X artifacts`)

### branch

Branch checked out in the worktree, the branch the push sends.

## Protocol

### 1. Stage and Commit

- `git -C {worktree_path} add {paths}`.
- `git -C {worktree_path} commit -s -m '{commit_message}'`.

### 2. Push the Branch

- Apply [push-branch](./push-branch.md) with `repo_path` = `{worktree_path}`, `{branch}`, and `remote_name` `origin`. Push the existing `{branch}` only. The commit is complete when the push succeeds.

## Rules

### parent-tree-unchanged

The parent checkout's index and tree stay as they stand. The commit lands on the worktree's branch.
