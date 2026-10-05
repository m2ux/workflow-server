---
metadata:
  version: 1.2.0
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

The branch checked out in the worktree, the branch the push sends.

## Protocol

### 1. Stage Paths

- `git -C {worktree_path} add {paths}`.

### 2. Commit Files

- `git -C {worktree_path} commit --no-gpg-sign -m '{commit_message}'`.

### 3. Push Branch

- `git -C {worktree_path} push origin {branch}`, on the host shell per `git.host-shell-for-remote-git`. The commit is complete when the push succeeds.

## Rules

### parent-tree-unchanged

The parent checkout's index and tree stay as they stand. The commit lands on the worktree's branch.
