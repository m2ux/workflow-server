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

| Test ID | Objective | Type |
|---------|-----------|------|
| PR383-TC-01 | Flat `a \|\| b` truth table (TT/TF/FT/FF) | Unit |
| PR383-TC-02 | `&&` binds tighter than `\|\|` when parentheses force both groupings | Unit |
| PR383-TC-03 | Bare mixed `a && b \|\| c` rejected by authoring/parse policy | Unit |
| PR383-TC-04 | Unary `!` and parentheses nesting | Unit |
| PR383-TC-05 | Comparisons `==`/`!=`, quoted strings, bools, null, numbers, dotted paths | Unit |
| PR383-TC-06 | Bare identifier truthiness (existing walker semantics) | Unit |
| PR383-TC-07 | Invalid / unparseable expression fails closed (does not execute) | Unit |
| PR383-TC-08 | 14-complete nested shape bag matrix (moderate/complex × review mode) | Unit |
| PR383-TC-09 | Prism run-structural nested shape bag matrix | Unit |
| PR383-TC-10 | Side-by-side: four keep-site structured trees vs `when` on identical bags | Unit |
| PR383-TC-11 | Existing flat-`&&` expressions still evaluate as before | Unit |
| PR383-TC-12 | Walker `evaluateWhen` uses shared module (integration smoke) | Integration |
| PR383-TC-13 | Guard rejects bare mixed ops; accepts parenthesized mixed forms | Guard |
| PR383-TC-14 | After migration: four YAML sites use `when`; structured OR removed at those steps | Corpus / guard |
| PR383-TC-15 | `check:all` / targeted guards clean on touched workflows | Guard |

*Detailed steps, expected results, and source links will be added after implementation.*

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

*Commands will be added after implementation. Expected shape:*

```bash
npm run typecheck
npm test -- --run when-expression
npm run test:ci
npm run check:delta   # after corpus touch
npm run check:all     # full guard table when ready
```
