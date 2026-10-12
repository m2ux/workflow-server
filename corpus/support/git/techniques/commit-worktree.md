---
metadata:
  version: 1.5.0
---

## Capability

Stage and commit files on the branch checked out in a linked worktree.

## Inputs

### worktree_path

Absolute path of the linked worktree. Its git common directory is the parent checkout's.

### paths

Array of file paths to stage, relative to `{worktree_path}`.

### commit_message

*(optional)* Conventional Commits message (e.g., `docs(work-package): activity-X artifacts`)

### commit_message_file

*(optional)* Absolute path of a file holding the message, for a message carrying characters a shell argument would mangle. One of this and `{commit_message}` is set.

### carries_signoff

*(optional)* True when the commit carries a `Signed-off-by` trailer. False where the commit must carry none whatever the repository configures.

#### default

`false`

## Protocol

### 1. Stage Paths

- `git -C {worktree_path} add {paths}`.

### 2. Commit Files

- Take the message argument from the input that is set: `-F {commit_message_file}`, or `-m '{commit_message}'`.
- Take the trailer argument from `{carries_signoff}`: `--no-signoff` where it is false, and nothing where it is true.
- When `{is_signed}` is true, `git -C {worktree_path} commit -S` with both arguments.
- When `{is_signed}` is not true, `git -C {worktree_path} commit --no-gpg-sign` with both arguments.

## Rules

### parent-tree-unchanged

The parent checkout's index and tree stay as they stand. The commit lands on the worktree's branch.
