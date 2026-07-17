---
metadata:
  version: 1.1.1
---

## Capability

Compile a severity-rated summary of post-update audit findings — a clean pass when there are none, per-finding file/location/severity/fix when there are — including pass/fail counts by severity and any new findings introduced by the update.

## Outputs

### findings_summary

The severity-rated post-update summary: a clean pass when there are no findings; otherwise per-finding file, location, severity, and fix, plus pass/fail counts by severity and any new findings introduced by the update.

### review_findings_count

Total number of findings in the post-update summary.

## Protocol

### 1. Compile Summary

- When no findings exist, compile a clean pass into `{findings_summary}`; otherwise compile per finding: file, location, severity, and fix
- Do not repeat the full compliance report structure unless findings exist
- Set `{review_findings_count}` to the finding total
