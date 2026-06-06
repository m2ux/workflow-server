---
metadata:
  version: 1.0.0
---

## Capability

Materialise a working directory as a git worktree on a new feature branch off the component's default branch. Creates the target-path AND the feature branch in one step.

## Inputs

### component-name

*(optional)* Basename of the component (submodule directory name, or basename of a standalone repo). Used to locate the component's git directory inside a monorepo reference. Omit for standalone repos.

## Output

### worktree-created

Boolean — true when the worktree exists at `target-path` on `branch-name`

## Protocol

### 1. Resolve and Fetch

- Determine the component's git directory: when `reference-path` is a monorepo and `{reference-path}/{component-name}` exists, use `{reference-path}/{component-name}`; otherwise use `reference-path` itself (standalone case).
- Fetch first: `git -C {$component-git-dir} fetch origin` so `origin/{$default-branch}` is current before the worktree is materialised. Resolve `{$default-branch}` via `git -C {$component-git-dir} symbolic-ref refs/remotes/origin/HEAD` (fall back to `main`, then `master`).

### 2. Create Worktree

- Idempotency check: if `{target-path}` already exists, run `git -C {$component-git-dir} worktree list --porcelain` and verify the path is registered as a worktree pointing at `branch-name`. If yes, reuse and set `worktree-created = true`. If `{target-path}` already exists but is not a registered worktree of the component repo (or points elsewhere), surface the conflict to the user and do NOT delete the path — offer to choose a different wp-slug or to inspect the existing directory.
- Create the worktree: `git -C {$component-git-dir} worktree add -b {branch-name} {target-path} origin/{$default-branch}`.
  - If `{branch-name}` already exists on the component repo, ask the user whether to use the existing branch or pick a new name.
- On success, set `worktree-created = true` and emit a one-line message: `Worktree created at {target-path} on branch {branch-name} (from origin/{$default-branch}).`
