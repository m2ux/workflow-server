---
metadata:
  version: 2.5.0
---

## Capability

Test-suite quality and coverage review — gaps, assertion quality, isolation, and anti-patterns.

## Inputs

### changed_files

List of files changed in the work package (from `git diff`)

### prior_feedback_triage

*(optional)* The triage of prior PR feedback, when present. Its entries tagged as reported runtime failures are the input to reported-failure triage — each is traced to a code path and state precondition here rather than re-read from the PR thread.

## Outputs

### test_suite_review_report

Test suite review [report](../resources/test-suite-review.md#report-template) stating the suite's findings and the review outcome.

#### artifact

`test-suite-review.md`

#### audience

`human`

### test_suite_review_method

Method [record](../resources/test-suite-review.md#method-record-template) of how the review was conducted — the suite baseline, the coverage map, the anti-pattern sweep, the pyramid and redundancy assessments, and the reported-failure triage.

#### artifact

`test-suite-review-method.md`

#### audience

`human`

## Protocol

### 1. Load Guidance

- Review against the attached [Review Criteria](../resources/test-suite-review.md#review-criteria) and [Anti-Patterns](../resources/test-suite-review.md#anti-patterns)
- From the `{changed_files}` set, identify all test files in the project related to the changed code
- If no test files are found, document the missing tests as a critical finding and proceed

### 2. Diff Aware Coverage Map

- Coverage assessment must be diff-aware — scope evaluation to the changed-symbol set rather than absolute project coverage
- Apply [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[diff-coverage-map](../../meta/techniques/gitnexus-operations/diff-coverage-map.md): it enumerates the changed-symbol set and, for each changed symbol, finds existing test callers (incoming references from test files)
- Treat its `coverage_gaps` (symbols with no test callers) as coverage gaps and `update_candidates` (symbols with stale test callers) as update candidates

### 3. Run Tests

- Run the test suite to establish a passing baseline
- If the test suite is not passing, fix the failing tests before continuing with the review
- Where the suite did not run here, name continuous integration at the reviewed head as the authority for every claim this review makes about it — the run, its conclusion, and the head it ran against. A review of someone else's change routinely lacks the toolchain, and a suite claim whose basis goes unstated reads as one the reviewer executed.

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

- State each finding in the shape [Finding Layout](../resources/findings-report.md#finding-layout) declares, carrying the fields under [Field List](../resources/test-suite-review.md#field-list) and no others, with its severity derived through the map per [Severity](../resources/findings-report.md#severity) and its reachability settled from the code the finding cites per [Reachability](../resources/findings-report.md#reachability)
- Create the `{test_suite_review_report}` in `{planning_folder_path}`
- Emit a brief summary of coverage gaps and critical issues as part of the bindable report output for the binding activity to surface

### 6. Record the Method

- Create the `{test_suite_review_method}` in `{planning_folder_path}` from the [Method Record Template](../resources/test-suite-review.md#method-record-template): the suite baseline and the command that reproduces it, the coverage map, the anti-pattern sweep with its counts, the pyramid and redundancy assessments, and the reported-failure triage. A finding's own evidence stays on the finding, per [Report and Methodology](../resources/findings-report.md#report-and-methodology)

## Rules

### suite-claims-name-their-authority

Every claim about the suite names what establishes it: the run performed here, or the continuous-integration run at the reviewed head. An unattributed claim asserts the stronger of the two, and a reader has no way to tell which was meant.

### coverage-relative

Assess coverage relative to the changes made, not absolute project coverage

### actionable-recommendations

Every finding must include a concrete improvement suggestion

### findings-constraint

Every finding names a file within the authored surface `{changed_files}`. Findings on files in `{changed_files}` form the PR's findings; findings on other files form a separate "pre-existing" grouping.
