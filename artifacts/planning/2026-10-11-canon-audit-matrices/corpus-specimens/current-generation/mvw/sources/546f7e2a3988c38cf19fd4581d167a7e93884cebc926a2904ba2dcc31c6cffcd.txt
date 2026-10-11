---
metadata:
  version: 1.4.0
---

## Capability

Compile a failure report of the unresolved critical issues, the correction history, and the manual resolution each issue needs.

## Inputs

### validation_report

Categorized validation findings carrying the critical or unresolved issues.

### validation_report_path

Absolute path to the written validation report for the pass that stopped refinement.

## Outputs

### failure_report

Failure report carrying the unresolved issue IDs, correction history, and manual-resolution guidance.

#### artifact

`failure-report.md`

#### audience

`human`

### failure_report_path

Absolute path to the written failure report.

## Protocol

### 1. Summarize Failure

- Record the verdict, the number of correction passes attempted (`{correction_iteration}`), and a link to `{validation_report}` at `{validation_report_path}`.

### 2. Provide Resolution Guidance

- State, for each unresolved issue ID in `{validation_report}`, the manual resolution required.

### 3. Write Failure Report

- Write `{failure_report}` to `{planning_folder_path}` per [failure-report](../resources/failure-report.md#template) and its [Rules](../resources/failure-report.md#rules), filling the template's path slot from `{validation_report_path}`; capture its written location as `{failure_report_path}`.

## Rules

### promotion-withheld-on-failure

A failed run stages no specification for promotion.
