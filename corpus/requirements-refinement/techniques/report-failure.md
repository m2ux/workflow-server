---
metadata:
  version: 1.5.1
---

## Capability

Compile a failure report of the issues refinement leaves unresolved, the correction history, and the manual resolution each issue needs.

## Inputs

### spec_basename

Basename of the target specification.

### validation_report

Categorized validation findings carrying the unresolved issues.

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
  > The verdict is `critical` when `{validation_report}` carries a critical issue, and `correction limit reached` when only correctable issues remain.

### 2. Provide Resolution Guidance

- State, for each unresolved issue ID in `{validation_report}`, the manual resolution required.

### 3. Write Failure Report

- Write `{failure_report}` for `{spec_basename}` to `{planning_folder_path}` per [failure-report](../resources/failure-report.md#template) and its [Rules](../resources/failure-report.md#rules), filling the template's path slot with the path of `{validation_report_path}` per `artifact-paths-relative`; capture its written location as `{failure_report_path}`.

## Rules

### promotion-withheld-on-failure

A failed run stages no specification for promotion.
