---
metadata:
  version: 2.0.0
---

## Capability

Links the summary report to the detailed findings, which can only be done once both documents exist.

## Protocol

### 1. Point Every Finding at Its Write-Up

- Rewrite each finding-ID reference in `{audit_report_path}` as a hyperlink to that finding's anchor in `{detailed_findings_path}`, and convert each "Full details" line to the same.

### 2. Confirm None Was Missed

- Verify no reference to a finding remains in the report's pre-split form.
