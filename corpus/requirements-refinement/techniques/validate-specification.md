---
metadata:
  version: 1.8.1
---

## Capability

Judge whether the updated specification is conformant and covers every source, with each issue labeled critical or correctable.

## Inputs

### working_specification

The updated specification document.

### requirements_analysis

The structured analysis carrying the source-coverage matrix and, on each new or updated requirement, the source identifier and verbatim heading of each contributing passage.

## Outputs

### validation_report

Categorized validation findings with an overall verdict and the source-coverage result.

#### artifact

`validation-report-{correction_iteration}.md`

#### audience

`human`

### validation_report_path

Absolute path to the written validation report for this pass.

### has_critical_issues

Presence of a blocking defect — one that no correction pass resolves and that requires manual intervention.

### has_correctable_issues

Presence of a defect another correction pass resolves, with no blocking defect alongside it.

### validation_passed

Overall verdict — `true` when the specification is conformant and covers every source in full.

### update_pass_kind

`correction` when this pass's issues are correctable with no blocking defect.

## Protocol

### 1. Run Conformance Checks

- Validate `{working_specification}` against the checks in [validation-rubric](../resources/validation-rubric.md#checks).

### 2. Check Source Coverage

- Record uncovered statements from `{requirements_analysis.source_coverage_matrix}` per [Source Coverage](../resources/validation-rubric.md#source-coverage).

### 3. Categorize Issues

- Assign each issue a severity and type per [Issue Categorization](../resources/validation-rubric.md#issue-categorization).

### 4. Compile Verdict

- Write `{validation_report}` to `{planning_folder_path}` per [validation-report](../resources/validation-report.md#template) and its [Rules](../resources/validation-report.md#rules); capture its written location as `{validation_report_path}`.
- Emit `{has_critical_issues}`, `{has_correctable_issues}`, `{validation_passed}`, and `{update_pass_kind}` from the categorized issues, each as its declared contract defines it. The source-coverage result is recorded in `{validation_report}` alongside them, per that output's contract.
