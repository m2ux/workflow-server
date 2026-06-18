---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 6
  legacy_id: 6
---

## Capability

Apply the audit's formatting rules to the summary report: rewrite finding-ID hyperlinks to the detailed-findings anchors, convert full-details lines to hyperlinks, ensure remediation tables carry an Impact column, hyperlink artifact-reference paths, add the Design Trade-Offs metadata row, and confirm no old-style links remain.

## Protocol

### 1. Apply Formatting Rules

- Update all finding-ID hyperlinks in `{audit_report_path}` to point to the detailed-findings document's per-finding anchors.
- Convert 'Full details' lines to hyperlinks.
- Ensure every priority remediation table (P0, P1, P2, P3) includes an Impact column as its final column.
- Hyperlink all paths in artifact-reference tables.
- Add a Design Trade-Offs row to the introductory metadata table.
- Verify zero old-style links remain.
