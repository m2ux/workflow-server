---
metadata:
  version: 1.4.0
---

## Capability

Stage and commit files on the branch checked out in a linked worktree.

## Inputs

### worktree_path

Absolute path of the linked worktree. Its git common directory is the parent checkout's.

### paths

Array of file paths to stage, relative to `{worktree_path}`.

### commit_message

Conventional Commits message (e.g., `docs(work-package): activity-X artifacts`)

## Protocol

### 1. Stage Paths

- `git -C {worktree_path} add {paths}`.

### 2. Commit Files

- When `{is_signed}` is true, `git -C {worktree_path} commit -S -m '{commit_message}'`.
- When `{is_signed}` is not true, `git -C {worktree_path} commit --no-gpg-sign -m '{commit_message}'`.

## Rules

### parent-tree-unchanged

The parent checkout's index and tree stay as they stand. The commit lands on the worktree's branch.
