---
metadata:
  version: 1.2.4
---

## Capability

Assemble findings from every review-mode audit pass into a rolled-up compliance report: severity-rated finding tables, with detail left in satellite finding files.

## Outputs

### compliance_report

Rolled-up compliance report body following the [Compliance Report Template](../resources/compliance-report.md#template): severity counts, finding tables, and recommended fixes. Principle and anti-pattern detail stays in satellite finding files linked from the report.

### review_findings_count

Total number of compliance findings across all review-mode audit passes.

## Protocol

### 1. Compile Report

- Compile findings into `{compliance_report}` following the [Compliance Report Template](../resources/compliance-report.md#template) exactly — do not restate or invent section titles here
- Use severity finding tables and link satellite finding files for detail; do not embed full principle or anti-pattern prose dumps in the rolled-up report
- Set `{review_findings_count}` to the total finding count across all passes
