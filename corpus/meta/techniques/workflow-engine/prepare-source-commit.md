---
metadata:
  version: 1.2.0
---

## Capability

The source-side files a completed activity commits, the checkout and branch that commit is pushed from, and whether the component under work is a submodule of the host.

## Inputs

### workflow_id

The workflow the activity belongs to.

## Outputs

### source_kind

`submodule`, or unset.

### source_repo_path

The checkout the source commit and its push run in.

### source_branch

The branch checked out at `{source_repo_path}`, which the source push sends.

### source_paths

Every uncommitted tracked path under the component.

### has_source_changes

True when `{source_paths}` names at least one file.

### source_commit_message

`<type>({workflow_id}): {activity_id} source changes`, under the Conventional Commits type the activity fits.

## Protocol

### 1. Read Component Mode

- `git -C {host_repo_path}/{component_path} rev-parse --show-superproject-working-tree`.
  > - When it prints a path, the component is a submodule of that superproject and `{source_kind}` is `submodule`.
  > - When it prints nothing, the component is part of the host checkout and `{source_kind}` stays unset. A `{component_path}` of `.` reaches this reading.

### 2. Name Checkout

- `{source_repo_path}` is `{host_repo_path}/{component_path}`, or `{host_repo_path}`.
  > - When `{source_kind}` is `submodule`, it is `{host_repo_path}/{component_path}`.
  > - Otherwise it is `{host_repo_path}`.

### 3. Read Branch

- `git -C {source_repo_path} branch --show-current` is `{source_branch}`.

### 4. Collect Files

- Set `{source_paths}` to every uncommitted tracked path `git -C {host_repo_path}/{component_path} status --porcelain` reports, each without its status prefix. `{has_source_changes}` is true when `{source_paths}` names at least one file.
  > A path under `.engineering` is left out. A `{component_path}` of `.` is the case where this listing reaches one.

### 5. Compose Message

- Set `{source_commit_message}` to `<type>({workflow_id}): {activity_id} source changes`, under the Conventional Commits type the activity fits.
