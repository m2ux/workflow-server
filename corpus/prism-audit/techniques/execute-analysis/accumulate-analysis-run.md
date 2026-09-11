---
metadata:
  version: 1.0.0
---

## Capability

One completed analysis run recorded into the audit's accumulators, so finalization consolidates every scope from a single place.

## Inputs

### run_status

The run's verdict on its own completeness.

### report_path

Filesystem path to the run's report.

### definitive_findings_path

Filesystem path to the run's definitive findings.

### artifact_paths

Every artifact path the run produced.

## Outputs

### completed_analyses

Array of completed prism analysis references, each with its report path, definitive-findings path, and reported completion status.

### all_analysis_artifact_paths

Accumulated paths to all analysis artifacts across triggered prism runs.

## Protocol

### 1. Append the Run

- Append the run's reference — `{report_path}`, `{definitive_findings_path}` and `{run_status}` — to `{completed_analyses}`, and every entry of `{artifact_paths}` to `{all_analysis_artifact_paths}`.
  > A `partial` or `error` `{run_status}` travels on the run's `{completed_analyses}` entry, so finalization surfaces the incomplete run rather than consolidating a gap.
