# remove-worktree

Tear down a worktree created earlier in the work package.

## Inputs

### reference_path

Path to the reference checkout

### component_name

*(optional)* Basename of the component (for monorepo references)

### target_path

The worktree path to remove

### worktree_created

Must be true (set by [create-worktree](create-worktree.md)); if false, this operation is a no-op

## Output

### worktree_created

Set to false on successful removal

## Procedure

1. Run only when `worktree_created` is true. Identify the component git directory the same way [create-worktree](create-worktree.md) does (`reference_path/component_name` or `reference_path` itself).
2. Run `git -C {component_git_dir} worktree remove {target_path}`. If the worktree has uncommitted changes, the command fails — surface that as `worktree_dirty_on_remove` rather than passing `--force`; uncommitted edits at completion are likely a mistake.
3. After successful removal, set `worktree_created = false` and emit a one-line confirmation.

## Errors

### worktree_dirty_on_remove

**Cause:** worktree-remove found uncommitted edits in `target_path` at completion time

**Recovery:** Surface to the user — they may have intentional unfinished work; only remove after explicit confirmation
