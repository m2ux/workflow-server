---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 2.0.0
  order: 1
  legacy_id: 1
---

## Capability

Review test suite quality and coverage — assessing coverage gaps, assertion quality, and test isolation, and identifying anti-patterns such as flaky tests and over-mocking

## Inputs

### changed_files

List of files changed in the work package (from git diff)

## Protocol

### 1. Load Guidance

- Use attached [test-suite-review](../resources/test-suite-review.md) for full review criteria
- From the `changed_files` set, identify all test files in the project related to the changed code
- If no test files are found, document the missing tests as a critical finding and proceed

### 2. Diff Aware Coverage Map

- Coverage assessment must be diff-aware — scope evaluation to the changed-symbol set rather than absolute project coverage
- Apply [gitnexus-operations](./gitnexus-operations/TECHNIQUE.md)::[diff-coverage-map](./gitnexus-operations/diff-coverage-map.md): it enumerates the changed-symbol set and, for each changed symbol, finds existing test callers (incoming references from test files)
- Treat its coverage_gaps (symbols with no test callers) as coverage gaps and update_candidates (symbols with stale test callers) as update candidates

### 3. Run Tests

- Run the test suite to establish a passing baseline
- If the test suite is not passing, fix the failing tests before continuing with the review

### 4. Review Tests

- Assess test coverage relative to implementation changes
- Check for anti-patterns (flaky tests, over-mocking, brittle assertions)
- Verify test isolation and independence
- Review assertion quality and error message clarity
- For Rust projects, reference TDD best practices from [tdd-concepts-rust](../resources/tdd-concepts-rust.md)

### 5. Document Findings

- Document findings with severity and recommendations
- Create the {test_suite_review_report} in {planning_folder_path}

### 6. Present Summary

- Summarize coverage gaps and critical issues for checkpoint

## Outputs

### test_suite_review_report

Test suite review [report](../resources/test-suite-review.md#test-suite-review-report-template) documenting quality assessment

#### artifact

`test-suite-review.md`

## Rules

### coverage-relative

Assess coverage relative to the changes made, not absolute project coverage

### actionable-recommendations

Every finding must include a concrete improvement suggestion
