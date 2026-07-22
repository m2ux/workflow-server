---
metadata:
  version: 1.0.0
---

## Capability

Dedicated workflows edit-root path from the planning folder basename.

## Inputs

### planning_folder_path

Absolute path to this session's planning folder under the server `.engineering` root. Only its basename (the planning slug) is used for the worktree path formula.

## Outputs

### target_path

Filesystem path of the dedicated workflows worktree for this session: `~/projects/work/workflows/{basename(planning_folder_path)}/`. Distinct from `{planning_folder_path}` — never place planning artifacts under `{target_path}`.

## Protocol

### 1. Extract Planning Slug

- Take the basename of `{planning_folder_path}` as `{$planning_slug}` (e.g. `2026-07-18-workflow-design-universal-worktrees`)

### 2. Compose Target Path

- Set `{target_path}` to `~/projects/work/workflows/{$planning_slug}/` (expand `~` to the user's home directory when materialising)
- Do not bind work-package issue-shaped naming conventions — the planning-folder basename is the sole path segment

### 3. Path Separation

- Do not treat `{planning_folder_path}` as `{target_path}`; do not nest planning under the worktree

## Rules

### worktree-distinct-from-planning-folder

`{target_path}` is the edit/commit/PR root; `{planning_folder_path}` is the server-owned artifact folder. Never conflate them.
