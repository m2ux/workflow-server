---
name: review-test-suite
description: Assess test quality across the work package — coverage gaps, anti-patterns (flaky tests, over-mocking), assertion quality, and test isolation.
metadata:
  ontology: legacy
  kind: skill
  version: 2.0.0
  order: 1
  legacy_id: 1
---

# Review Test Suite

## Capability

Review test suite quality, coverage, and identify anti-patterns

## Inputs

### changed-files

List of files changed in the work package (from git diff)

## Protocol

### 1. Load Guidance

- Use attached resource 17 (test-suite-review) for full review criteria
- Identify all test files in the project related to changed code

### 2. Diff Aware Coverage Map

- Coverage assessment must be diff-aware — scope evaluation to the changed-symbol set rather than absolute project coverage
- Use `gitnexus_detect_changes()` to enumerate the changed-symbol set, then for each changed symbol use `gitnexus_context({name: <symbol>})` to find existing test callers (incoming references from test files)
- Map symbols-with-no-test-callers to coverage gaps and symbols-with-stale-test-callers to update candidates. See resource 27.

### 3. Run Tests

- Run the test suite to establish a passing baseline

### 4. Review Tests

- Assess test coverage relative to implementation changes
- Check for anti-patterns (flaky tests, over-mocking, brittle assertions)
- Verify test isolation and independence
- Review assertion quality and error message clarity
- For Rust projects, reference TDD best practices from resource 23

### 5. Document Findings

- Document findings with severity and recommendations
- Create test-suite-review.md report in planning folder

### 6. Present Summary

- Summarize coverage gaps and critical issues for checkpoint

## Outputs

### test-suite-review-report

Test suite review report documenting quality assessment

- **artifact**: `test-suite-review.md`
- **coverage_assessment**: Coverage analysis relative to changes
- **anti_patterns**: Anti-patterns found with locations
- **recommendations**: Prioritized improvement recommendations

## Rules

### coverage-relative

Assess coverage relative to the changes made, not absolute project coverage

### actionable-recommendations

Every finding must include a concrete improvement suggestion

## Errors

### tests_fail

**Cause:** Test suite not passing

**Recovery:** Fix failing tests before review

### no_tests

**Cause:** No test files found

**Recovery:** Document missing tests as critical finding

## Resources

- [test-suite-review](skill:legacy/work-package/resources/test-suite-review)
- [tdd-concepts-rust](skill:legacy/work-package/resources/tdd-concepts-rust)
- [gitnexus-reference](skill:legacy/work-package/resources/gitnexus-reference)
