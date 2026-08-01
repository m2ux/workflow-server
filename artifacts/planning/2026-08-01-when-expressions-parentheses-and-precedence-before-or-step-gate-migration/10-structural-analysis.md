# Structural Analysis

> structural-analysis · #379 / PR #383 · 2026-08-01 · single-pass (complex path; `dispatch-prism` is trigger-empty)

## Scope

Authored surface on `chore/379-when-expressions-parentheses-precedence` @ `8c96d33f` vs `main`: shared `when` module, walker, stealth guard, corpus guard, schema describe string, unit suite, submodule pins.

## Method

- Diff-bounded file review (GitNexus index stale for new symbols).
- Producer/clearer conservation on new binding sites.
- Dual-path policy check (fail-closed mechanical vs conservative stealth).

## Findings

No structural findings at Minor or above.

| Check | Outcome |
|-------|---------|
| Single source of truth | `parseWhen` / `evaluateWhenExpression` / `assertWhenAuthoring` shared |
| Unbounded growth | None — pure functions, no new session storage |
| Dual semantics | Documented intentional: stealth parse-fail → reachable; walker invalid → skip |
| Gate parity | TC-10 structured-condition parity on nested keep-sites |

Canonical findings home: [code-review.md](09-code-review.md#structural-analysis-complex-path).
