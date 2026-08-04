---
metadata:
  version: 1.3.0
---

## Capability

Write a run manifest that records the artifacts this prism run produced and whether it completed, so a triggering workflow can locate the results and confirm completion by reading one file — never by re-scanning the output directory or re-deriving artifact paths.

## Inputs

### report_path

Filesystem path to the run's REPORT.md.

### definitive_findings_path

Filesystem path to the run's DEFINITIVE-FINDINGS.md.

### all_artifact_paths

Array of every artifact path produced across the run's analysis units.

### analysis_units

The ordered analysis units for this run — each carries its `pipeline_mode` and (when present) its `unit_output_subdir`.

### pipeline_mode

The run's pipeline mode, recorded so a caller knows which artifacts to expect.

## Outputs

### run_manifest

Machine-readable manifest of the run's artifacts and completion status.

#### artifact

`RUN-MANIFEST.md`

### run_manifest_path

Full filesystem path to `RUN-MANIFEST.md`.

### run_status

Completion status of the run.

#### complete

Report, definitive findings, and every unit's expected artifacts are present.

#### partial

Reports exist but one or more units are missing expected artifacts.

#### error

REPORT.md or DEFINITIVE-FINDINGS.md is missing or empty.

## Protocol

### 1. Verify Completion

- Confirm REPORT.md at `{report_path}` and DEFINITIVE-FINDINGS.md at `{definitive_findings_path}` exist and are non-empty.
- For each unit in `{analysis_units}`, confirm the artifacts its `pipeline_mode` is expected to produce are present in its output subdirectory (full-prism: structural + adversarial + synthesis; portfolio: per-lens documents; behavioral: the behavioral artifacts + synthesis; single: the structural artifact).
- Set `{run_status}`: `complete` when the report, the definitive findings, and every unit's expected artifacts are present; `partial` when the reports exist but one or more units are missing expected artifacts; `error` when REPORT.md or DEFINITIVE-FINDINGS.md is missing or empty.

### 2. Write Manifest

- Write `{run_manifest}` as `RUN-MANIFEST.md` into `{output_path}` per [run-manifest](../resources/run-manifest.md#template) and its [Rules](../resources/run-manifest.md#rules), capturing its full filesystem path as `{run_manifest_path}`
- Fill it from `{run_status}`, `{pipeline_mode}`, `{report_path}`, `{definitive_findings_path}`, the per-unit expectations in `{analysis_units}`, and every path in `{all_artifact_paths}`

## Rules

### manifest-authoritative

The manifest is the contract a triggering workflow reads to locate results and confirm completion. Consumers rely on it exclusively — a consumer that re-scans the output directory or re-derives artifact paths is duplicating what the manifest already records.

### completion-honest

`run_status` reflects the actual filesystem state after the run. A missing or empty artifact is reported as `partial` or `error`, never masked as success — the caller decides how to handle an incomplete run.
