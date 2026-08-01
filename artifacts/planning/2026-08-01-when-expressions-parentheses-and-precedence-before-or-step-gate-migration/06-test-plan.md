# Test Plan: when expressions — parentheses, precedence, OR readiness

> **ADR:** *(owed at close-out if architectural)* · **Ticket:** [#379](https://github.com/m2ux/workflow-server/issues/379) · **PR:** [#383](https://github.com/m2ux/workflow-server/pull/383)

## Overview

This test plan validates the shared `when` expression grammar (parentheses, C-style precedence, `\|\|`/`&&`/`!`), fail-closed invalid input, e2e walker agreement, authoring lint for bare mixed operators, and side-by-side parity with structured `evaluateCondition` for the four OR keep-sites before and after corpus migration.

Key changes to validate:
1. `when-expression` module (`src/schema/when-expression.ts`) — parse/eval/authoring
2. `evaluateWhen` in `tests/e2e/walker.ts` — shared-module consumer, fail-closed
3. Four migrated step gates — parenthesized `when` ≡ prior structured trees
4. Mixed-ops guard — bare `a && b \|\| c` rejected

## Planned Test Cases

| Test ID | Objective | Type | Source |
|---------|-----------|------|--------|
| [PR383-TC-01](https://github.com/m2ux/workflow-server/blob/main/tests/when-expression.test.ts#L10) | Flat `a \|\| b` truth table (TT/TF/FT/FF) | Unit | `tests/when-expression.test.ts:10` |
| [PR383-TC-02](https://github.com/m2ux/workflow-server/blob/main/tests/when-expression.test.ts#L22) | `&&` binds tighter than `\|\|` when parentheses force both groupings | Unit | `tests/when-expression.test.ts:22` |
| [PR383-TC-03](https://github.com/m2ux/workflow-server/blob/main/tests/when-expression.test.ts#L30) | Bare mixed `a && b \|\| c` rejected by authoring/parse policy | Unit | `tests/when-expression.test.ts:30` |
| [PR383-TC-04](https://github.com/m2ux/workflow-server/blob/main/tests/when-expression.test.ts#L41) | Unary `!` and parentheses nesting | Unit | `tests/when-expression.test.ts:41` |
| [PR383-TC-05](https://github.com/m2ux/workflow-server/blob/main/tests/when-expression.test.ts#L50) | Comparisons `==`/`!=`, quoted strings, bools, null, numbers, dotted paths | Unit | `tests/when-expression.test.ts:50` |
| [PR383-TC-06](https://github.com/m2ux/workflow-server/blob/main/tests/when-expression.test.ts#L63) | Bare identifier truthiness (existing walker semantics) | Unit | `tests/when-expression.test.ts:63` |
| [PR383-TC-07](https://github.com/m2ux/workflow-server/blob/main/tests/when-expression.test.ts#L72) | Invalid / unparseable expression fails closed (does not execute) | Unit | `tests/when-expression.test.ts:72` |
| [PR383-TC-08](https://github.com/m2ux/workflow-server/blob/main/tests/when-expression.test.ts#L81) | 14-complete nested shape bag matrix (moderate/complex × review mode) | Unit | `tests/when-expression.test.ts:81` |
| [PR383-TC-09](https://github.com/m2ux/workflow-server/blob/main/tests/when-expression.test.ts#L95) | Prism run-structural nested shape bag matrix | Unit | `tests/when-expression.test.ts:95` |
| [PR383-TC-10](https://github.com/m2ux/workflow-server/blob/main/tests/when-expression.test.ts#L108) | Side-by-side: four keep-site structured trees vs `when` on identical bags | Unit | `tests/when-expression.test.ts:108` |
| [PR383-TC-11](https://github.com/m2ux/workflow-server/blob/main/tests/when-expression.test.ts#L182) | Existing flat-`&&` expressions still evaluate as before | Unit | `tests/when-expression.test.ts:182` |
| PR383-TC-12 | Walker `evaluateWhen` uses shared module (integration smoke) | Integration | `tests/e2e/walker.ts` + TC suite |
| PR383-TC-13 | Guard rejects bare mixed ops; accepts parenthesized mixed forms | Guard | `scripts/check-when-expression.ts` |
| PR383-TC-14 | After migration: four YAML sites use `when`; structured OR removed at those steps | Corpus / guard | migrated YAML keep-sites |
| PR383-TC-15 | `check:all` / targeted guards clean on touched workflows | Guard | CI / local `check:all` |

Implementation sources: [`tests/when-expression.test.ts`](https://github.com/m2ux/workflow-server/blob/main/tests/when-expression.test.ts), [`scripts/check-when-expression.ts`](https://github.com/m2ux/workflow-server/blob/main/scripts/check-when-expression.ts), four migrated YAML keep-sites.

## Acceptance Criteria Matrix

| Requirement | Acceptance Criterion | Verifying Test Cases |
|-------------|----------------------|----------------------|
| SC-2 / SC-3 | Grammar + C-style precedence implemented once | TC-01–TC-06 |
| SC-4 / SC-10 | Bare mixed ops rejected; parenthesized OK | TC-03, TC-13 |
| SC-5 / SC-7 | Fixtures cover flat OR, nested production shapes | TC-01, TC-08, TC-09, TC-12 |
| SC-6 | Invalid fails closed | TC-07, TC-12 |
| SC-9 | Four sites migrated; guards clean | TC-14, TC-15 |
| SC-11 | Parity with `evaluateCondition` | TC-10 |
| Regression | Flat `&&` corpus semantics preserved | TC-11 |

## Running Tests

```bash
npm run typecheck
npm test -- --run when-expression
npm run check:when
npm run check:stealth
npm run test:ci
npm run check:delta
npm run check:all
```
