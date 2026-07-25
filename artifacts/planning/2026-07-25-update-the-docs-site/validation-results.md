# Validation Results — Update the Docs Site

> validate activity · session JBFTWX · 2026-07-25 · PR #293 · worktree `.worktrees/2026-07-25-update-the-docs-site`

## Decision

- Checkpoint `local-validation-permission` → `run-locally`
- `run_local_validation=true`, `mark_progress_na=false`
- Project suite: docs/site package plan ([test-plan.md](test-plan.md) Running Tests) — not rust-substrate `cargo-operations::run-suite`

## Command results

| Command | Result |
|---------|--------|
| `npm run build:site` | PASS (exit 0; regenerated regions; working tree clean afterward) |
| `npm run check:site` | PASS — All site links and anchors resolve |
| `npm run check:svg` | PASS — No SVG text collisions |
| `npm run typecheck` | PASS (exit 0) |
| `npx vitest run tests/site.test.ts tests/docs-drift.test.ts` | PASS — 2 files, 8 tests |
| `npm test -- --run` (full Vitest) | FAIL — 16 files / 183 tests failed |

## Aggregate

- **Package validation suite (test-plan):** `validation_passed=true`
- **Full repo `npm test`:** failed because worktree `workflows/` is an empty directory (not the workflows orphan worktree). Failures are dominated by `Workflow not found: work-package|meta` in loaders/E2E — environment layout, not docs-package regressions. Out of scope for this docs package gate; not treated as package validation failure.

## Notes

- Root README wholesale rewrite remains out of scope.
- Manual golden-path reader checklist in [golden-path-walk.md](golden-path-walk.md) is still open for human spot-check; automated checks above are green.
