---
metadata:
  version: 1.0.0
---

## Capability

Refresh the monorepo reference's submodules to their tracked remote HEADs, with locking and skip-if-recent semantics to coordinate concurrent invocations from sibling work packages.

## Inputs

### reference_path

Path to the reference checkout (the engineering / parent monorepo whose submodules are refreshed); the gate, lock, freshness sentinel, and `git submodule update` all operate inside it. The op is a no-op when this is empty or the reference is a standalone repo with no `.gitmodules`.

## Outputs

### refreshed_submodules

The reference's submodules advanced to their tracked branches' remote HEADs (or a silent skip when gated out / skip-if-recent), with the `.workflow-submodule-refresh` freshness sentinel touched on success. Pointer changes are NOT committed. A side-effect op; reference-side freshness is its product.

## Protocol

### 1. Gate and Lock

- Run only when `{reference_path}` is set AND points at a monorepo (i.e. `{reference_path}/.gitmodules` exists). Skip silently when `{reference_path}` is empty or the reference is a standalone repo with no submodules.
- Coordinate concurrent invocations from sibling work packages: serialize via an exclusive flock on `{reference_path}/.git/.workflow-submodule-refresh.lock` (blocking). Concrete form: `flock {reference_path}/.git/.workflow-submodule-refresh.lock -c <command>`. The lock prevents two parallel start-work-package runs from racing on `.git/index.lock` during the submodule update.

### 2. Refresh Under Lock

- Skip-if-recent (under the lock): check the mtime of `{reference_path}/.git/.workflow-submodule-refresh`. If it exists and was modified in the last 300 seconds, skip the submodule update entirely — a sibling work package or a recent prior run already refreshed the reference. Release the lock and return.
- Otherwise run `git -C {reference_path} submodule update --init --recursive --remote` to bring every submodule to its tracked branch's remote HEAD. Do NOT commit the resulting pointer changes in the monorepo — the goal is reference-side freshness, not history mutation.
- On success, `touch {reference_path}/.git/.workflow-submodule-refresh` so subsequent invocations see the freshness signal. Release the lock.
- On failure (network, missing submodule, dirty submodule worktree), surface the error and release the lock without touching the freshness sentinel. Do not silently proceed with a stale reference. If the update failed because a submodule has a dirty worktree, resolve or stash the changes inside the affected submodule and retry; do not pass `--force`.
