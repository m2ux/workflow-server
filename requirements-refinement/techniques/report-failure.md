---
metadata:
  version: 1.0.0
---

## Capability

Compile a failure report describing the unresolved critical issues, the correction history, and the manual resolution required when refinement cannot complete automatically.

## Inputs

### validation_report

Categorized validation findings carrying the critical or unresolved issues.

## Outputs

### failure_report

Failure report carrying the critical issues, correction history, and manual-resolution guidance.

#### artifact

`failure-report.md`

## Protocol

### 1. Summarize Failure

- Record the verdict, the number of correction passes attempted (`{correction_iteration}` of `{max_correction_iterations}`), and every critical or irreconcilable issue drawn from `{validation_report}`.

### 2. Provide Resolution Guidance

- State, for each critical issue, the manual resolution a requirements engineer should perform.

### 3. Write Failure Report

- Write `{failure_report}` to `{planning_folder_path}`.

### 4. Present Failure Report

- Present `{failure_report}` and the manual intervention it requires to the user.

## Rules

### promotion-withheld-on-failure

A specification is promoted only after passing validation; a failed run stages no specification for promotion.
