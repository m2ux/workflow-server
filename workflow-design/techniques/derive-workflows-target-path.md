---
metadata:
  version: 1.0.1
---

## Capability

Derive the dedicated workflows edit-root path `{target_path}` from the planning folder basename — `~/projects/work/workflows/{planning-slug}/` — without binding work-package issue-shaped naming conventions.

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

### 3. Path Separation

- Do not treat `{planning_folder_path}` as `{target_path}`; do not nest planning under the worktree

### 4. Report Target Path

- Include `{target_path}` in the activity's `activity_complete.variables_changed` so session state carries the edit-root path for terminal activities

## Rules

### worktree-distinct-from-planning-folder

`{target_path}` is the edit/commit/PR root; `{planning_folder_path}` is the server-owned artifact folder. Never conflate them.

### ambient-bag-variables-changed

Declared `{target_path}` appears in the activity's `variables_changed`. Terminal consumers read session state; the path is not left only in the dispatch brief.
