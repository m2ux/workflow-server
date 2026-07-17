---
metadata:
  version: 1.2.1
---

## Capability

Assemble the findings from every review-mode audit pass into a structured compliance report and present it with severity-rated findings and recommended fixes.

## Outputs

### compliance_report

The structured compliance report body following the [Compliance Report Template](../resources/compliance-report.md), with severity-rated findings and recommended fixes.

### review_findings_count

Total number of compliance findings across all review-mode audit passes.

## Protocol

### 1. Compile Report

- Compile findings into `{compliance_report}` following the [Compliance Report Template](../resources/compliance-report.md) exactly — do not restate or invent section titles here
- Set `{review_findings_count}` to the total finding count across all passes

### 2. Present Report

- Present `{compliance_report}` with severity-rated findings and recommended fixes
