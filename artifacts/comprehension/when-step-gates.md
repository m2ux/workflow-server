# When Step Gates — Comprehension Artifact

> 2026-08-01 · work packages: [#379](https://github.com/m2ux/workflow-server/issues/379) · coverage: inline `when` vs structured `condition` evaluation surfaces, e2e walker, four OR keep-sites · related: [orchestration.md](orchestration.md), [zod-schemas.md](zod-schemas.md)

## Architecture Overview

### Project Structure

| Path | Role for #379 |
|------|----------------|
| `src/schema/activity.schema.ts` | Declares step `when` (string) and legacy `condition` (structured); documents **agent** evaluation |
| `src/schema/condition.schema.ts` | `Condition` AST + `evaluateCondition` (and/or/not/simple) |
| `tests/e2e/walker.ts` | Mechanical activity walker; `evaluateWhen` for inline gates |
| `tests/validation.test.ts` | Unit coverage for `evaluateCondition` |
| `workflows/**/activities/*.yaml` | Author-facing gate sites |
| Planning trail | `2026-08-01-migrate-legacy-structured-step-conditions-to-when` (PR #374) |

### Module Map

```
YAML step gate
  ├─ when: string  ──────────────► agent (production) + e2e evaluateWhen (tests)
  └─ condition: Condition AST ───► agent (production) + evaluateCondition (library; tests/scripts; runtime-dead in MCP tools)
```

- **Server MCP path** does not call `evaluateCondition` or parse `when` to skip steps. Workers honor gates from definition text.
- **e2e walker** is the only in-repo consumer that *automatically* skips steps on `when` / structured conditions during corpus walks.
- **Eager technique bundling** (`workflow-tools.ts`) skips pre-fetching techniques for steps that carry `when`/`condition` (lazy until the step is reached) — that is delivery policy, not gate truth.

### Design Patterns

- **Dual dialect:** preferred inline `when` for simple/`&&` compounds; structured `condition` retained for OR/nested OR, exists-shaped ops, checkpoint `condition_not_met`, and loop continuations.
- **Library-without-runtime:** full boolean tree evaluator exists for structured conditions but is not the production authority for step execution.
- **Fail-open test helper:** unparseable `when` in the e2e walker returns `true` (execute), which greenwashes incomplete parsers.

## Key Abstractions

### Core Types

| Type | Location | Notes |
|------|----------|-------|
| `when?: string` | `activity.schema.ts` `stepCommonFields` | Examples are plain comparisons only |
| `Condition` | `condition.schema.ts` | `simple` \| `and` \| `or` \| `not` |
| `evaluateCondition` | `condition.schema.ts:31` | Recursive; supports `exists`/`notExists` and numeric compares |
| `evaluateWhen` | `tests/e2e/walker.ts:306` | Recursive only on `&&` split; no `\|\|`, `!`, or parentheses |

### Data Model

Session variables are a flat/nested bag (`getVariableValue` / walker `getVar` walk dotted paths). Gate expressions name bag keys the agent (or walker) must resolve.

### Error Handling

- Structured evaluator: missing path → `undefined`; comparison operators behave accordingly; no throw on unknown variables.
- Inline walker: unparseable expression → **execute** (`return true`). Issue #379 acceptance wants **fail closed** for invalid expressions — opposite of today's walker default.

## Design Rationale

### Agent-side gate evaluation

- **Observation:** Schema describe text: "Evaluated by the executing agent against current variable state; the server never evaluates gates." Prior planning (`2026-07-03-schema-technique-disclosure-review`) marks `evaluateCondition` as runtime-dead in server tools.
- **Hypothesized rationale:** Keep MCP tools thin (session, delivery, checkpoints); fidelity is agent-protocol, not a hidden interpreter.
- **Trade-offs:** Authoring can express rich booleans; correctness depends on every worker/harness sharing the same grammar. Docs and e2e helpers can drift from agent behavior.
- **Implications for #379:** A "server evaluator" PR is likely a **shared reference module + walker/tests + agent-facing grammar**, not necessarily moving production gate authority into MCP — unless §0 explicitly changes the execution model.

### `&&`-only walker

- **Observation:** `evaluateWhen` splits only on `&&`; no `||` path.
- **Hypothesized rationale:** Matched live corpus after #374 (plain + flat AND only).
- **Trade-offs:** Fast for current corpus; cannot validate OR migration; pass-through on junk masks bugs.
- **Implications:** OR→`when` migration before walker upgrade is a semantic hazard (issue framing).

## Data Flow and Operational Context

### Data Flow Map

| Stage | Actor | Behavior |
|-------|-------|----------|
| Author | YAML | Writes `when` or `condition` on step |
| Load | Zod schemas | Validates shape; does not evaluate |
| Dispatch | `get_activity` | Returns step text including gate fields |
| Execute | Agent worker | Must skip/run step per gate vs bag |
| Test walk | e2e `evaluateWhen` / structured eval | Auto-skips when false |
| Checkpoint special | Server | Only structured `condition` enables `condition_not_met` dismissal |

### Invariant Alignment

| Invariant | Producer Enforces? | Consumer Assumes? | Gap? |
|-----------|-------------------|-------------------|------|
| `when` grammar includes `\|\|`, `()`, `!` | Docs/issue propose; code does not | Authors/docs may assume full boolean algebra | **Yes** — dialect advertised ahead of evaluator |
| Unparseable `when` fails closed | Issue acceptance wants yes | Walker fails open | **Yes** |
| Nested OR matches structured tree | Structured `evaluateCondition` yes | Inline path no | **Yes** for four keep-sites |
| Agent and walker agree | Neither shared module | Desired for safe migration | **Yes** |

### Execution Context

Gates are **soft protocol** for live agents: a non-compliant worker can run a gated step. e2e walks are the automated safety net and currently incomplete for OR.

### Operational Scenarios

| Scenario | Effect | Risk |
|----------|--------|------|
| Migrate nested OR to bare `a && b \|\| c` without parens | Walker may split only on `&&` or agents may left-to-right invent | Wrong skip/run vs structured tree |
| Invalid `when` typo | Walker executes step | Silent false green in e2e |
| Checkpoint OR still structured | Unrelated to step-gate migration | Out of scope until `condition_not_met` works with `when` |

## Domain Concept Mapping

### Glossary

| Domain Term | Technical Construct | Description |
|-------------|---------------------|-------------|
| Inline when | `step.when: string` | Preferred gate dialect for simple/`&&` |
| Structured condition | `step.condition: Condition` | AST with and/or/not/simple |
| OR keep-site | Migration register row | Step gate left structured after #374 for lack of `\|\|` precedent |
| Fail closed | Desired invalid-expr policy | Do not execute when expression does not parse |
| Reference evaluator | Proposed shared module | Single grammar implementation for walker (+ optional future server) |
| §0 | Issue acceptance block | Whether agent comprehension trials are required given agent-evaluated model |

### Domain Model

Problem #379 is dialect completion for the **step-gate** surface so the four remaining OR-shaped step gates can move to parenthesized `when` without changing variable semantics.

## Open Questions

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| 1 | Who is the production authority for step `when` today? | Resolved | Executing agent; server does not evaluate gates (`activity.schema.ts` when-describe; prior disclosure review) | Design Rationale |
| 2 | Does `evaluateCondition` run in MCP tools? | Resolved | No runtime callers in server tools; used in tests/library | Architecture Overview |
| 3 | What does e2e `evaluateWhen` support? | Resolved | Comparisons + `&&` recursion; unparseable → execute | Key Abstractions |
| 4 | Which production OR step gates block migration? | Resolved | Four sites: work-package `create-adr`/`update-adr-status`, workflow-design `persist-structural-inventory`, prism `run-structural` | Deep-Dive: OR keep-sites |
| 5 | Should production evaluation move server-side? | Open | Product/architecture (§0 / elicitation) — not settled by code alone | — |

### Remaining follow-up items (out of scope for this comprehension pass)

- Exact shared-module packaging (which package path, export surface).
- Checkpoint `when` + `condition_not_met` companion track.
- Loop `while`/`doWhile` OR predicates.

## Deep-Dive Sections

### OR keep-sites — 2026-08-01

Binding structured shapes (from live YAML + migration register):

1. **work-package `14-complete` `create-adr` / `update-adr-status`:**  
   `is_review_mode != true && (problem_complexity == "moderate" || problem_complexity == "complex")`  
   Parentheses are load-bearing: without them, `&&`/`||` mix is ambiguous under C-style vs left-to-right readings.

2. **workflow-design `01-intake-and-context` `persist-structural-inventory`:**  
   `operation_type == "update" || operation_type == "review"`  
   Flat OR — needs `||` support even without nesting.

3. **prism `01-structural-pass` `run-structural`:**  
   `(current_unit.pipeline_mode == "single" && current_unit.lens_name == "l12") || current_unit.pipeline_mode == "full-prism"`  
   Nested AND inside OR — parentheses load-bearing.

Truth-table fixtures for #379 should include these three logical shapes plus fail-closed invalids.

### e2e evaluateWhen — 2026-08-01

```306:326:tests/e2e/walker.ts
function evaluateWhen(expr: string, vars: Record<string, unknown>): boolean {
  if (expr.includes('&&')) {
    return expr.split('&&').every((clause) => evaluateWhen(clause.trim(), vars));
  }
  // ... comparison or bare truthiness ...
  // unparseable → return true
}
```

Naïve extension that only adds `||` split without a real parser still mishandles parentheses and mixed precedence — confirms issue requirement for a single documented grammar.

### Schema agent-evaluates claim — 2026-08-01

Commit `a758aca314387c35591e1107325d7711dfa8bc65` worktree: `when` field describe states agent evaluation and that the server never evaluates gates. This is the load-bearing fact for §0: "agent comprehension" is not an optional side quest if agents remain the production evaluators; it is the production path. The open product choice is whether to **keep** that model (and ship grammar + fixtures + short agent rules) or **move** authority to a shared/server evaluator.
