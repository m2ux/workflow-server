---
metadata:
  version: 2.0.0
---

## Capability

The product repo root and component identity for this work package, assembled from the derived host repository. Edits are never performed under `{repo_root}` — they use a separate worktree path.

## Inputs

### host_repo_path

Absolute path of the host repository, as produced by [resolve-host-repo](../../meta/techniques/version-control/resolve-host-repo.md).

### component_hint

*(optional)* Basename of the component the session was opened inside. Unset when the session sits at the host root.

## Outputs

### repo_root

Absolute path of the repo root used for comprehension, GitNexus indexing, read-only investigation, and as the git directory for `git worktree add`.

### component_name

Basename of the component being worked on — the basename of `{repo_root}` when the session sits at the host root.

### component_path

Path of the component being worked on, relative to `{repo_root}` — `.` when the session sits at the host root.

## Protocol

1. Set `{repo_root}` to `{host_repo_path}` — the host derivation has already ascended to the outermost superproject, so no further ascent is performed here.
2. When `{component_hint}` is unset, set `{component_path}` to `.` and `{component_name}` to the basename of `{repo_root}` — the session sits at the host root. Done.
3. Read `{repo_root}/.gitmodules` and take the submodule `path` whose basename equals `{component_hint}`. Set `{component_path}` to that path and `{component_name}` to `{component_hint}`.
