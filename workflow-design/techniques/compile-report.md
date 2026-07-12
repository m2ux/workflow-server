---
metadata:
  version: 1.0.0
---

## Capability

Assemble the findings from every audit pass into a structured compliance report and present it to the user with severity-rated findings and recommended fixes.

## Outputs

### review_findings_count

Total number of compliance findings across all review-mode audit passes. Interpolated into the review-disposition and post-update-disposition checkpoint messages.

## Protocol

### 1. Compile Report

- Compile findings into a structured report following the [report template](../resources/review-mode-guide.md#compliance-report-structure): Executive Summary (pass/fail counts by severity), Schema Expressiveness Findings, Convention Conformance Findings, Rule Enforcement Findings, Anti-Pattern Findings, Schema Validation Results, Tool-Technique-Doc Consistency Findings, Recommended Fixes

### 2. Present Report

- Present the compliance report to the user with severity-rated findings and recommended fixes
