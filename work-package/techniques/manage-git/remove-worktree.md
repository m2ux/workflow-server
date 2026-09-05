---
metadata:
  version: 1.1.0
---

## Capability

Tear down a worktree created earlier in the work package.

## Inputs

### worktree_created

Boolean — whether a worktree exists at `{target_path}`.

## Outputs

### worktree_created

Set to false on successful removal

## Protocol

1. Run only when `{worktree_created}` is true.
2. Run `git -C {component_git_dir} worktree remove {target_path}`. If the worktree has uncommitted edits, the command fails — emit a conflict signal (uncommitted edits present) rather than passing `--force`.
3. After successful removal, set `{worktree_created}` = false and emit a one-line confirmation.
