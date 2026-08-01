# Code Review Report

> code-review · #379 / PR #383 · 2026-08-01 · 11 files reviewed · methodology: [Rust/Substrate Code Review](https://github.com/m2ux/workflow-server/blob/workflows/work-package/resources/rust-substrate-code-review.md) (applied to TypeScript Node)

HEAD under review: `8c96d33f51fe35759a5fceca4513dcb634403775`

## Summary

**Overall Quality:** 5/5 — Critical: 0 · High: 0 · Medium: 0 · Low: 0

## Module Overview

Reference `when` expression dialect (`src/schema/when-expression.ts`): tokenize, recursive-descent parse with C-style precedence, evaluate against the bag, and authoring check for mixed `&&`/`||`. Wired into e2e walker (fail-closed), stealth isolation guard (parse-fail stays reachable/conservative), corpus `check:when`, schema grammar card, unit suite (PR383-TC-01…11), and four OR keep-site migrations on the workflows pin.

## Manual Diff Review

> chore/379-when-expressions-parentheses-precedence vs main · 11 files reviewed · reviewer: user · No Issues

## Findings

No code-review findings at Critical, High, Medium, or Low severity on the authored surface.

### Informational notes (do not route)

| Note | Location | Observation |
|------|----------|-------------|
| I-1 | `scripts/check-stealth-isolation.ts` `evalWhen` | Unparseable `when` returns `undefined` (treat as reachable). Walker/mechanical nets fail closed (`false` → skip). Intentional split: isolation guard stays conservative; authoring strictness lives in `check:when` and walker. Documented in Block 4 rationale. |
| I-2 | GitNexus index | `detect_changes` / `impact(evaluateWhenExpression)` did not resolve new symbols on this branch (index stale relative to feature HEAD). Review bounded from three-dot diff + direct file read. |

## Structural Analysis (complex path)

`dispatch-prism` is an empty action step for `problem_complexity == complex`; no separate full Prism pipeline was run. Single-pass producer/clearer and dual-path read:

| Concern | Result |
|---------|--------|
| Dual evaluators | Collapsed: walker and stealth call shared `parseWhen` / `evaluateWhenExpression`; corpus authoring via `assertWhenAuthoring`. |
| Fail-closed vs conservative | Walker: invalid → false (skip). Stealth: invalid → undefined (reachable). No unbounded state; process-local pure functions. |
| Producer/clearer | No new persistent session/storage producers. Pure AST eval; no reclaim imbalance. |
| Conservation of gate semantics | Unit parity suite (TC-10) matches structured `evaluateCondition` on three nested keep-site shapes; fourth site covered by flat OR / TC-01 and corpus pin. |

No structural findings at Minor or above.

## Strengths

- Single reference module; thin walker wrapper after dead `getVar` trim.
- Authoring rule enforced in unit tests and corpus guard.
- Fail-closed mechanical nets match schema description.
- Nested keep-site truth tables + structured-condition parity.

## Recommendations Summary

1. **Immediate:** None.
2. **Near-term:** None required for merge.
3. **Long-term:** Re-index GitNexus after merge so impact tools see `when-expression` symbols.

## Compliance

All 5 compliance categories met (Rust Idioms N/A → TypeScript equivalents; Substrate N/A; Architecture; Documentation; Testing).

## Lean-Coding Audit

Scope: feature branch `chore/379-when-expressions-parentheses-precedence` vs `main` (module, tests, walker, guard, corpus pin).

### Initial pass

| Tag | Location | Simpler alternative | Lines |
|-----|----------|---------------------|------|
| shrink | `tests/e2e/walker.ts` `getVar` | Remove unused local helper after walker delegates to shared module (dead code) | ~8 |
| yagni | `src/schema/when-expression.ts` exported `WhenAst` / `parseWhen` surface | Keep — unit tests and stealth/guard consumers need parse + authoring API | 0 |
| delete | Module header comment block (~18 lines) | Keep short grammar card — proportional to a new dialect; not restating code | 0 |

**net: -8 lines** (optional dead-code trim only).

### Re-score after apply-simplifications

| Tag | Location | Simpler alternative | Lines |
|-----|----------|---------------------|------|
| — | — | No remaining over-engineering findings | 0 |

**net: 0 lines** — `Lean already. Ship.`

Applied: unused walker `getVar` removed (−8). Core parser remains a single RD module; dual incomplete walkers collapsed. No YAGNI frameworks, no extra abstraction layers.

Safety floor held: grammar requested by issue, fail-closed invalid input, runnable unit suite + e2e snapshots + `check:when`.
