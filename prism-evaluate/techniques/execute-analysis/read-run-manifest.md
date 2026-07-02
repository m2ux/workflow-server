---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 1
  legacy_id: 1
---

## Capability

Read the triggered prism run's RUN-MANIFEST.md and record the run into the evaluation's accumulators — its report, definitive findings, artifact paths, and prism-reported completion status — without re-scanning the output directory. The group's `output_subdir` (from the inherited `{current_group}`) locates the run's `RUN-MANIFEST.md`.

## Protocol

### 1. Read Run Manifest

- Read `RUN-MANIFEST.md` from the group's output location (its `output_subdir` under the evaluation output directory).
- From the manifest, take the run's `report_path`, `definitive_findings_path`, listed artifact paths, and its `status` (`complete` / `partial` / `error`) — prism has already verified completion, so no directory re-scan or per-artifact existence check is needed here.
- Append the run's reference — `report_path`, `definitive_findings_path`, and the manifest `status` — to `{completed_analyses}`, and append the manifest's artifact paths to `{all_artifact_paths}`.
  > When the manifest reports `partial` or `error`, carry that status through on the run's `{completed_analyses}` entry so consolidation surfaces the incomplete run rather than silently dropping a dimension.

## Outputs

### completed_analyses

Array of completed prism run references, each with its report path, definitive-findings path, and prism-reported completion status.

### all_artifact_paths

Accumulated paths to all analysis artifacts across triggered prism runs, taken from each run's manifest.
