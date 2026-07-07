---
metadata:
  version: 1.0.0
---

## Capability

Present the final audit deliverables to the user: extract the summary report's executive summary, compile delivery metrics, and present the audit summary, core finding, top-priority remediations, and a complete index of every produced artifact with its path.

## Inputs

### audit_report_path

File path to the summary report, named `AUDIT-REPORT.md`

### completed_analyses

Array of completed prism analysis references with output paths and status

### all_analysis_artifact_paths

Accumulated paths to all analysis artifacts across triggered prism runs

## Protocol

### 1. Extract Audit Summary

- Read the summary report at `{audit_report_path}`.
- Extract its executive summary: total findings by severity, scope summary, core finding (when present), and top-priority remediation items.

### 2. Compile Audit Metrics

- Compile finding counts by severity: Critical, High, Medium, Low, Informational.
- Enumerate the domains analysed.
- Tally the number of prism runs triggered and the total analysis artifacts produced, using `{completed_analyses}` and `{all_analysis_artifact_paths}`.

### 3. Present Audit Results

- Present the audit results to the user: the audit summary with finding counts, the core finding highlight (when applicable), and the top-priority remediation items.
- Include a document index listing every produced artifact with its path: the summary report, the detailed-findings document, the design trade-off analysis, the audit prompt, and all underlying analysis artifacts from `{all_analysis_artifact_paths}`.
