# Debt Ledger

> Phase 1 agent-managed worktree architecture · harvested 2026-07-21

## src/worktree-validator.ts

`src/worktree-validator.ts:47`, always realpath (no lexical-only off-switch). ceiling: no `AssertPathInsideRootOptions` / `realpath: false`. upgrade: a caller needs containment without symlink resolution.

1 markers, 0 with no trigger.
