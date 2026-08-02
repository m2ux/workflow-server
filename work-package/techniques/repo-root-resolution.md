---
metadata:
  version: 2.0.1
---

## Capability

Component identity for this work package, assembled from the derived host repository. Edits are never performed under `{host_repo_path}` — they use a separate worktree path.

## Inputs

### host_repo_path

Absolute path of the host repository, as produced by [resolve-host-repo](../../meta/techniques/version-control/resolve-host-repo.md).

### component_hint

*(optional)* Basename of the component the workspace path already sits inside. Unset when the path is at the host root.

## Outputs

### component_name

Basename of the component being worked on — the basename of `{host_repo_path}` when the path is at the host root.

### component_path

Path of the component being worked on, relative to `{host_repo_path}` — `.` when the path is at the host root.

## Protocol

1. When `{component_hint}` is unset, set `{component_path}` to `.` and `{component_name}` to the basename of `{host_repo_path}` — the path is at the host root. Done.
2. Read `{host_repo_path}/.gitmodules` and take the submodule `path` whose basename equals `{component_hint}`. Set `{component_path}` to that path and `{component_name}` to `{component_hint}`.
