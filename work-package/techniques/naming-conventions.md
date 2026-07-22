---
metadata:
  version: 1.0.0
---

## Capability

Derive the feature branch name and the canonical worktree target path for a work package from naming conventions, keeping the worktree aligned with the server's planning folder.

## Inputs

### issue_type

The issue category (feature, bug, task, enhancement, epic) — drives the branch-name type prefix.

### issue_title

The issue title — slugified into the branch-name description segment.

### issue_number

The issue number — the branch-name issue segment.

### component_name

Basename of the component being worked on — the first path segment of the canonical worktree path.

### planning_folder_path

The server's canonical planning folder for this work package. Its basename is the work-package slug reused as the worktree name.

### is_review_mode

*(optional)* Whether this work package is in review mode, where the branch name is already captured from the PR reference.

## Outputs

### branch_name

Derived feature branch name `{type}/{issue_number}-{slugified-title}`. In review mode, the branch captured from the PR reference.

### target_path

Canonical worktree path `~/projects/work/{component_name}/{wp-slug}/`, distinct from the planning folder.

## Protocol

1. Skip branch derivation when `{is_review_mode}` is `true` — `{branch_name}` was already captured from the PR reference.
2. Derive the branch-name type prefix from `{issue_type}`: feature → `feat`, bug → `fix`, task/enhancement → `chore`/`refactor` as appropriate.
3. Slugify `{issue_title}` (lowercase, dashes, max ~40 chars) for the description segment.
4. Set `{branch_name}` to `{type}/{issue_number}-{slugified-title}` per the convention `type/issue-number-short-description`.
5. Determine the work-package slug as the basename of `{planning_folder_path}` (the planning slug `YYYY-MM-DD-{initiative-name}`), so the worktree name stays aligned with the server's planning folder. In review mode, derive the slug from the PR title or branch name instead.
6. Set `{target_path}` to the canonical worktree path `~/projects/work/{component_name}/{wp-slug}/`. From this point on, "inside `{target_path}`" refers to this worktree (not the component's checkout inside the monorepo); it is distinct from `{planning_folder_path}`, which always lives under the server's workspace `.engineering` root.

## Rules

### worktree-distinct-from-planning-folder

`{target_path}` is the worktree for edits; `{planning_folder_path}` is the server-owned artifact folder. Never conflate them or anchor the planning folder under `{target_path}`.
