# Code Review

> #379 / PR #383 · lean-coding audit section

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
