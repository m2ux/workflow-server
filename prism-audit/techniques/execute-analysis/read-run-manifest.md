---
metadata:
  version: 1.0.0
---

## Capability

Read the triggered prism run's RUN-MANIFEST.md and record the run into the audit's accumulators — its report, definitive findings, artifact paths, and prism-reported completion status — without re-scanning the output directory. The scope's `output_subdir` (from the inherited `{current_scope}`) locates the run's `RUN-MANIFEST.md`.

## Outputs

### completed_analyses

Array of completed prism analysis references, each with its report path, definitive-findings path, and prism-reported completion status.

### all_analysis_artifact_paths

Accumulated paths to all analysis artifacts across triggered prism runs, taken from each run's manifest.

## Protocol

### 1. Read Run Manifest

- Read `RUN-MANIFEST.md` from the scope's output location (its `output_subdir` under the audit output directory).
- From the manifest, take the run's `report_path`, `definitive_findings_path`, listed artifact paths, and its `status` (`complete` / `partial` / `error`) — prism has already verified completion, so no directory re-scan or per-artifact existence check is needed here.
- Append the run's reference — `report_path`, `definitive_findings_path`, and the manifest `status` — to `{completed_analyses}`, and append the manifest's artifact paths to `{all_analysis_artifact_paths}`.
  > When the manifest reports `partial` or `error`, carry that status through on the run's `{completed_analyses}` entry so finalization surfaces the incomplete run rather than silently consolidating a gap.
