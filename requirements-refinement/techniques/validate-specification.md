---
metadata:
  version: 1.5.0
---

## Capability

Validate the updated specification against structural, identifier-uniqueness, consistency, source-coverage, and protocol-conformance checks, categorize each issue as critical or correctable, and derive the routing verdict — whether validation passed, whether source coverage is complete, and whether critical or correctable issues remain.

## Inputs

### working_specification

The updated specification document to validate.

### requirements_analysis

The structured analysis whose source-coverage matrix is the completeness reference for validation.

## Outputs

### validation_report

Categorized validation findings with an overall verdict and the source-coverage result.

#### artifact

`validation-report-{correction_iteration}.md`

#### audience

`human`

### validation_report_path

Absolute path to the written validation report for this pass.

### source_coverage_complete

Coverage verdict for the source document — `true` when no normative statement remains unmapped, `false` while any gap stands.

### has_critical_issues

Presence of a blocking defect — one that no correction pass resolves and that requires manual intervention.

### has_correctable_issues

Presence of a defect another correction pass resolves, with no blocking defect alongside it.

### validation_passed

Overall verdict — `true` when the specification is conformant and covers the source in full, so it is ready to finalize.

## Protocol

### 1. Run Conformance Checks

- Validate `{working_specification}` against the checks in [validation-rubric](../resources/validation-rubric.md): section structure, requirement-identifier uniqueness, source-reference accuracy, markdown syntax, and cross-section consistency.

### 2. Check Source Coverage

- Using `{requirements_analysis.source_coverage_matrix}`, confirm every normative source statement maps to a requirement present in `{working_specification}`, and record any uncovered statement per [validation-rubric](../resources/validation-rubric.md#source-coverage).

### 3. Categorize Issues

- Assign each issue a severity and type per [validation-rubric](../resources/validation-rubric.md#issue-categorization), treating critical or irreconcilable issues as blocking and the remainder — including coverage gaps — as correctable.

### 4. Compile Verdict

- Write `{validation_report}` to `{planning_folder_path}` per [validation-report](../resources/validation-report.md#template) and its [Rules](../resources/validation-report.md#rules); capture its written location as `{validation_report_path}`.
- Emit `{source_coverage_complete}`, `{has_critical_issues}`, `{has_correctable_issues}` and `{validation_passed}` from the categorized issues, each as its declared contract defines it.
