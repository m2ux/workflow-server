---
metadata:
  version: 1.0.0
---

## Capability

Re-dispatch targeted scanners for each coverage gap the verification report identifies, narrowing each re-dispatch to the gap's unscanned files or skipped patterns.

## Protocol

### 1. Act On Gap Report

- For each gap in `{verification_report.gaps}`, re-dispatch the responsible scanner narrowed to the unscanned files or skipped patterns, and re-confirm coverage.  
  > If the verification report finds zero gaps, no re-dispatch is performed.
