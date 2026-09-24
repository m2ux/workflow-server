---
metadata:
  version: 1.0.0
---

## Capability

One completed analysis run appended to the caller's accumulators. A partial or error run stays on the list.

## Inputs

### run_status

The run's verdict on its own completeness.

### report_path

Filesystem path to the run's report.

### definitive_findings_path

Filesystem path to the run's definitive findings.

### artifact_paths

Every artifact path the run produced.

### completed_analyses

The runs already recorded. Empty when this is the first run.

### all_analysis_artifact_paths

The artifact paths already recorded. Empty when this is the first run.

## Outputs

### completed_analyses

The prior runs plus this run's report path, definitive-findings path, and completion status.

### all_analysis_artifact_paths

The prior artifact paths plus every entry of `{artifact_paths}`.

## Protocol

### 1. Append the Run

- Append the run's reference — `{report_path}`, `{definitive_findings_path}` and `{run_status}` — to `{completed_analyses}`, and every entry of `{artifact_paths}` to `{all_analysis_artifact_paths}`.
  > A `partial` or `error` `{run_status}` stays on that `{completed_analyses}` entry. The caller sees the incomplete run.
