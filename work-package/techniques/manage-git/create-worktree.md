---
metadata:
  version: 1.0.0
---

## Capability

Materialise a working directory as a git worktree on a new feature branch off the component's default branch. Creates the `target_path` AND the feature branch in one step.

## Inputs

### component_name

*(optional)* Basename of the component (submodule directory name, or basename of a standalone repo). Used to locate the component's git directory inside a monorepo reference. Omit for standalone repos.

## Output

### worktree_created

Boolean — true when the worktree exists at `{target_path}` on `{branch_name}`

## Protocol

### 1. Resolve and Fetch

- Determine the component's git directory `{$component_git_dir}`: when `{reference_path}` is a monorepo and `{reference_path}/{component_name}` exists, use `{reference_path}/{component_name}`; otherwise use `{reference_path}` itself (standalone case).
- Fetch first: `git -C {component_git_dir} fetch origin` so the remote-tracking refs are current before the worktree is materialised. Resolve `{$default_branch}` via `git -C {component_git_dir} symbolic-ref refs/remotes/origin/HEAD` (fall back to `main`, then `master`).

### 2. Create Worktree

- Idempotency check: if `{target_path}` already exists, run `git -C {component_git_dir} worktree list --porcelain` and verify the path is registered as a worktree pointing at `{branch_name}`. If yes, reuse and set `{worktree_created}` = true. If `{target_path}` already exists but is not a registered worktree of the component repo (or points elsewhere), surface the conflict to the user and do NOT delete the path — offer to choose a different wp-slug or to inspect the existing directory.
- Create the worktree: `git -C {component_git_dir} worktree add -b {branch_name} {target_path} origin/{default_branch}`.
  - If `{branch_name}` already exists on the component repo, ask the user whether to use the existing branch or pick a new name.
- On success, set `{worktree_created}` = true and emit a one-line message: `Worktree created at {target_path} on branch {branch_name} (from origin/{default_branch}).`
