---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 1
  legacy_id: 1
---

## Capability

Collect the outputs of a completed prism run — the report path, the analysis artifact paths, and the analysis units with their locations — and append them to the audit's running accumulators.

## Protocol

### 1. Collect Prism Results

- From the completed prism run for `{current_scope}`, capture the report path (`REPORT.md`).
- Capture all analysis artifact paths the run produced: `structural-analysis.md`, `adversarial-analysis.md`, `synthesis.md`, `portfolio-*.md`, `behavioral-synthesis.md`, and any others present for the run's `{pipeline_mode}`.
- Capture the analysis units and their artifact locations.
- Append the run's reference and artifact paths to `{completed_analyses}` and `{all_analysis_artifact_paths}`.

## Outputs

### completed_analyses

Array of completed prism analysis references, each with its report path, output paths, and status

### all_analysis_artifact_paths

Accumulated paths to all analysis artifacts across triggered prism runs
