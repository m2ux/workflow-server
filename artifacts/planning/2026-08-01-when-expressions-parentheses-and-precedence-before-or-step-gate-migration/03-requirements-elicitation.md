# Requirements Elicitation: when expressions — parentheses, precedence, and OR step-gate readiness

> 2026-08-01 · Pending Confirmation (agent-led; stakeholder discussion skipped)

## Problem Statement

Today the workflow corpus can express simple step gates and flat AND compounds as inline `when:` expressions, but any gate that needs OR still has to stay in the older structured `condition:` form. That split exists because parentheses, operator precedence, and a full boolean evaluator for mixed `&&` / `||` were not validated when the plain gates moved over — so authors cannot safely write the nested shapes the remaining sites need. Until those rules and the evaluator land, OR-shaped gates stay stranded on the structured path, docs that already describe boolean algebra over-promise what the walker can enforce, and a naive OR migration would risk running or skipping steps differently from the structured trees. Clarifying whether multi-agent comprehension trials are required is part of settling the acceptance bar; production step gates are already agent-evaluated today.

## Goal

A single documented `when` grammar (comparisons, `&&`, `||`, unary `!`, parentheses) with fixed C-style precedence, mandatory parentheses when mixing `&&`/`||`, a shared reference evaluator consumed by the e2e walker (and any future caller), fail-closed invalid expressions, authoring/lint rules, and a safe migration path for the four OR step-gate keep-sites — without changing gate variable semantics and without treating multi-agent comprehension harnesses as default acceptance work.

## Stakeholders

### Primary Users

| User Type | Needs | User Story |
|-----------|-------|------------|
| Workflow author | Write nested OR step gates as parenthesized `when` without semantic surprise | As a workflow author, I want `\|\|` and parentheses in `when` so that OR gates leave structured `condition:` without changing run/skip meaning |
| Corpus maintainer / migration owner | Safe OR→`when` migration after #374 | As a maintainer, I want a precedence-correct evaluator and fixtures so that migrating the four keep-sites cannot greenwash wrong skips |
| e2e / definition-guard consumer | Walker and tests agree with the grammar | As a test author, I want `evaluateWhen` to share the reference module so that unparseable expressions fail closed and nested shapes match structured trees |
| Executing agent (worker) | Correct gate judgment under the agent-evaluated model | As a worker, I want a short grammar rule and production-shaped fixtures so that I skip/run the same steps the reference evaluator would |
| Issue / PR reviewer (#379 / #383) | Clear §0 decision and acceptance bar | As a reviewer, I want §0 execution-model and agent-trial scope explicit so that optional multi-agent harness work does not block evaluator delivery |

### Secondary Stakeholders

- Prior migration trail [#338](https://github.com/m2ux/workflow-server/issues/338) / [PR #374](https://github.com/m2ux/workflow-server/pull/374) — flat/`&&` only; OR keep inventory is the binding input
- Companion server track for checkpoint `when` + `condition_not_met` — out of first delivery unless unblocked
- Design-principle / schema doc readers — already see boolean algebra advertised ahead of implementation

## Context

### Integration Points

- `src/schema/activity.schema.ts` — `when` field; documents agent evaluation; server never evaluates gates
- `src/schema/condition.schema.ts` — structured `Condition` AST + `evaluateCondition` (library/tests; not MCP gate authority)
- `tests/e2e/walker.ts` `evaluateWhen` — `&&`-only split; unparseable → execute (fail-open)
- Four OR step-gate keep-sites (work-package `14-complete` ADR steps; workflow-design `persist-structural-inventory`; prism `run-structural`)
- Planning trail `2026-08-01-migrate-legacy-structured-step-conditions-to-when` (`06-migration-register.md`, `09-COMPLETE.md`)
- Comprehension: [when-step-gates.md](../../comprehension/when-step-gates.md)

### Dependencies

- #374 must remain the flat/`&&` migration baseline; this package does not re-litigate plain migrations
- Checkpoint OR / `condition_not_met` on `when` is a separate server track
- Live agents remain the production gate authority unless a later decision moves evaluation server-side

### Constraints

- **Technical:** Dialect + evaluator fidelity only — do not change gate *variable* semantics, thresholds, or bag names. First PR may ship shared evaluator + fixtures + walker before corpus migration.
- **Timeline:** Draft PR [#383](https://github.com/m2ux/workflow-server/pull/383) on `chore/379-when-expressions-parentheses-precedence`.
- **Resources:** Worktree `.worktrees/2026-08-01-when-expressions-parentheses-and-precedence-before-or-step-gate-migration`; host `m2ux/workflow-server`.
- **Stakeholder input:** Discussion skipped (`has_stakeholder_input: false`); requirements are agent-led from issue #379, design philosophy, comprehension, and code evidence. Confirmation still owed at the elicitation-complete gate.

## Scope

### In Scope

1. **§0 execution model (documented decision).** Record that production step `when` gates are evaluated by the executing agent; the MCP server does not evaluate gates. The e2e walker is the automated safety net and must share a reference evaluator. Multi-agent comprehension *harnesses* remain **out of scope by default**. A short agent-facing grammar rule plus truth-table fixtures that prove the nested production shapes are **in scope** because agents are the production path — this is lean safety documentation, not a multi-agent trial program.
2. **Documented grammar.** Comparisons (at least `==` / `!=` as today), `&&`, `||`, unary `!`, parentheses; identifiers with dotted paths into the variable bag.
3. **Fixed precedence.** C-style: `()` > `!` > comparisons > `&&` > `||`, stated in schema/docs and implemented once in the reference module.
4. **Mandatory parentheses when mixing `&&` and `||`.** Authoring rule even when precedence would match; readers must not rely on silent precedence alone.
5. **Shared reference evaluator module.** Single implementation used by e2e `evaluateWhen` (replace `&&`-only split) and available to unit tests; packaging may later serve a server path without requiring MCP gate authority in this package.
6. **Fail-closed invalid expressions.** Unparseable / invalid `when` must not silently execute (opposite of today's walker pass-through).
7. **Truth-table fixtures.** At least: flat `a || b`; `a && b || c` vs `(a && b) || c` vs `a && (b || c)`; the two nested production shapes from `14-complete` and prism `run-structural`; invalid expressions fail closed.
8. **Authoring rules + preferred lint/guard.** Reject mixed `&&`/`||` without parentheses; optional warn on any `||` until evaluator is proven (if cheap).
9. **Migration recipe** for structured `type: or` / nested `and`+`or` → parenthesized `when`.
10. **Corpus migration of the four OR step gates** after §1–§2 land (same PR or immediate follow-on PR per packaging decision) with register updates and definition guards.
11. **Short agent-facing rule** in workflow-engine / activity-worker guidance: evaluate `when` per grammar; honor parentheses; do not invent left-to-right-only reading when parens are present.

### Out of Scope

1. **Multi-agent or protocol trial harnesses** that schedule multiple workers solely to prove comprehension — not required unless a later stakeholder decision promotes them.
2. **Moving production gate authority into MCP tools** in this package — optional future architecture; not required to unlock OR migration if agents keep evaluating and the walker/fixtures enforce the grammar.
3. **Checkpoint `condition` → `when`** (needs `condition_not_met` on `when`-gated checkpoints).
4. **Loop continuation predicates** (`while` / `doWhile` structured conditions).
5. **Exists-shaped predicates** remaining on structured `condition:`.
6. **Changing gate variable semantics** (which variables mean what) — dialect + evaluator fidelity only.
7. **Re-migrating plain/`&&` sites** already handled by #374.

### Deferred

Deferred scope items: [deferred-items register](deferred-items.md) — record each item there, not here.

## Success Criteria

| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| SC-1 | §0 decision is written in this package (execution model + agent-trial scope) and matches live schema/comprehension evidence | Review `03-requirements-elicitation.md` §0 outcome + issue comment or linked note; cross-check `activity.schema.ts` when-describe |
| SC-2 | Single documented grammar covers comparisons, `&&`, `||`, `!`, parentheses | Schema/docs section exists; unit parser tests accept the documented forms and reject invalids |
| SC-3 | Precedence is C-style (`()` > `!` > comparisons > `&&` > `\|\|`) and implemented once | Truth-table unit tests assert mixed-operator results; docs state the same order |
| SC-4 | Mixed `&&`/`\|\|` without parentheses is rejected by authoring rule and preferred lint/guard | Guard or unit test fixtures for illegal bare mixed forms; legal parenthesized forms pass |
| SC-5 | Reference evaluator and e2e walker agree on flat OR, nested production shapes, and parenthesized variants | Shared-module unit tests + walker integration cases for the four logical inventory shapes |
| SC-6 | Invalid / unparseable `when` fails closed (does not execute the step) | Walker/unit tests: garbage expression → skip/fail, never silent execute |
| SC-7 | Fixtures include `14-complete` and prism `run-structural` nested shapes with bag states that flip branches | Named fixture cases with expected skip/run matrices |
| SC-8 | Short agent-facing rule is published (grammar + honor parens); multi-agent harness is absent unless later promoted | Doc/rule present in workflow-engine or activity-worker guidance; no harness task required for merge of evaluator PR |
| SC-9 | Four OR step gates migrate to parenthesized `when` only after SC-2–SC-6; register rows updated; definition guards clean | Diff of four YAML sites + `06-migration-register` disposition + `npm run check:all` / targeted guards on touched workflows |
| SC-10 | No new live `when` with bare mixed `&&`/`\|\|` lacking parentheses | Corpus grep / guard after migration |
| SC-11 | Gate *variable* semantics unchanged vs structured trees for the four sites | Side-by-side evaluation of structured `evaluateCondition` vs new `when` on identical bags for the four keep-sites |

## Assumptions

Assumptions surfaced during elicitation: [assumptions log](02-assumptions-log.md) — record each there (categories: Requirement Interpretation, Scope Boundaries, Implicit Requirements, Success Criteria Interpretation), not here.

## Elicitation Log

### Questions Asked

| Domain | Question | Response Summary |
|--------|----------|------------------|
| Problem | What breaks if OR migrates without evaluator/precedence? | Semantic hazard: nested `&&`/`\|\|` can run/skip differently from structured trees; walker is `&&`-only and fail-open on junk |
| Problem | What triggers this now? | Follow-on to #374 which intentionally kept four OR step gates structured; docs already advertise full boolean algebra |
| Stakeholders | Who evaluates `when` in production? | Executing agent per `activity.schema.ts`; server never evaluates gates; e2e walker is test-side automated net |
| Stakeholders | Who needs this capability? | Authors, corpus maintainers, e2e/guards, workers under agent-evaluated model, PR reviewers |
| Context | What must share one grammar? | Reference module + e2e walker (+ optional future server); agents need short rules matching that grammar |
| Context | What are the binding fixtures? | Four keep-sites; nested `14-complete` and prism shapes make parentheses load-bearing |
| Scope | Is multi-agent comprehension a default gate? | No — out of scope by default per issue §0; short agent rule + fixtures are in scope because agents *are* production evaluators |
| Scope | Is MCP server-side gate evaluation required in this package? | No for unlock path; shared module may later feed a server path (open Q5 / DP-6 packaging) |
| Scope | First delivery packaging? | Prefer reference evaluator + fixtures + walker before or tightly sequenced with four-site corpus migration; agent multi-harness not on default path |
| Success | How do we know OR migration is safe? | Truth tables + fail-closed + side-by-side vs structured trees on four sites + guards + no bare mixed ops |

### Clarifications Made

- **§0 split:** Distinguish (A) multi-agent comprehension *trials/harnesses* — out of scope by default — from (B) agent-facing grammar fidelity — in scope because production evaluation is agent-side today.
- **"Server evaluator" vocabulary:** Means shared reference module + walker/tests (and docs), not an assumed move of MCP runtime authority in this package.
- **Precedence:** Adopt issue-recommended C-style; require parentheses whenever `&&` and `||` mix so authors do not depend on silent precedence.
- **Fail-closed:** Invalid expressions must not execute (change from current walker pass-through).

### Open Questions Resolved (agent-led provisional)

- **Q5 / server-side evaluation for this package:** Not required to unlock OR migration. Production remains agent-evaluated; shared module is the authoritative *specification* enforced in tests/walker. A future move of runtime authority is a separate architecture decision.
- **DP-4 precedence:** C-style adopted as the requirements baseline.
- **DP-5 agent comprehension:** Multi-agent harness out of scope; short agent rule + fixtures in scope.
- **DP-6 packaging:** Evaluator + fixtures + walker first; corpus migration of four sites immediately after (same or sequential PR); rename issue "server/test PR" language to "reference evaluator + walker" in plan prose.

## Confirmation

**Confirmed by:** user (elicitation-complete → complete)  
**Date:** 2026-08-01  
**Notes:** Agent-led elicitation with `has_stakeholder_input: false`. Stakeholder discussion was skipped. Checkpoint `elicitation-complete` resolved with option `complete` (`elicitation_complete: true`). §0 split, packaging, and success criteria accepted as written.
