---
name: test-suite-review
description: Guidelines for reviewing and evaluating test suites. Covers test quality assessment, coverage analysis, anti-pattern detection, and improvement recommendations.
metadata:
  version: 2.0.2
  order: 17
  legacy_id: 17
---


# Test Suite Review Guide

Act as a **Senior Test Architect**: test strategy, unit/integration/e2e methodology, TDD/BDD, test automation and CI/CD, coverage analysis, risk-based testing.

## Review Criteria

**1. Relevance & business alignment** — core business rules and domain logic covered; critical user workflows; public API contracts; external dependency boundaries. Happy paths, edge/boundary cases, error conditions and recovery, performance constraints, security/input validation. Scope: integration tests validate end-to-end workflows (not external API responses); unit tests cover client-side logic (validation, error handling, data transformation); no integration tests that primarily validate third-party library behavior; clear separation of our code vs external dependencies. Production alignment: tests reflect actual usage patterns; validate requirements that matter to users; no tests for deprecated/non-existent functionality; behavior-focused, not implementation-focused.

**2. Coverage & completeness** — all public functions/methods tested; state transitions; configuration variations; input/boundary variations. Adequate line/branch/function coverage; concurrency and thread safety; resource management and cleanup; error handling and recovery paths.

**3. Effectiveness & quality** — clear single-purpose intent; thorough outcome validation with proper assertions; isolation and independence; deterministic results. Readable structure; appropriate mocking; maintainable test data; reasonable execution performance.

**4. Salience & risk focus** — critical/complex code and business-critical paths comprehensively tested; security-sensitive areas covered; integration boundaries well-tested. Flag low-value tests per the anti-pattern list.

**5. Architecture & organization** — unit tests outnumber integration tests (typical 3:1 to 5:1); integration tests focus on system boundaries; no test-pyramid inversion; client logic tested at unit level. Robust framework usage, consistent mock/stub strategy, systematic test data management, proper setup/teardown.

## Anti-Patterns

Low-value patterns to flag (each can only fail if the language/framework is broken, or tests nothing real):

1. **Constructor + immediate field validation** — construct a struct, assert its fields equal the literals just assigned.
2. **Type name self-equality** — assert `type_name::<T>() == type_name::<T>()`; always true.
3. **Always-true assertions** — `assert!(true)` or equivalent placeholder.
4. **Default config hardcoded validation** — assert `Config::default()` fields equal the hardcoded defaults.
5. **Empty collection validation** — assert a freshly created collection is empty; always true.
6. **Pure mock interaction tests** — assert only that a mock was invoked or configured; exercises the mock framework, not the code.
7. **Mock-only passthrough** — set a mock response, call the mock, assert the mock returned it; no real logic exercised.
8. **Manual business logic in tests** — test reimplements the production calculation instead of calling the actual client method.
9. **Validation Theater** — both success and failure branches accepted as valid; test always passes.
10. **Language/type system guarantee tests** — e.g., asserting a mutex is not poisoned after an error return when Rust ownership guarantees the guard dropped cleanly.
11. **Derive macro output tests** — e.g., asserting thiserror `Display` strings or serde output; tests the macro, not app logic.
12. **Misleading happy-path tests** — name promises more than the assertions verify.

High-value patterns to encourage: protocol compliance (calculated values vs protocol specification), business rule enforcement (invalid input rejected with error), error boundary testing (timeouts, failure handling), state transition validation, real client logic (actual conversion/validation methods, not mocks).

## Field List

Designators use the prefix declared for this report's category at [Test Review](./review-mode.md#test-review). Every finding carries the fields of [Fields](./findings-report.md#fields), laid out per [Finding Layout](./findings-report.md#finding-layout). This report declares:

| Declaration | Value |
|---|---|
| `Category` vocabulary | Coverage Gap / Anti-Pattern / Redundancy / Harness Defect / Reported Failure |

On a test finding, `Description` opens with an inline link to the test, `Impact` states what goes unverified or what a passing run fails to prove.

## Report Template

```markdown
# Test Suite Review Report

> test-suite-review · [Work Package] · #[issue] - [Title] · YYYY-MM-DD

**Result:** [Acceptable / Needs Improvement / Significant Issues] · X/5 — [one-line assessment]

**Method:** [the command, or the continuous-integration run at the reviewed head, that produced the suite baseline]

## Findings

[One heading per finding, ascending by designator, no grouping heading between them. With no findings, state that in one line.]

### TR-1 — [one line naming the finding]

**Category:** [category]

**Severity:** [render-scale value]

**Reachability:** [a value from [Reachability](./findings-report.md#reachability)]

**Description:** [what the test does or fails to do, opening with an inline link to it]

**Impact:** [what goes unverified]

**Recommendation:** [improvement]
```

## Rules

- **Line budget:** ~30 lines per finding. A coverage figure is stated once, on the finding it supports.
