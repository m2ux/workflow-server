# ADR-0009: Shared `when` Expression Module with Parentheses and Precedence

## Status
Accepted

## Context
Inline `when:` step gates supported simple comparisons and flat `&&` compounds. Nested OR shapes stayed on structured `condition:` because parentheses, C-style operator precedence, and a single fail-closed evaluator for mixed `&&` / `||` / `!` were not validated. Docs already described boolean algebra the walker could not fully enforce. Four production keep-sites needed parenthesized OR before a safe corpus migration.

Planning: [design philosophy](../planning/2026-08-01-when-expressions-parentheses-and-precedence-before-or-step-gate-migration/02-design-philosophy.md), [requirements](../planning/2026-08-01-when-expressions-parentheses-and-precedence-before-or-step-gate-migration/03-requirements-elicitation.md). Issue [#379](https://github.com/m2ux/workflow-server/issues/379). PR [#383](https://github.com/m2ux/workflow-server/pull/383).

## Decision Drivers
1. **One reference dialect** — parse and eval live in one module consumed by tests and guards.
2. **C-style precedence** — `||` looser than `&&`; unary `!`; parentheses load-bearing for mixed forms.
3. **Fail-closed invalid input** — unparseable expressions do not silently run steps.
4. **Authoring net** — bare mixed operators without parentheses are rejected.
5. **Production gate authority stays with the agent** — multi-agent harness authority and MCP-side production evaluation stay out of this package.

## Considered Options

| Option | Pros | Cons |
|--------|------|------|
| **Shared module + parenthesized migration** (selected) | One truth for walker/guards; four sites leave structured OR | Authors must parenthesize mixed ops |
| Keep OR on structured `condition:` only | No new grammar | Docs over-promise; authors stuck |
| Server-only production evaluator in this package | Single authority | Out of scope; agents remain production evaluators |
| Pass-through on invalid expressions | Soft migration | Silent wrong skip/run |

## Decision
Ship `src/schema/when-expression.ts` as the reference parse/eval for parentheses, C-style precedence, `||` / `&&` / `!`, and comparisons. Wire the e2e walker and stealth isolation to that module fail-closed. Register `check:when` for bare mixed-ops. Migrate the four nested OR keep-sites to parenthesized `when:` with truth-table parity against structured `evaluateCondition`.

**Implementation outcome (PR [#383](https://github.com/m2ux/workflow-server/pull/383)):** branch `chore/379-when-expressions-parentheses-precedence`; local validation typecheck clean, **811** tests passed, **20/20** guards; stakeholder strategic review acceptable; operator review **pass** (empty review surface). Checkpoint `condition_not_met`, loop OR predicates, and multi-agent harnesses remain deferred.

## Consequences

**Positive:**
- Authors express nested boolean step gates in one inline dialect
- Mechanical nets and unit tables share one evaluator
- Four production OR sites no longer require structured `condition:`

**Negative:**
- Mixed `&&`/`||` without parentheses is rejected (authoring friction by design)
- Production gate evaluation remains agent-side until a later package

**Neutral:**
- Companion tracks own checkpoint `when` + `condition_not_met` and loop continuation OR

## Related Decisions
- Prior plain + flat-`&&` migration trail under issue [#338](https://github.com/m2ux/workflow-server/issues/338) / PR [#374](https://github.com/m2ux/workflow-server/pull/374)

## Notes
- Agent comprehension harnesses explicitly out of scope (issue §0 default)
