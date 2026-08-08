---
metadata:
  version: 1.2.0
---

## Capability

Dedicated workflows edit-root path derived from the planning folder basename.

## Outputs

### target_path

Filesystem path of this run's dedicated workflows worktree: `<checkout>/.worktrees/{basename(planning_folder_path)}/`. Its immediate children are workflow directories, so it is the value a guard's `--root` takes. Distinct from `{planning_folder_path}`, which holds planning artifacts and never holds definition files.

### host_repo_path

Absolute path of the checkout that contains the shared workflows library — the ancestor of `{planning_folder_path}` above its `.engineering` artifact root. The library itself is the `workflows` component under it.

### component_git_dir

Absolute path of the workflows library's own git working tree under the checkout — the checkout worktrees of the library are added to.

## Protocol

### 1. Extract Planning Slug

- Take the basename of `{planning_folder_path}` as `{$planning_slug}` (e.g. `2026-07-18-workflow-design-universal-worktrees`)
- Take `{host_repo_path}` as the ancestor of `{planning_folder_path}` above `.engineering/artifacts/planning/`

### 2. Compose Target Path

- Set `{target_path}` to `{host_repo_path}/.worktrees/{$planning_slug}/` — the gitignored feature-worktree directory nested in the checkout; never anchor it to a home directory or an install root
- Set `{component_git_dir}` to `{host_repo_path}/workflows` — the library component whose worktree `{target_path}` is
- Do not bind issue-shaped naming conventions from other workflows — the planning-folder basename is the sole path segment

## Rules

### worktree-distinct-from-planning-folder

`{target_path}` is the edit, commit and PR root; `{planning_folder_path}` is the server-owned artifact folder. Never conflate them, and never nest one inside the other.
