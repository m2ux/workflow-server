# Lean change

> #379 / PR #383 · simplification-apply-cycle

## Applied

| Tag | Location | Change | Lines |
|-----|----------|--------|------:|
| shrink | `tests/e2e/walker.ts` `getVar` | Removed unused local dotted-path helper; walker step gates use `evaluateWhenExpression` only | −8 |

## Skipped / ceiling

- No further ladder climb: shared module already owns bag path resolution for `when`.
- No ponytail marker: deletion leaves no ceiling to upgrade later.

## Safety floor

- Grammar / fail-closed evaluator / unit suite / e2e walker path unchanged in behaviour.
- Runnable check: `npm run typecheck` + targeted walker/when tests after trim.
