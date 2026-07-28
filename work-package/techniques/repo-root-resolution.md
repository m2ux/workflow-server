---
metadata:
  version: 1.1.0
---

## Capability

Resolve the product repo root used for comprehension, GitNexus indexing, read-only investigation, and as the git directory for `git worktree add`: determine whether the bound path is a standalone repository or a component inside a monorepo, and set `{repo_root}` and `{component_name}` accordingly. Edits are never performed under `{repo_root}` — they use a separate worktree path.

## Inputs

### discovered_path

Absolute filesystem path the session is bound to. Bound explicitly by `01-start-work-package`'s `resolve-repo-root` step from the meta session's `component_path`, absolutized against `host_repo_path` — not a path the user typed. Always absolute: a bare `.` inherited from `component_path`'s default is not a usable value here.

## Outputs

### repo_root

The repo root: the outermost monorepo root when the discovered path is a component, otherwise the discovered path itself. Used for comprehension, GitNexus, read-only investigation, and as the git directory for `git worktree add`. Under the install layout this is typically the app clone at `<install-root>/projects/<owner>/<repo>` (created by `init-repo.sh`).

### component_name

Basename of the discovered path (e.g. `midnight-node`).

## Protocol

1. Read `{discovered_path}` — the absolute path the session is bound to.
2. Determine the repository shape by ascending, not by a single test: the path is a monorepo component when its parent directory is itself a git repository whose `.gitmodules` declares the path's basename as a submodule `path`. Repeat the test from that parent and keep ascending while it holds, so a component nested more than one level deep resolves to the outermost superproject rather than to its immediate parent. When the first test fails, the path is a standalone repository. This is the same ascent `meta`'s `version-control::resolve-host-repo` performs at session bootstrap, where it is stated canonically; a single-level test agrees with it only for components exactly one level deep.
3. Set `{repo_root}`: the outermost superproject reached by the ascent when `{discovered_path}` is a component, the discovered path itself when standalone.
4. Set `{component_name}` to the basename of `{discovered_path}` (e.g. `midnight-node`) in both cases.
