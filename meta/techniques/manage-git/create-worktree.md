---
metadata:
  version: 1.0.0
---

## Capability

Materialise a working directory as a git worktree of the component at `{target_path}` on `{branch_name}` — either creating a NEW feature branch off the component's default branch, or checking out an EXISTING branch (e.g. a PR's branch in review mode). The `create_branch` input selects between the two. Creates the `target_path` AND positions the branch in one step.

## Inputs

### target_path

Filesystem path at which to materialise the worktree (e.g. the canonical `~/projects/work/{component_name}/{wp-slug}/`).

### branch_name

Branch the worktree is checked out on — created fresh when `{create_branch}` is true, expected to exist already when it is false.

### create_branch

Optional. Boolean, default `true`. When true, create `{branch_name}` fresh off the component's default branch (`git worktree add -b`). When false, check out an existing `{branch_name}` (no `-b`) — the branch already exists upstream (e.g. a PR's branch under review).

### component_name

*(optional)* Basename of the component (submodule directory name, or basename of a standalone repo). Used to locate the component's git directory inside a monorepo reference. Omit for standalone repos. (`reference_path` is inherited from the [manage-git](./TECHNIQUE.md) group root.)

## Output

### worktree_created

Boolean — true when the worktree exists at `{target_path}` on `{branch_name}`

## Protocol

### 1. Resolve and Fetch

- Determine the component's git directory `{$component_git_dir}`: when `{reference_path}` is a monorepo and `{reference_path}/{component_name}` exists, use `{reference_path}/{component_name}`; otherwise use `{reference_path}` itself (standalone case).
- Fetch first: `git -C {component_git_dir} fetch origin` so the remote-tracking refs are current before the worktree is materialised. Resolve `{$default_branch}` via `git -C {component_git_dir} symbolic-ref refs/remotes/origin/HEAD` (fall back to `main`, then `master`).

### 2. Create Worktree

- Idempotency check: if `{target_path}` already exists, run `git -C {component_git_dir} worktree list --porcelain` and verify the path is registered as a worktree pointing at `{branch_name}`. If yes, reuse and set `{worktree_created}` = true. If `{target_path}` already exists but is not a registered worktree of the component repo (or points elsewhere), surface the conflict to the user and do NOT delete the path — offer to choose a different wp-slug or to inspect the existing directory.
- Materialise the worktree by `{create_branch}`:
  - When `{create_branch}` is true: `git -C {component_git_dir} worktree add -b {branch_name} {target_path} origin/{default_branch}`. If `{branch_name}` already exists on the component repo, ask the user whether to use the existing branch or pick a new name.
  - When `{create_branch}` is false: `git -C {component_git_dir} worktree add {target_path} {branch_name}` — check out the existing branch without `-b`.
- On success, set `{worktree_created}` = true and emit a one-line message: `Worktree created at {target_path} on branch {branch_name}.`
