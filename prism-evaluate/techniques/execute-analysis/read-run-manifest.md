---
metadata:
  version: 2.0.0
---

## Capability

Records a completed prism run into the evaluation's accumulators from the run's own manifest — its report, its definitive findings, its artifacts, and the status it reported.

## Outputs

### completed_analyses

Completed prism run references, each with its report path, definitive-findings path, and reported completion status.

### all_artifact_paths

Every analysis artifact path the triggered runs produced, taken from their manifests.

## Protocol

### 1. Read the Manifest

- Read `RUN-MANIFEST.json` from the group's output location, and take the run's `report_path`, `definitive_findings_path`, listed artifact paths, and `status` (`complete` / `partial` / `error`).

### 2. Accumulate the Run

- Append the run's reference to `{completed_analyses}` and its artifact paths to `{all_artifact_paths}`.  
  > A `partial` or `error` status travels on the run's `{completed_analyses}` entry, so consolidation surfaces the incomplete run rather than dropping the dimension.
