---
name: test-suite-review
description: Guidelines for reviewing and evaluating test suites. Covers test quality assessment, coverage analysis, anti-pattern detection, and improvement recommendations.
metadata:
  version: 1.3.0
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

Designators use the prefix declared for this report's category at [Test Review](./review-mode.md#test-review). Every finding carries the five fields of [Fields](./findings-report.md#fields), laid out per [Finding Layout](./findings-report.md#finding-layout). This report declares:

| Declaration | Value |
|---|---|
| `Category` vocabulary | Coverage Gap / Anti-Pattern / Redundancy / Harness Defect / Reported Failure |

On a test finding, `Description` opens with an inline link to the test, `Impact` states what goes unverified or what a passing run fails to prove.

## Report Template

Reference this guide in the header's Author link so readers understand the methodology used, and link the method record for what the review walked.

```markdown
# Test Suite Review Report

> [Work Package] · #[issue] - [Title] · YYYY-MM-DD · [Test Suite Review](https://github.com/m2ux/workflow-server/blob/workflows/work-package/resources/test-suite-review.md) Agent · what was walked: [method record](NN-test-suite-review-method.md)

## Summary Assessment

**Overall Test Quality:** X/5 — [brief assessment]

## Findings

[One heading per finding, ascending by designator, no grouping heading between them. With no findings, state that in one line.]

### TR-1 — [one line naming the finding]

**Category:** [category]

**Severity:** [render-scale value]

**Description:** [what the test does or fails to do, opening with an inline link to it]

**Impact:** [what goes unverified]

**Recommendation:** [improvement]

## Review Outcome

**Result:** [Acceptable / Needs Improvement / Significant Issues]

**Summary:** [1-2 sentence summary of findings and next steps]
```

## Method Record Template

```markdown
# Test Suite Review Method

> test-suite review method · [Work Package] · YYYY-MM-DD · findings: [test suite review report](NN-test-suite-review.md)

## Review Scope

| Aspect | Details |
|--------|---------|
| Module(s) Reviewed | [module names] |
| Test Files Analyzed | [count] |
| Total Tests Reviewed | [count] |
| Testing Framework | [framework name] |

## Suite Baseline

[The command that runs the suite and what it reported, so a reader can reproduce the baseline the review judged against.]

## Assessment Criteria

[Exception-only: if all of Relevance & Business Alignment, Coverage Completeness, and Test Effectiveness PASS, state "All 3 assessment criteria PASS" on one line. Otherwise list only the FAILing criteria with notes.]

## Individual Test Function Analysis

[Exception-only: state "[X-Y] of [X] tests clean" on one line; table rows only for tests with anti-patterns or issues.]

| Test Function | Anti-Patterns | Business Value | Issues |
|---------------|---------------|----------------|--------|
| `test_name_2` | Mock passthrough | Low | No real logic tested |
| `test_name_3` | Always-true assertion | None | Should be removed |

## Anti-Pattern Detection Summary

Total tests analyzed: [X] · with anti-patterns: [Y] · clean: [X-Y] · rate: [Y/X %]

[Omit the table below if no anti-patterns found.]

| Pattern Type | Count | Examples |
|--------------|-------|----------|
| [pattern name] | [n] | `test_name` |

## Coverage Analysis

### Coverage Gaps Identified

[Omit this section if none.]

| Area | Gap Description | Priority |
|------|-----------------|----------|
| [Module/Function] | [Missing scenarios / edge cases] | High/Medium/Low |

### Test Pyramid Assessment

[Exception-only: state "Pyramid OK (unit [x%] / integration [x%] / e2e [x%])" on one line; table rows only for INVERTED layers. Expected bands: unit 70-80%, integration 15-25%, e2e 5-10%.]

| Test Type | Count | Expected Ratio | Actual Ratio | Status |
|-----------|-------|----------------|--------------|--------|
| [type] | [n] | [x%] | [x%] | INVERTED |

## Test Redundancy Analysis

[Omit this section if no redundancy found.]

| Integration Test | Unit Test Coverage | Redundancy | Recommended Strategy |
|------------------|-------------------|------------|---------------------|
| `test_workflow_a` | `unit_a` + `unit_b` | 100% | DELETE integration |
| `test_workflow_b` | `unit_c` (partial) | 70% | ENHANCE unit tests |
| `test_workflow_c` | None | 0% | KEEP or CONVERT to unit |

## Reported-Failure Triage

[Omit if none were reported. One row per reported runtime failure with the code path that raises it and the state precondition that reaches it.]
```

## Rules

- **Line budget:** ~30 lines per finding. Coverage figures are stated once, not repeated per finding.
