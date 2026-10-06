---
metadata:
  version: 1.6.0
---

## Capability

The engineering files a completed activity commits, the checkout and branch that commit is pushed from, and whether `.engineering` is a linked worktree of the host.

## Inputs

### workflow_id

The workflow the activity belongs to.

## Outputs

### paths

Every change under `.engineering/artifacts/` within `{planning_folder_path}`.

### has_engineering_changes

True when `{paths}` names at least one file.

### commit_message

`docs({workflow_id}): {activity_id} artifacts`

### engineering_repo_path

The checkout the engineering push runs in.

### branch

The branch checked out at `{engineering_repo_path}`.

### engineering_kind

`worktree`, or unset.

## Protocol

### 1. Read Path Mode

- `git -C {host_repo_path} ls-tree HEAD .engineering`.
  > - When the path is in the tree, `{engineering_kind}` stays unset.
  > - When the path is absent from the tree, the later phases decide `{engineering_kind}`.

### 2. Read Worktree Commondir

- `git -C {host_repo_path}/.engineering rev-parse --git-common-dir`, resolved to an absolute path.
  > When `.engineering` is absent from the tree.

### 3. Read Parent Commondir

- `git -C {host_repo_path} rev-parse --git-common-dir`, resolved to an absolute path.
  > When `.engineering` is absent from the tree.

### 4. Read Worktree Toplevel

- `git -C {host_repo_path}/.engineering rev-parse --show-toplevel`.
  > When `.engineering` is absent from the tree.
  > - `{engineering_kind}` is `worktree` when that toplevel is `{host_repo_path}/.engineering` and the two common directories name one directory.
  > - Otherwise `{engineering_kind}` stays unset.

### 5. Name Checkout

- `{engineering_repo_path}` is `{host_repo_path}/.engineering`, or `{host_repo_path}`.
  > - When `{engineering_kind}` is `worktree`, it is `{host_repo_path}/.engineering`.
  > - Otherwise it is `{host_repo_path}`.

### 6. Read Branch

- `git -C {engineering_repo_path} branch --show-current` is `{branch}`.

### 7. Set Header

- Set the header-line `**Status:**` in `{planning_folder_path}/README.md` to the current lifecycle milestone for that workflow. The line is text, distinct from Progress Status, per [Progress table](/meta/resources/planning-readme.md#progress-table).
  > Where the README already carries both marks, leave its content equivalent.

### 8. Collect Files

- Set `{paths}` to every change under `.engineering/artifacts/` within `{planning_folder_path}`. `{has_engineering_changes}` is true when `{paths}` names at least one file. Set `{commit_message}` to `docs({workflow_id}): {activity_id} artifacts`.
