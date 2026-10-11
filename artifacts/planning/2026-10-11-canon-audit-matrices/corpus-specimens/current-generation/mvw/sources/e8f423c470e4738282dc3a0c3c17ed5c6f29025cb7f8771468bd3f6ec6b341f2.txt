---
metadata:
  version: 1.0.0
---

## Capability

A triggered run's completion verdict and the location of everything it produced, read from the run's own manifest.

## Outputs

### run_status

The run's verdict on its own completeness: `complete` when the report, the definitive findings and every unit's expected artifacts are present, `partial` when the reports exist and a unit is missing artifacts, `error` when either report is missing or empty.

### report_path

Filesystem path to the run's report.

### definitive_findings_path

Filesystem path to the run's definitive findings.

### artifact_paths

Every artifact path the run produced.

## Protocol

### 1. Read the Manifest

- Read `RUN-MANIFEST.json` from `{output_path}`, per [Template](../resources/run-manifest.md#template).
- Emit `{run_status}` from the manifest's `status`.

### 2. Resolve the Recorded Paths

- Join the manifest's `report_path`, `definitive_findings_path` and every entry of its `artifacts` to `{output_path}`, emitting `{report_path}`, `{definitive_findings_path}` and `{artifact_paths}` — the manifest records each one relative to the run's output location.
