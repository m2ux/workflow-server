---
metadata:
  version: 1.0.0
---

## Capability

Dedicated workflows edit-root path derived from the planning folder basename.

## Outputs

### target_path

Filesystem path of this run's dedicated workflows worktree: `<checkout>/.worktrees/{basename(planning_folder_path)}/`. Its immediate children are workflow directories, so it is the value a guard's `--root` takes. Distinct from `{planning_folder_path}`, which holds planning artifacts and never holds definition files.

## Protocol

### 1. Extract Planning Slug

- Take the basename of `{planning_folder_path}` as `{$planning_slug}` (e.g. `2026-07-18-workflow-design-universal-worktrees`)
- Take `{$checkout_root}` as the ancestor of `{planning_folder_path}` above `.engineering/artifacts/planning/`

### 2. Compose Target Path

- Set `{target_path}` to `{$checkout_root}/.worktrees/{$planning_slug}/` — the gitignored feature-worktree directory nested in the checkout; never anchor it to a home directory or an install root
- Do not bind issue-shaped naming conventions from other workflows — the planning-folder basename is the sole path segment

## Rules

### worktree-distinct-from-planning-folder

`{target_path}` is the edit, commit and PR root; `{planning_folder_path}` is the server-owned artifact folder. Never conflate them, and never nest one inside the other.
