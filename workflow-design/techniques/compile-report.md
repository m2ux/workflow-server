---
metadata:
  version: 1.1.0
---

## Capability

Assemble the findings from every review-mode audit pass into a structured compliance report and present it to the user with severity-rated findings and recommended fixes.

## Outputs

### review_findings_count

Total number of compliance findings across all review-mode audit passes. Interpolated into the review-disposition and post-update-disposition checkpoint messages.

## Protocol

### 1. Compile Report

- Compile findings into a structured report following the [Compliance Report Structure](../resources/review-mode-guide.md#compliance-report-structure) template exactly — do not restate or invent section titles here
- Set `{review_findings_count}` to the total finding count across all passes

### 2. Present Report

- Present the compliance report to the user with severity-rated findings and recommended fixes
