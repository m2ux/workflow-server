---
metadata:
  version: 2.1.0
---

## Capability

Component identity for this work package, assembled from the derived host repository.

## Inputs

### host_repo_path

Absolute path of the host repository.

### component_hint

*(optional)* Basename of the component the workspace path already sits inside. Unset when the path is at the host root.

## Outputs

### component_name

Basename of the component being worked on — the basename of `{host_repo_path}` when the path is at the host root.

### component_path

Path of the component being worked on, relative to `{host_repo_path}` — `.` when the path is at the host root.

### component_git_dir

Absolute path of the component's git working tree — the checkout whose `origin` remote names the component's repository, and the one its branches and worktrees are created from. Equal to `{host_repo_path}` when the component is the host itself.

## Protocol

1. When `{component_hint}` is unset, set `{component_path}` to `.` and `{component_name}` to the basename of `{host_repo_path}` — the path is at the host root. Done.
2. Read `{host_repo_path}/.gitmodules` and take the submodule `path` whose basename equals `{component_hint}`. Set `{component_path}` to that path and `{component_name}` to `{component_hint}`.
3. Join `{host_repo_path}` with `{component_path}` and emit the result as `{component_git_dir}`.
