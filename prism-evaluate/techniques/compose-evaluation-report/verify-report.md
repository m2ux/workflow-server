---
metadata:
  version: 1.1.0
---

## Capability

Verify the composed report's finding-ID uniqueness, severity-count consistency between summary and detail, and the absence of any analytical-methodology metadata, then report the written artifact's path, size, and format-validation status.

## Protocol

- Verify every finding ID is unique and follows the dimension-prefix convention.
- Verify the severity counts in `{evaluation_report.executive_summary}` match the per-dimension detail.
- Verify `{evaluation_report}` contains no methodology metadata — no lens names, passes, pipeline modes, or analytical-process descriptions.
- Report the written artifact's path (`{evaluation_report_path}`), size, and format-validation status.
