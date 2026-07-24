---
metadata:
  version: 1.0.0
---

## Capability

Refresh the monorepo's submodules to their tracked remote HEADs, with locking and skip-if-recent semantics to coordinate concurrent invocations from sibling work packages.

## Inputs

### repo_root

Path to the repo root (monorepo whose submodules are refreshed); the gate, lock, freshness sentinel, and `git submodule update` all operate inside it. The op is a no-op when this is empty or the repo root is a standalone repo with no `.gitmodules`.

## Outputs

### refreshed_submodules

The monorepo's submodules advanced to their tracked branches' remote HEADs (or a silent skip when gated out / skip-if-recent), with the `.workflow-submodule-refresh` freshness sentinel touched on success. Pointer changes are NOT committed. A side-effect op; repo-root freshness is its product.

## Protocol

### 1. Gate and Lock

- Run only when `{repo_root}` is set AND points at a monorepo (i.e. `{repo_root}/.gitmodules` exists). Skip silently when `{repo_root}` is empty or the repo root is a standalone repo with no submodules.
- Coordinate concurrent invocations from sibling work packages: serialize via an exclusive flock on `{repo_root}/.git/.workflow-submodule-refresh.lock` (blocking). Concrete form: `flock {repo_root}/.git/.workflow-submodule-refresh.lock -c <command>`. The lock prevents two parallel start-work-package runs from racing on `.git/index.lock` during the submodule update.

### 2. Refresh Under Lock

- Skip-if-recent (under the lock): check the mtime of `{repo_root}/.git/.workflow-submodule-refresh`. If it exists and was modified in the last 300 seconds, skip the submodule update entirely — a sibling work package or a recent prior run already refreshed the repo root submodules. Release the lock and return.
- Otherwise run `git -C {repo_root} submodule update --init --recursive --remote` to bring every submodule to its tracked branch's remote HEAD. Do NOT commit the resulting pointer changes in the monorepo — the goal is repo-root freshness, not history mutation.
- On success, `touch {repo_root}/.git/.workflow-submodule-refresh` so subsequent invocations see the freshness signal. Release the lock.
- On failure (network, missing submodule, dirty submodule worktree), surface the error and release the lock without touching the freshness sentinel. Do not silently proceed with a stale repo root. If the update failed because a submodule has a dirty worktree, resolve or stash the changes inside the affected submodule and retry; do not pass `--force`.
