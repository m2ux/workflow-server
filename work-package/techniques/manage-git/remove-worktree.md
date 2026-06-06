---
metadata:
  version: 1.0.0
---

## Capability

Tear down a worktree created earlier in the work package.

## Inputs

### component_name

*(optional)* Basename of the component (for monorepo references)

### worktree_created

Boolean — whether a worktree exists at `target-path`. Must be true to proceed; if false, this operation is a no-op

## Output

### worktree_created

Set to false on successful removal

## Protocol

1. Run only when `worktree-created` is true. Identify the component git directory the same way [create-worktree](./create-worktree.md) does (`reference-path/component-name` or `reference-path` itself).
2. Run `git -C {$component_git_dir} worktree remove {target_path}`. If the worktree has uncommitted edits, the command fails — surface this to the user rather than passing `--force`, since they may have intentional unfinished work; only remove after their explicit confirmation.
3. After successful removal, set `worktree-created = false` and emit a one-line confirmation.
