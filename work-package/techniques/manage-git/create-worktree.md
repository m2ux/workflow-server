---
metadata:
  version: 1.0.0
---

## Capability

Working directory materialised as a git worktree of the component at `{target_path}` on `{branch_name}` (new feature branch or existing branch). `{create_branch}` selects between the two.

## Inputs

### target_path

Filesystem path at which to materialise the worktree.

### branch_name

Branch the worktree is checked out on — created fresh when `{create_branch}` is true, expected to exist already when it is false.

### create_branch

Optional. Boolean, default `true`. When true, create `{branch_name}` fresh off the component's default branch (`git worktree add -b`). When false, check out an existing `{branch_name}` (no `-b`) — the branch already exists upstream (e.g. a PR's branch under review).

### repo_root

Product repo root (monorepo root when the component is a submodule) used to locate the component git directory for `git worktree add`.

### component_name

*(optional)* Basename of the component (submodule directory name, or basename of a standalone repo). Used to locate the component's git directory under `{repo_root}` when the path `{repo_root}/{component_name}` exists. Omit for standalone repos.

## Outputs

### worktree_created

Boolean — true when the worktree exists at `{target_path}` on `{branch_name}`


## Protocol

### 1. Resolve and Fetch

- Determine the component's git directory `{$component_git_dir}`: when `{repo_root}` is a monorepo and `{repo_root}/{component_name}` exists, use `{repo_root}/{component_name}`; otherwise use `{repo_root}` itself (standalone case).
- Fetch first: `git -C {component_git_dir} fetch origin` so the remote-tracking refs are current before the worktree is materialised. Resolve `{$default_branch}` via `git -C {component_git_dir} symbolic-ref refs/remotes/origin/HEAD` (fall back to `main`, then `master`).

### 2. Create Worktree

- Idempotency check: if `{target_path}` already exists, run `git -C {component_git_dir} worktree list --porcelain` and verify the path is registered as a worktree pointing at `{branch_name}`. If yes, reuse and set `{worktree_created}` = true. If `{target_path}` already exists but is not a registered worktree of the component repo (or points elsewhere), surface the conflict to the user and do NOT delete the path — offer to choose a different wp-slug or to inspect the existing directory.
- Materialise path and branch position in one step by `{create_branch}`:
  - When `{create_branch}` is true: `git -C {component_git_dir} worktree add -b {branch_name} {target_path} origin/{default_branch}`. If `{branch_name}` already exists on the component repo, ask the user whether to use the existing branch or pick a new name.
  - When `{create_branch}` is false: `git -C {component_git_dir} worktree add {target_path} {branch_name}` — check out the existing branch without `-b`.
- On success, set `{worktree_created}` = true and emit a one-line message: `Worktree created at {target_path} on branch {branch_name}.`
