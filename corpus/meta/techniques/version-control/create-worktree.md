---
metadata:
  version: 1.1.0
---

## Capability

Working directory materialised as a git worktree of the component, on either a feature branch created fresh or an existing branch checked out.

## Inputs

### branch_name

The branch the worktree stands on — created fresh, or checked out where it already exists.

### target_path

Where the worktree is materialised. A path of its own per worktree: git registers one checkout per path, so two callers naming one path are asking for a checkout that cannot exist twice.

### component_git_dir

The repository the worktree belongs to. Its administrative files are what `git worktree add` writes, and its `origin/HEAD` is what a fresh branch is based on.

### create_branch

*(optional)* Boolean. When true, create `{branch_name}` fresh off the component's default branch (`git worktree add -b`). When false, check out an existing `{branch_name}` (no `-b`) — the branch already exists upstream (e.g. a PR's branch under review).

#### default

`true`. A caller naming a branch that does not exist yet is the common case; checking one out is the exception a caller states.

## Outputs

### worktree_created

Boolean — true when the worktree exists at `{target_path}` on `{branch_name}`

### default_branch

The component's default branch, read off `refs/remotes/origin/HEAD` and falling back to `main`, then `master`. Feature branches are created off it, and sync back from it.

## Protocol

### 1. Fetch

- Fetch first: `git -C {component_git_dir} fetch origin` so the remote-tracking refs are current before the worktree is materialised.
- Resolve `{default_branch}` via `git -C {component_git_dir} symbolic-ref refs/remotes/origin/HEAD`, falling back to `main`, then `master`, and emit it.

### 2. Create Worktree

- Idempotency check: if `{target_path}` already exists, run `git -C {component_git_dir} worktree list --porcelain` and verify the path is registered as a worktree pointing at `{branch_name}`. If yes, reuse and set `{worktree_created}` = true. If `{target_path}` already exists but is not a registered worktree of the component repo (or points elsewhere), emit a conflict signal naming the path and what occupies it, and leave the path untouched.
- Materialise path and branch position in one step, choosing the form by `{create_branch}`.
  > - When `{create_branch}` is true: `git -C {component_git_dir} worktree add -b {branch_name} {target_path} origin/{default_branch}`. If `{branch_name}` already exists on the component repo, emit a conflict signal naming the branch and leave the worktree unmaterialised.
  > - When `{create_branch}` is false: `git -C {component_git_dir} worktree add {target_path} {branch_name}`, which checks out the existing branch without `-b`.
- On success, set `{worktree_created}` = true and emit a one-line message: `Worktree created at {target_path} on branch {branch_name}.`
