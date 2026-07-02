---
metadata:
  version: 1.0.0
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

## Protocol

### 1. Verify Completion

- Confirm REPORT.md at `{report_path}` and DEFINITIVE-FINDINGS.md at `{definitive_findings_path}` exist and are non-empty.
- For each unit in `{analysis_units}`, confirm the artifacts its `pipeline_mode` is expected to produce are present in its output subdirectory (full-prism: structural + adversarial + synthesis; portfolio: per-lens documents; behavioral: the behavioral artifacts + synthesis; single: the structural artifact).
- Set `{run_status}`: `complete` when the report, the definitive findings, and every unit's expected artifacts are present; `partial` when the reports exist but one or more units are missing expected artifacts; `error` when REPORT.md or DEFINITIVE-FINDINGS.md is missing or empty.

### 2. Write Manifest

- Write `{run_manifest}` as `RUN-MANIFEST.md` into `{output_path}`, capturing its full filesystem path as `{run_manifest_path}`.
- Record: the `{run_status}`, the `{pipeline_mode}`, a link to `{report_path}` and to `{definitive_findings_path}`, a per-unit table (unit, output subdir, pipeline mode, status, artifact filenames), and a flat list of every path in `{all_artifact_paths}` as links.
- Structure:

  ```markdown
  # Prism Run Manifest

  - **Status:** {complete | partial | error}
  - **Pipeline mode:** {pipeline_mode}
  - **Report:** [REPORT.md]({report_path})
  - **Definitive findings:** [DEFINITIVE-FINDINGS.md]({definitive_findings_path})

  ## Units

  | Unit | Output subdir | Pipeline mode | Status | Artifacts |
  |------|---------------|---------------|--------|-----------|
  | {unit name} | {output subdir, or "."} | {unit pipeline mode} | {complete or partial} | {artifact filenames} |

  ## Artifacts

  - [{artifact filename}]({artifact path})
  ```

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

## Rules

### manifest-authoritative

The manifest is the contract a triggering workflow reads to locate results and confirm completion. Consumers rely on it exclusively — a consumer that re-scans the output directory or re-derives artifact paths is duplicating what the manifest already records.

### completion-honest

`run_status` reflects the actual filesystem state after the run. A missing or empty artifact is reported as `partial` or `error`, never masked as success — the caller decides how to handle an incomplete run.
