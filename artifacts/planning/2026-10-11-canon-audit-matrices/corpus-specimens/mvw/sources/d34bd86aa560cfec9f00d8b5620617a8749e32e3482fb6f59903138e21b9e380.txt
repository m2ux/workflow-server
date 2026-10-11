---
metadata:
  version: 1.0.0
---

## Capability

Refresh the monorepo's submodules to their tracked remote HEADs, with locking and skip-if-recent semantics to coordinate concurrent invocations from sibling work packages.

## Protocol

### 1. Gate and Lock

- Run only when `{host_repo_path}` is set AND points at a monorepo (i.e. `{host_repo_path}/.gitmodules` exists). Skip silently when `{host_repo_path}` is empty or the repo root is a standalone repo with no submodules.
- Coordinate concurrent invocations from sibling work packages: serialize via an exclusive flock on `{host_repo_path}/.git/.workflow-submodule-refresh.lock` (blocking). Concrete form: `flock {host_repo_path}/.git/.workflow-submodule-refresh.lock -c <command>`. The lock prevents two parallel work packages from racing on `.git/index.lock` during the submodule update.

### 2. Refresh Under Lock

- Skip-if-recent (under the lock): check the mtime of `{host_repo_path}/.git/.workflow-submodule-refresh`. If it exists and was modified in the last 300 seconds, skip the submodule update entirely — a sibling work package or a recent prior run already refreshed the repo root submodules. Release the lock and return.
- Otherwise run `git -C {host_repo_path} submodule update --init --recursive --remote` to bring every submodule to its tracked branch's remote HEAD. Do NOT commit the resulting pointer changes in the monorepo — the goal is repo-root freshness, not history mutation.
- On success, `touch {host_repo_path}/.git/.workflow-submodule-refresh` so subsequent invocations see the freshness signal. Release the lock.
- On failure (network, missing submodule, dirty submodule worktree), surface the error and release the lock without touching the freshness sentinel. Do not silently proceed with a stale repo root. If the update failed because a submodule has a dirty worktree, resolve or stash the changes inside the affected submodule and retry; do not pass `--force`.
