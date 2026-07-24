---
metadata:
  version: 1.0.0
---

## Capability

Resolve the product repo root used for comprehension, GitNexus indexing, read-only investigation, and as the git directory for `git worktree add`: determine whether the path the user pointed at is a standalone repository or a submodule inside a monorepo, and set `{repo_root}` and `{component_name}` accordingly. Edits are never performed under `{repo_root}` — they use a separate worktree path.

## Inputs

### discovered_path

The path the user originally pointed at (absolute filesystem path).

## Outputs

### repo_root

The repo root: the monorepo root when the discovered path is a submodule, otherwise the discovered path itself. Used for comprehension, GitNexus, read-only investigation, and as the git directory for `git worktree add`. Under the install layout this is typically the app clone at `<install-root>/projects/<owner>/<repo>` (created by `init-repo.sh`).

### component_name

Basename of the discovered path (e.g. `midnight-node`).

## Protocol

1. Read `{discovered_path}` — the path the user originally pointed at.
2. Determine the repository shape: it is a monorepo submodule when the parent directory has a `.gitmodules` file listing the path's basename; otherwise it is a standalone repository.
3. Set `{repo_root}`: the monorepo root when `{discovered_path}` is a submodule, the discovered path itself when standalone.
4. Set `{component_name}` to the basename of `{discovered_path}` (e.g. `midnight-node`) in both cases.
