---
metadata:
  version: 2.1.0
---

## Capability

Review test suite quality and coverage — assessing coverage gaps, assertion quality, and test isolation, and identifying anti-patterns such as flaky tests and over-mocking

## Inputs

### changed_files

List of files changed in the work package (from `git diff`)

### planning_folder_path

Folder where the test suite review report is written

### prior_feedback_triage

*(optional)* The triage of prior PR feedback, when present. Its entries tagged as reported runtime failures are the input to reported-failure triage — each is traced to a code path and state precondition here rather than re-read from the PR thread.

## Outputs

### test_suite_review_report

Test suite review [report](../resources/test-suite-review.md#test-suite-review-report-template) documenting quality assessment

#### artifact

`test-suite-review.md`

## Protocol

### 1. Load Guidance

- Use attached [test-suite-review](../resources/test-suite-review.md) for full review criteria
- From the `{changed_files}` set, identify all test files in the project related to the changed code
- If no test files are found, document the missing tests as a critical finding and proceed

### 2. Diff Aware Coverage Map

- Coverage assessment must be diff-aware — scope evaluation to the changed-symbol set rather than absolute project coverage
- Apply [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[diff-coverage-map](../../meta/techniques/gitnexus-operations/diff-coverage-map.md): it enumerates the changed-symbol set and, for each changed symbol, finds existing test callers (incoming references from test files)
- Treat its `coverage_gaps` (symbols with no test callers) as coverage gaps and `update_candidates` (symbols with stale test callers) as update candidates

### 3. Run Tests

- Run the test suite to establish a passing baseline
- If the test suite is not passing, fix the failing tests before continuing with the review

### 4. Review Tests

- Assess test coverage relative to implementation changes
- Check for anti-patterns (flaky tests, over-mocking, brittle assertions)
- Verify test isolation and independence
- Review assertion quality and error message clarity
- For Rust projects, reference TDD best practices from [tdd-concepts-rust](../resources/tdd-concepts-rust.md)

#### Multi-instance coverage gate

Generic and multi-instance code — a generic function, a trait implemented for several types, a handler parameterised over a runtime-configured instance set — is covered only when each instance it can take is exercised. Coverage of one instance is not coverage of the type:

- Enumerate the instances the changed generic / multi-instance code can take in the running system, and flag any instance with no exercising test as a coverage gap (≥ Minor, so it routes).
- When a branch is unreachable under the current test mock — the mock pins a single instance, so a path that only the other instances reach can never execute — escalate the **test harness itself** as a finding: the mock conceals the branch from coverage. This is a harness defect, classified ≥ Minor, not a default-Medium nit on the untested branch.

#### Reported-failure triage

When `{prior_feedback_triage}` is present, every entry tagged as a reported runtime failure is traced to its origin — captured once during feedback ingest, traced once here, never re-read from the thread:

- Trace each reported failure to the specific code path that raises it and the state precondition under which that path is reached.
- Reproduce the failure where the harness allows; otherwise trace it statically and name the triggering conditions.
- Record each traced failure as a finding (≥ Minor, so it routes); a failure with no test exercising its triggering path is also a coverage gap per the multi-instance gate above.

### 5. Document Findings

- Document findings with severity and recommendations
- Create the `{test_suite_review_report}` in `{planning_folder_path}`

### 6. Present Summary

- Summarize coverage gaps and critical issues

## Rules

### coverage-relative

Assess coverage relative to the changes made, not absolute project coverage

### actionable-recommendations

Every finding must include a concrete improvement suggestion

### findings-constraint

Every finding names a file within the authored surface `{changed_files}`. Findings on files in `{changed_files}` form the PR's findings; findings on other files form a separate "pre-existing" grouping.
