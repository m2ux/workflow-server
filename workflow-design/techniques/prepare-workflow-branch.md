---
metadata:
  version: 2.0.2
---

## Capability

Ensure a dedicated workflows edit worktree exists at `{target_path}` on feature branch `{workflow_branch}` — composing [work-package create-worktree](../../work-package/techniques/manage-git/create-worktree.md) with design defaults (`component_name=workflows`).

## Inputs

### target_path

Absolute filesystem path of the dedicated workflows edit-root worktree for this session — where create/update edits land. Distinct from `{planning_folder_path}`.

### workflow_id

Workflow id used to name the feature branch (`workflow/{workflow_id}`, with an intent suffix when an update needs a distinct branch).

### operation_type

Create or update (review mode skips this ensure). Used only to decide whether an update intent suffix is needed when `workflow/{workflow_id}` already exists.

### reference_path

*(optional)* Monorepo or checkout that contains the shared `workflows` library component. Used when composing create-worktree to locate the component git directory.

## Outputs

### workflow_branch

Feature branch checked out in the worktree (e.g. `workflow/{workflow_id}`, or that name plus a short intent suffix).

### worktree_created

True when the worktree at `{target_path}` on `{workflow_branch}` was created or reused.

## Protocol

### 1. Derive Branch Name

- Set `{$branch_name}` to `workflow/{workflow_id}`
- When `{operation_type}` is `update` and that branch already exists for a prior change, suffix a short change-intent slug so the session has a distinct branch

### 2. Ensure Worktree

- Compose [create-worktree](../../work-package/techniques/manage-git/create-worktree.md) with:
  - `{target_path}` as declared
  - `branch_name` = `{$branch_name}`
  - `create_branch` = true
  - `component_name` = `workflows`
  - `{reference_path}` when supplied (otherwise create-worktree resolves the component from ambient context)
  >
  > Compose only the declared create-worktree inputs — no parallel git recipe and no undeclared compose params. create-worktree bases the new branch on that component's `origin/HEAD` default; the workflows library's HEAD must resolve to `workflows` (intervene before compose when it does not).
- Reuse when `{target_path}` is already a registered worktree on that branch; surface path conflicts to the user (do not delete)

### 3. Capture Outputs

- Set `{workflow_branch}` = `{$branch_name}` and `{worktree_created}` from create-worktree
- Include `{workflow_branch}` and `{worktree_created}` in the activity's `activity_complete.variables_changed` so session state carries branch and worktree facts for terminal activities

## Rules

### edit-root-is-target-path

All subsequent create/update edits, commits, and PRs use `{target_path}`. Catalog and literacy reads may use the shared library checkout; planning artifacts stay under `{planning_folder_path}`.

### ambient-bag-variables-changed

Declared `{workflow_branch}` and `{worktree_created}` appear in the activity's `variables_changed`. Terminal consumers read session state; branch and worktree facts are not left only in the dispatch brief.
