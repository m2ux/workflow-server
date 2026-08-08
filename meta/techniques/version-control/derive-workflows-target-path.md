---
metadata:
  version: 1.0.0
---

## Capability

Where a session editing the shared workflows library reads, edits and commits, derived from the planning folder that session already has.

## Inputs

### planning_folder_path

Absolute path to this session's planning folder under the server `.engineering` root. Its basename is the planning slug, and its ancestry gives the checkout.

## Outputs

### host_repo_path

Absolute path of the checkout that holds the shared workflows library — the ancestor of `{planning_folder_path}` above its `.engineering` artifact root.

### component_git_dir

Absolute path of the library's own git working tree under that checkout — the checkout a worktree of the library is added to.

### target_path

Filesystem path of this session's dedicated library worktree. Its immediate children are workflow directories, so it is the value a guard's `--root` takes. Distinct from `{planning_folder_path}`, which holds planning artifacts and never holds definition files.

## Protocol

### 1. Resolve the Checkout and the Slug

- Take the basename of `{planning_folder_path}` as `{$planning_slug}` (e.g. `2026-07-18-workflow-design-universal-worktrees`).
- Take the ancestor of `{planning_folder_path}` above `.engineering/artifacts/planning/` and emit it as `{host_repo_path}`.

### 2. Compose the Paths

- Set `{component_git_dir}` to `{host_repo_path}/workflows` — the library component whose worktree `{target_path}` is.
- Set `{target_path}` to `{host_repo_path}/.worktrees/{$planning_slug}/` — the gitignored feature-worktree directory nested in the checkout; never anchor it to a home directory or an install root.
- The planning-folder basename is the sole path segment; issue-shaped naming conventions from other workflows do not apply here.

## Rules

### worktree-distinct-from-planning-folder

`{target_path}` is the edit, commit and PR root; `{planning_folder_path}` is the server-owned artifact folder. Never conflate them, and never nest one inside the other.
