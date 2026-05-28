# update-reference-submodules

Refresh the monorepo reference's submodules to their tracked remote HEADs, with locking and skip-if-recent semantics to coordinate concurrent invocations from sibling work packages.

## Inputs

### reference_path

*(optional)* Path to the reference checkout (monorepo root or standalone-repo primary checkout)

## Procedure

1. Run only when `reference_path` is set AND points at a monorepo (i.e. `{reference_path}/.gitmodules` exists). Skip silently when `reference_path` is empty or the reference is a standalone repo with no submodules.
2. Coordinate concurrent invocations from sibling work packages: serialize via an exclusive flock on `{reference_path}/.git/.workflow-submodule-refresh.lock` (blocking). Concrete form: `flock {reference_path}/.git/.workflow-submodule-refresh.lock -c <command>`. The lock prevents two parallel start-work-package activities from racing on `.git/index.lock` during the submodule update.
3. Skip-if-recent (under the lock): check the mtime of `{reference_path}/.git/.workflow-submodule-refresh`. If it exists and was modified in the last 300 seconds, skip the submodule update entirely — a sibling work package or a recent prior run already refreshed the reference. Release the lock and return.
4. Otherwise run `git -C {reference_path} submodule update --init --recursive --remote` to bring every submodule to its tracked branch's remote HEAD. Do NOT commit the resulting pointer changes in the monorepo — the goal is reference-side freshness, not history mutation.
5. On success, `touch {reference_path}/.git/.workflow-submodule-refresh` so subsequent invocations see the freshness signal. Release the lock.
6. On failure (network, missing submodule, dirty submodule worktree), surface the error and release the lock without touching the freshness sentinel. Do not silently proceed with a stale reference.

## Errors

### reference_dirty_submodule

**Cause:** Submodule update failed because a submodule has a dirty worktree

**Recovery:** Resolve or stash changes inside the affected submodule, then retry. Do not pass `--force`.
