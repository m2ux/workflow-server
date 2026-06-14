---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 3
  legacy_id: 3
---

## Capability

Transform the prism report into a summary-focused report: retain every section except the inline detailed findings, replace those with a reference line to the detailed-findings document, renumber the subsequent sections to fill the gap, and repair internal cross-references to the old section numbers.

## Protocol

### 1. Split Report

- Read `{source_report}`.
- Write the summary report to `{audit_report_path}` containing everything except the inline detailed findings section.
- Replace that section with a reference line: `*Detailed write-ups for all findings organised by severity are in [DETAILED-FINDINGS.md](DETAILED-FINDINGS.md).*`
- Renumber subsequent sections to fill the section-number gap.
- Fix internal cross-references that point to the old section numbers.
