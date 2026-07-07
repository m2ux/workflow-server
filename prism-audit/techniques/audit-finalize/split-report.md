---
metadata:
  version: 1.0.0
---

## Capability

Transform prism's report(s) into a summary-focused audit report: retain every section except the inline detailed findings, replace those with a reference line to the detailed-findings document, renumber the subsequent sections to fill the gap, and repair internal cross-references to the old section numbers.

## Inputs

### completed_analyses

The triggered prism runs, each carrying its scope's `report_path` (the REPORT.md the run produced). The report source.

## Outputs

### audit_report_path

Filesystem path to the written AUDIT-REPORT.md (the summary report).

#### artifact

`AUDIT-REPORT.md`

## Protocol

### 1. Split Report

- Locate the source report(s) from the `report_path` in `{completed_analyses}`. For a single-scope audit, that one REPORT.md is the source; for a multi-scope audit, merge the per-scope REPORT.md summaries (executive summaries, domain tables, systemic patterns) into one.
- Write the summary report to `{audit_report_path}` containing everything except the inline detailed findings section.
- Replace that section with a reference line: `*Detailed write-ups for all findings organised by severity are in [DETAILED-FINDINGS.md](DETAILED-FINDINGS.md).*`
- Renumber subsequent sections to fill the section-number gap.
- Fix internal cross-references that point to the old section numbers.
