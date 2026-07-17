---
metadata:
  version: 2.1.1
---

## Capability

Persist a workflow audit report into the planning folder as a numbered artifact via the shared [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) operation, so the report sorts with the session's other artifacts and a re-run updates it in place rather than minting a duplicate.

## Inputs

### operation_type

The classified operation. Selects the report filename: a compliance report when `review`, a post-update review snapshot otherwise.

## Outputs

### report_path

Path to the written report file

#### artifact

`compliance-review.md` (when `{operation_type}` is `review`) / `post-update-review.md` (otherwise)

## Protocol

### 1. Choose Report Filename

- Choose the bare filename for `{operation_type}`: `compliance-review.md` when `review`, `post-update-review.md` otherwise

### 2. Persist Report Artifact

- Persist the report content via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) with *target_dir* `{planning_folder_path}` and the chosen bare filename; the server find-or-creates the numbered instance. Capture the written location as `{report_path}`
