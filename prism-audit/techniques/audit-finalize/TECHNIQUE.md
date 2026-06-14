---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 0
  legacy_id: 0
---

## Capability

Post-process the prism analysis outputs into the three security-audit deliverables — a summary report, a detailed-findings document, and a design trade-off analysis — and cross-validate them. The operations in this set decompose that into the artifact-location, graph-enrichment, report-splitting, detailed-findings, trade-off, formatting, and verification phases.

## Inputs

### completed_analyses

Array of completed prism analysis references with output paths and status

### all_analysis_artifact_paths

Accumulated paths to all analysis artifacts across triggered prism runs

### source_report

The prism-produced report consolidating findings, named `REPORT.md`

## Outputs

### audit_report_path

File path to the summary report, named `AUDIT-REPORT.md`

### detailed_findings_path

File path to the detailed-findings document, named `DETAILED-FINDINGS.md`

### trade_offs_path

File path to the design trade-off analysis, named `DESIGN-TRADE-OFFS.md`
