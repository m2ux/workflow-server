---
metadata:
  version: 1.2.0
---

## Capability

Transform prism's report(s) into a summary-focused audit report: retain every section except the inline detailed findings, replace those with a reference line to the detailed-findings document, renumber the subsequent sections to fill the gap, and repair internal cross-references to the old section numbers.

## Outputs

### audit_report_path

Filesystem path to the written AUDIT-REPORT.md (the summary report).

#### artifact

`AUDIT-REPORT.md`

#### audience

`human`

## Protocol

### 1. Split Report

- Locate the source report(s) from the `report_path` in `{completed_analyses}`. For a single-scope audit, that one REPORT.md is the source; for a multi-scope audit, merge the per-scope REPORT.md summaries (executive summaries, domain tables, systemic patterns) into one.
- Write the summary report to `{audit_report_path}` per [audit-report](../../resources/audit-report.md#template) and its [Rules](../../resources/audit-report.md#rules), which own the reference line that replaces the lifted section and the renumbering it forces.
