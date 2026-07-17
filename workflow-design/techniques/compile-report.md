---
metadata:
  version: 1.3.0
---

## Capability

Assemble findings from every review-mode audit pass into a rolled-up compliance report: severity-rated finding tables, with detail left in satellite finding files.

## Inputs

### principle_findings_path

*(optional)* Absolute path to the persisted principle-findings satellite file, when the principles audit ran; linked from the rolled-up report for detail.

### anti_pattern_findings_path

*(optional)* Absolute path to the persisted anti-pattern-findings satellite file, when the anti-pattern audit ran; linked from the rolled-up report for detail.

## Outputs

### compliance_report

Rolled-up compliance report body following the [Compliance Report Template](../resources/compliance-report.md#template): severity counts, finding tables, and recommended fixes. Principle and anti-pattern detail stays in satellite finding files linked from the report.

### review_findings_count

Total number of compliance findings across all review-mode audit passes.

## Protocol

### 1. Compile Report

- Compile findings into `{compliance_report}` following the [Compliance Report Template](../resources/compliance-report.md#template) exactly — do not restate or invent section titles here
- Use severity finding tables and link satellite finding files for detail, including `{principle_findings_path}` and `{anti_pattern_findings_path}` when set; do not embed full principle or anti-pattern prose dumps in the rolled-up report
- Set `{review_findings_count}` to the total finding count across all passes
