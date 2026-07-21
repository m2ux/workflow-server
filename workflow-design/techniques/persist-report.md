---
metadata:
  version: 2.2.0
---

## Capability

Persist a workflow audit report into the planning folder as a numbered artifact via the shared [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) operation, so the report sorts with the planning folder's other artifacts and a re-run updates it in place rather than minting a duplicate.

## Inputs

### operation_type

The classified operation. Selects the report filename: a compliance report when `review`, a post-update review snapshot otherwise.

### report_content

The markdown report body to write — the compiled compliance report (`{compliance_report}`) in review mode, or the post-update findings summary (`{findings_summary}`) otherwise.

## Outputs

### report_path

Path to the written report file

#### artifact

`compliance-review.md` (when `{operation_type}` is `review`) / `post-update-review.md` (otherwise)

## Protocol

### 1. Choose Report Filename

- Choose the bare filename for `{operation_type}`: `compliance-review.md` when `review`, `post-update-review.md` otherwise

### 2. Persist Report Artifact

- Persist `{report_content}` via the calling activity's bound `manage-artifacts::write-artifact` step with *target_dir* `{planning_folder_path}` and the chosen bare filename, following the [Compliance Report Guide](../resources/compliance-report.md#template); the server find-or-creates the numbered instance. Capture the written location as `{report_path}`
