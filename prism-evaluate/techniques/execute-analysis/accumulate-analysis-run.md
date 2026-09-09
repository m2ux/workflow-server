---
metadata:
  version: 1.0.0
---

## Capability

One completed analysis run recorded into the evaluation's accumulators, so consolidation reads every dimension from a single place.

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

Completed prism run references, each with its report path, definitive-findings path, and reported completion status.

### all_artifact_paths

Every analysis artifact path the triggered runs produced.

## Protocol

### 1. Append the Run

- Append the run's reference — `{report_path}`, `{definitive_findings_path}` and `{run_status}` — to `{completed_analyses}`, and every entry of `{artifact_paths}` to `{all_artifact_paths}`.
  > A `partial` or `error` `{run_status}` travels on the run's `{completed_analyses}` entry, so consolidation surfaces the incomplete run rather than dropping the dimension.
