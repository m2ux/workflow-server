---
metadata:
  version: 1.1.1
---

## Capability

Severity-rated summary of post-update audit findings.

## Outputs

### findings_summary

The severity-rated post-update summary: a clean pass when there are no findings; otherwise per-finding file, location, severity, and fix, plus pass/fail counts by severity and any new findings introduced by the update.

### review_findings_count

Total number of findings in the post-update summary.

## Protocol

### 1. Compile Summary

- Compile `{findings_summary}` for the Executive Summary / Recommended Fixes of the [Compliance Report Guide](../resources/compliance-report.md#template) (post-update title) — clean pass when empty; otherwise severity rows plus per-finding file/location/fix
- Set `{review_findings_count}` to the finding total
