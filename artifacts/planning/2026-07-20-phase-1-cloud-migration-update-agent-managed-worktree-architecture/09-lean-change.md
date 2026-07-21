# Lean Change

> Phase 1 agent-managed worktree · lean-coding-audit apply cycle · 2026-07-21

## Applied simplifications

Deleted unused `assertPlanningPathInsideRoot` alias and its tests; removed `AssertPathInsideRootOptions` / `realpath: false` branch (always realpath); deleted test-only `getPlanningRelativeDir`; collapsed duplicate `DEFAULT_PLANNING_RELATIVE_DIR` onto `PLANNING_RELATIVE_DIR`; removed sep-sanity smoke test.

`planningRoot(workspaceDir)` remains one-arg. Diff: **+13 / −78** (net **−65** lines) across 7 files.

Skipped: lexical-only realpath off-switch. Trigger: a caller needs containment without symlink resolution — see `// ponytail:` on `assertPathInsideRoot`.

## Safety floor

`npm run typecheck` clean; `vitest` worktree-validator / config / session-store / http-transport — 84 tests passed.
