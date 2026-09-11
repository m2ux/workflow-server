---
metadata:
  version: 2.0.0
---

## Capability

Compiles what the audit amounts to in figures, and an index of every artifact it produced.

## Inputs

### audit_report_path

File path to the summary report, named `AUDIT-REPORT.md`

### completed_analyses

Array of completed prism analysis references with output paths and status

### all_analysis_artifact_paths

Accumulated paths to all analysis artifacts across triggered prism runs

## Outputs

### audit_metrics

The audit in figures — findings by severity, the domains analysed, analysis runs triggered, artifacts produced — together with the summary report's core finding and its top-priority remediation items.

### deliverable_index

Every artifact the audit produced, each with its path: the summary report, the detailed findings, the trade-off analysis, the audit prompt, and the underlying analysis artifacts.

## Protocol

### 1. Read the Summary Report

- Read `{audit_report_path}` and take its executive summary: findings by severity, the scope summary, the core finding where one is stated, and the top-priority remediation items.

### 2. Compile the Figures

- Record `{audit_metrics}` from that summary, the domains analysed, and the run and artifact counts `{completed_analyses}` and `{all_analysis_artifact_paths}` carry.

### 3. Index the Deliverables

- Record `{deliverable_index}` from the three deliverable paths, the audit prompt path, and `{all_analysis_artifact_paths}`.
