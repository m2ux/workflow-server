---
metadata:
  version: 1.1.0
---

## Capability

Derive the feature branch name and the canonical worktree target path for a work package from naming conventions, keeping the worktree aligned with the server's planning folder.

## Inputs

### issue_type

The issue category (feature, bug, task, enhancement, epic) — drives the branch-name type prefix through a total mapping, one prefix per category.

### issue_title

The issue title — slugified into the branch-name description segment.

### issue_number

The issue number — the branch-name issue segment.

### component_name

Basename of the component being worked on — used as the first path segment of the personal-layout worktree path.

### is_review_mode

*(optional)* Whether this work package is in review mode, where the branch name is already captured from the PR reference.

## Outputs

### branch_name

Derived feature branch name `{type}/{issue_number}-{slugified-title}`. In review mode, the branch captured from the PR reference.

### target_path

Canonical feature-worktree path `<checkout>/.worktrees/<slug>/`, distinct from `{planning_folder_path}` and from `{host_repo_path}`.

## Protocol

1. Skip branch derivation when `{is_review_mode}` is `true` — `{branch_name}` was already captured from the PR reference.
2. Set `{$branch_type_prefix}` from `{issue_type}`, which is one of the five categories [issue-type-detection](./issue-type-detection.md) settles. The table is total, so no run supplies a prefix of its own:

   | `{issue_type}` | `{$branch_type_prefix}` | Why |
   |---|---|---|
   | `feature` | `feat` | delivers capability that was not there |
   | `enhancement` | `feat` | delivers capability the user sees, on something already there |
   | `epic` | `feat` | the epic's own delivery branch; its member tickets carry their own |
   | `bug` | `fix` | restores stated behaviour |
   | `task` | `chore` | maintenance with no change to capability |

   Stop and report when `{issue_type}` is unset: the prefix is part of the branch and pull-request identity and is expensive to change once a pull request is open, so an unsettled category is never this step's to guess.
3. Slugify `{issue_title}` (lowercase, dashes, max ~40 chars) for the description segment.
4. Set `{branch_name}` to `{$branch_type_prefix}/{issue_number}-{slugified-title}` per the convention `type/issue-number-short-description`.
5. Determine the work-package slug `{$wp_slug}` as the basename of `{planning_folder_path}` (the planning slug `YYYY-MM-DD-{initiative-name}`), so the worktree name stays aligned with the server's planning folder. In review mode, derive `{$wp_slug}` from the PR title or branch name instead.
6. Take `{$checkout_root}` as the ancestor of `{planning_folder_path}` above `.engineering/artifacts/planning/`, and set `{target_path}` to `{$checkout_root}/.worktrees/{$wp_slug}/` — the gitignored feature-worktree directory nested in the checkout. From this point on, "inside `{target_path}`" refers to this worktree (not the checkout at `{host_repo_path}`). Never place `{target_path}` under `{planning_folder_path}` or under `{host_repo_path}`, and never anchor it to a home directory or an install root.

## Rules

### worktree-distinct-from-planning-folder

`{target_path}` is the worktree for edits; `{planning_folder_path}` is the server-owned artifact folder. Never conflate them or anchor the planning folder under `{target_path}`.
