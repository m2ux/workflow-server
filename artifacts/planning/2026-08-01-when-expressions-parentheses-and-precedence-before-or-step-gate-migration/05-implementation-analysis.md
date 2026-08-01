# Implementation Analysis - when expressions: parentheses, precedence, OR readiness

> #379 / PR #383 · 2026-08-01 · Complete

## Implementation Review

### Existing Location

| Component | Path | Description |
|-----------|------|-------------|
| Step gate schema | `src/schema/activity.schema.ts` (`stepCommonFields.when`) | Optional string `when`; describe text: agent-evaluated; server never evaluates gates |
| Structured condition AST | `src/schema/condition.schema.ts` | `Condition` union + recursive `evaluateCondition` (and/or/not/simple; exists/numeric ops) |
| e2e mechanical walker | `tests/e2e/walker.ts` (`evaluateWhen` ~306–326) | Only automated step-skip consumer for inline `when` during corpus walks |
| Stealth isolation guard | `scripts/check-stealth-isolation.ts` (`evalWhen` ~116–129) | Second incomplete `when` consumer (`&&`-only; unparseable → `undefined` = reachable) |
| Review-mode gating guard | `scripts/check-review-mode-gating.ts` (`whenExcludesReview`) | Regex subset for `is_review_mode` in `when` strings; structured path uses `evaluateCondition` |
| Variable-model guard | `scripts/check-variable-model.ts` | Walks structured conditions only; documents that `when:` has no exists-shaped predicate |
| Validation unit tests | `tests/validation.test.ts` | Covers `evaluateCondition`; no shared `when` parser tests |
| OR keep-sites (structured) | `workflows/work-package/activities/14-complete.yaml` (`create-adr`, `update-adr-status`); `workflows/workflow-design/activities/01-intake-and-context.yaml` (`persist-structural-inventory`); `workflows/prism/activities/01-structural-pass.yaml` (`run-structural`) | Four step gates that still need OR trees |
| Comprehension | `.engineering/artifacts/comprehension/when-step-gates.md` | Dual-dialect map, fail-open walker, keep-site inventory |
| Research | [04-kb-research.md](04-kb-research.md) | Patterns, risks, SC map |

Worktree: `.worktrees/2026-08-01-when-expressions-parentheses-and-precedence-before-or-step-gate-migration` · branch `chore/379-when-expressions-parentheses-precedence`.

### Usage Patterns

**How it is used today:**

- **Production:** Workers read `when` / `condition` from activity YAML (via `get_activity`) and skip or run steps themselves. MCP tools do not call `evaluateWhen` or `evaluateCondition` to gate execution.
- **e2e:** `executeActivitySteps` / path enumeration call `evaluateWhen` then `evaluateCondition`; false → `continue` (skip step).
- **Guards:** Stealth and review-mode scripts partially interpret `when` with ad-hoc parsers; variable-model ignores `when` for exists checks.
- **Corpus:** Live `when` sites are plain comparisons and flat `&&` compounds (post-#374). No live `||` or parentheses in `when` strings. Nested OR remains on structured `condition:`.

**Call frequency:** Once per step during e2e walks and guard scans; once per worker judgment at each gated step in live runs.

### Dependencies

**Depends On:**

- Variable bag dotted-path resolution (`getVar` in walker; `getVariableValue` in condition.schema)
- Zod load path accepts any string for `when` (no grammar refine today)
- Agent protocol / activity-worker guidance for production judgment

**Depended On By:**

- e2e walker step walk + path enumeration (`walk` → `evaluateWhen` — GitNexus impact **LOW**, 1 direct caller module)
- `check-stealth-isolation`, `check-review-mode-gating` (partial parsers)
- Future OR corpus migration (four YAML sites) — blocked until evaluator truth tables land
- Docs that advertise full boolean algebra over `when`

### Architecture

**Existing patterns:** Dual dialect (inline string vs structured AST). Full boolean tree exists only on the structured path. Inline path is intentionally thin and incomplete. Production authority is agent-side; mechanical fidelity is test/guard-side.

**Known technical debt:**

- Dual incomplete `when` evaluators (walker fail-open vs stealth fail-undefined/reachable)
- Schema describe examples omit `||`, `!`, parentheses
- Guards that regex-parse `when` will drift when grammar grows unless they import the shared module
- Fail-open walker greenwashes unparseable expressions (`return true`)

### Packaging recommendation (resolves RS-5 / RC-1 / RC-3)

| Decision | Recommendation | Rationale |
|----------|----------------|-----------|
| Module path | **`src/schema/when-expression.ts`** next to `condition.schema.ts` | Same layer as structured oracle; walker already imports `../../src/schema/condition.schema.js`; keeps parse/eval as library (not MCP tool) |
| Public API | `parseWhen(expr) → AST \| error`; `evaluateWhenExpression(ast \| expr, bag) → boolean` with **fail-closed** parse errors; optional `assertAuthoringRules(expr)` for mixed-ops parentheses | Unit-testable; walker thin wrapper |
| Parser style | Layered recursive descent (or Pratt) with C-style tiers | Small grammar; either fine — prefer RD for readability next to `evaluateCondition` |
| Walker wire-up | Replace body of local `evaluateWhen` with import; keep function name at call sites | Impact LOW |
| Stealth | Same-PR import if cheap; else sequential follow-on | Prefer same PR when module is pure TS with no new deps |
| Lint home | **New focused guard** `scripts/check-when-expression.ts` (or extend definition-lint) registered in `scripts/guards.ts` | `check-variable-model` intentionally skips `when`; review-mode regex is not a full grammar home |
| Docs | Schema `.describe` grammar summary + short agent rule in workflow-engine / activity-worker technique prose | SC-2, SC-8 |
| Delivery PR split | **Preferred single PR:** module + unit fixtures + walker + agent rule + four YAML migrations + register. **Acceptable split:** (1) module+fixtures+walker+rule, (2) four-site corpus immediately after | DP-6 / SC-9; sequential OK if evaluator lands first |

## Effectiveness Evaluation

### What's Working Well

| Capability | Evidence | Confidence |
|------------|----------|------------|
| Structured OR/AND/NOT trees | `evaluateCondition` recursive; used by walker transitions, review-mode guard, validation tests | HIGH |
| Flat `&&` `when` corpus | Live YAML uses `&&`-only compounds; walker splits on `&&` correctly for those shapes | HIGH |
| Dotted bag paths | Walker `getVar` and condition `getVariableValue` both walk `.` segments | HIGH |
| Agent-evaluated production model | `activity.schema.ts:74` describe; comprehension dual-dialect map | HIGH |
| Keep-site inventory | Four structured OR step gates located and shapes documented (research + YAML) | HIGH |
| Blast radius for walker swap | GitNexus `evaluateWhen` upstream impact **LOW** (direct: `walk`) | HIGH |

### What's Not Working

| Issue | Evidence | Impact |
|-------|----------|--------|
| No `\|\|` / parens / `!` in mechanical `when` | `evaluateWhen` only splits `&&`; no paren tokenizer | HIGH — blocks SC-2–SC-5, SC-9 |
| Fail-open invalid `when` | `evaluateWhen` unparseable → `return true` (execute) | HIGH — SC-6 opposite of requirement |
| Dual incomplete parsers | walker vs stealth `evalWhen` | MEDIUM — drift risk |
| Docs/schema over-promise | Boolean algebra advertised; walker cannot enforce nested shapes | MEDIUM — author hazard |
| Four OR sites stranded on `condition:` | Live YAML still structured `type: or` | HIGH — package goal |
| Partial guard parsers | `whenExcludesReview` regex only; variable-model skips `when` | MEDIUM — lint gap SC-4/SC-10 |

### Workarounds in Place

- OR-shaped step gates remain on structured `condition:` after #374 (intentional keep)
- Agents are expected to judge complex gates without a shared mechanical grammar card beyond schema examples
- Stealth treats unevaluable `when` as reachable (conservative for exclusion proofs, not for execute/skip truth)

## Baseline Metrics

| Metric | Current Value | Measurement Method | Date Measured |
|--------|--------------|-------------------|---------------|
| Live `when` with `\|\|` | **0** | Corpus grep on worktree `workflows/**/*.yaml` for `\|\|` inside `when:` lines | 2026-08-01 |
| Live `when` with parentheses | **0** (no paren-grouped boolean `when`) | Corpus review / research inventory | 2026-08-01 |
| Live flat-`&&` `when` compounds | **Multiple** (e.g. workflow-authoring validate/commit, work-package start/validate) | `rg '&&' workflows/**/*.yaml` on `when:` lines | 2026-08-01 |
| OR step-gate keep-sites (structured) | **4** | Migration register + YAML: 14-complete×2, workflow-design persist-structural-inventory, prism run-structural | 2026-08-01 |
| Mechanical `when` operators supported | `==`, `!=`, bare truthiness, `&&` only | Read `tests/e2e/walker.ts:306-326` | 2026-08-01 |
| Invalid `when` walker behavior | **Execute** (fail-open) | `return true` when regex/bare match fails | 2026-08-01 |
| Shared `when` module | **Absent** | No `when-expression` under `src/`; walker local function only | 2026-08-01 |
| Unit tests for `when` grammar | **0 dedicated** | No when-expression test file; validation tests cover structured only | 2026-08-01 |
| GitNexus risk changing `evaluateWhen` | **LOW** | `impact({target: evaluateWhen})` — 1 direct caller (`walk`) | 2026-08-01 |

### Key Findings

- Unlock path is **library + test net + corpus**, not an MCP runtime authority move.
- Nested production shapes make parentheses **load-bearing** under C-style precedence (`14-complete` AND-of-OR; prism OR-of-AND).
- Fail-closed is a deliberate behavior change for currently unparseable strings that execute today.
- Existing flat-`&&` sites must keep identical truth tables after the module lands (regression suite).

## Gap Analysis

| ID | Gap | Current State | Desired State | Impact | Priority | SC |
|----|-----|---------------|---------------|--------|----------|-----|
| G1 | Reference `when` parse/eval module | Local `&&`-only helpers | `src/schema/when-expression.ts` with C-style grammar | Blocks all OR migration | HIGH | SC-2, SC-3, SC-5 |
| G2 | Fail-closed invalid expressions | Walker executes junk | Invalid → skip (false); tests prove it | Greenwash hazard | HIGH | SC-6 |
| G3 | Truth-table fixtures | None for OR/parens/mixed | Flat OR; bare mixed reject; parenthesized variants; 14-complete + prism bags; invalid closed | Migration safety | HIGH | SC-5, SC-7 |
| G4 | Walker shares module | Forked local function | Import shared evaluator | Dual truth | HIGH | SC-5 |
| G5 | Authoring lint for mixed ops | No guard | Reject bare `a && b \|\| c`; allow parenthesized forms | Author clarity | HIGH | SC-4, SC-10 |
| G6 | Four OR YAML migrations | Structured `condition:` | Parenthesized `when` with parity vs `evaluateCondition` | Package outcome | HIGH | SC-9, SC-11 |
| G7 | Agent-facing grammar rule | Schema examples only | Short rule: honor parens; match reference precedence | Production path | MEDIUM | SC-1, SC-8 |
| G8 | Schema/docs grammar section | Incomplete describe | Document operators + precedence once | Single source of truth | MEDIUM | SC-2, SC-3 |
| G9 | Stealth/other clone parsers | Independent `evalWhen` | Import shared module (same or follow-on PR) | Drift | MEDIUM | SC-5 |
| G10 | Review-mode `when` regex | Subset parser | Prefer shared parse or keep regex only if proven equivalent for `is_review_mode` clauses | Guard fidelity | LOW | — |

## Opportunities for Improvement

### Quick Wins (Low Effort, High Impact)

1. **Extract shared module + walker swap:** Pure TS, LOW blast radius — Expected impact: SC-2–SC-6 foundation; Effort: small–medium
2. **Fail-closed + garbage fixtures:** One-line semantic change with tests — Expected impact: SC-6; Effort: small
3. **Four keep-site parity fixtures before YAML edit:** Encode structured trees as bags — Expected impact: SC-7/SC-11; Effort: small

### Structural Improvements (Higher Effort)

1. **Four-site corpus migration + register + `check:all`:** After fixtures green — Expected impact: SC-9; Effort: medium
2. **Dedicated when-expression guard in guard suite:** Mixed-ops parentheses + optional `\|\|` inventory — Expected impact: SC-4/SC-10; Effort: medium
3. **Agent technique prose + schema describe:** Grammar card — Expected impact: SC-8; Effort: small

### Optimization Opportunities

1. **Retire stealth local `evalWhen`** once module exists — Expected impact: one truth; Effort: small follow-on
2. **Do not expand v1 comparisons** beyond `==`/`!=` (+ bare truthiness) — keep sites do not need `>`/`exists` in `when`

## Success Criteria

Success criteria: [requirements](03-requirements-elicitation.md#success-criteria). This document contributes baselines and gaps; analysis-derived targets:

| Target | Baseline → Goal | Gap | Validation |
|--------|-----------------|-----|------------|
| Shared module exists and is imported by walker | 0 modules → 1 (`when-expression.ts`) | G1, G4 | Import graph + unit tests |
| Invalid `when` does not execute in walker | fail-open → fail-closed | G2 | Unit + walker fixture |
| Four keep-site shapes pass parity | structured-only → when ≡ condition on fixture bags | G3, G6 | Side-by-side tests SC-11 |
| Zero bare mixed `&&`/`\|\|` in live `when` | N/A (no `\|\|` yet) → guard hard-zero after migration | G5 | New guard / corpus grep |
| Live OR keep-sites on `when` | 4 structured → 0 structured OR step gates in inventory | G6 | YAML diff + register |

### Measurement Strategy

- Unit truth tables in `tests/` importing the shared module (no MCP required)
- Walker integration: bag matrices for 14-complete and prism shapes
- Side-by-side: build structured `Condition` trees matching keep-sites; assert `evaluateCondition` === `evaluateWhenExpression`
- `npm run check:all` / `check:delta` after corpus touch
- Corpus grep: no bare mixed ops; four sites use parenthesized `when`

## Recommended Implementation Sequence

1. Add `src/schema/when-expression.ts` (parse + eval + authoring check)
2. Unit fixtures (SC-3–SC-7 shapes)
3. Wire `tests/e2e/walker.ts` `evaluateWhen` → shared module (fail-closed)
4. Schema describe + agent-facing rule (SC-2, SC-8)
5. Guard for mixed-ops parentheses (SC-4, SC-10)
6. Migrate four YAML sites; update migration register; `check:all`
7. Optionally rewire stealth `evalWhen` to shared module

## Assumptions (implementation analysis)

Recorded in [02-assumptions-log.md](02-assumptions-log.md):

| ID | Statement | Resolution |
|----|-----------|------------|
| IA-1 | Module lives at `src/schema/when-expression.ts` | Confirmed by packaging analysis (code co-location + walker import path) |
| IA-2 | Fail-closed maps to walker skip (`continue`), not throw aborting the whole walk | Confirmed — matches false-gate path today |
| IA-3 | v1 operators: `==`/`!=`, bare truthiness, `!`, `&&`, `\|\|`, parentheses; no `exists`/`>` in `when` | Confirmed — four keep-sites + RE-3 |
| IA-4 | Single PR preferred; sequential evaluator-then-corpus acceptable | Confirmed — DP-6 |
| IA-5 | Changing `evaluateWhen` is LOW risk | Validated — GitNexus impact |

## Sources of Evidence

| Source | Type | What It Showed |
|--------|------|----------------|
| `tests/e2e/walker.ts:306-326` | Code | `&&`-only, fail-open |
| `src/schema/condition.schema.ts` | Code | Full structured oracle |
| `src/schema/activity.schema.ts:74` | Code | Agent-evaluated model |
| `scripts/check-stealth-isolation.ts:116-129` | Code | Second incomplete parser |
| Keep-site YAML (3 files) | Corpus | Four OR trees / shapes |
| Live `when` + `&&` grep | Corpus | No `\|\|` yet; flat AND present |
| GitNexus `evaluateWhen` impact | Graph | LOW upstream risk |
| [03-requirements-elicitation.md](03-requirements-elicitation.md) | Requirements | SC-1–SC-11 |
| [04-kb-research.md](04-kb-research.md) | Research | Patterns and risks |
| [when-step-gates.md](../../comprehension/when-step-gates.md) | Comprehension | Architecture dual dialect |

**Status:** Ready for plan-prepare activity
