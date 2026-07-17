---
metadata:
  version: 2.0.0
---

## Capability

Persist a workflow audit report into the planning folder as a numbered artifact via the shared [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) operation, so the report sorts with the session's other artifacts and a re-run updates it in place rather than minting a duplicate.

## Inputs

### is_review_mode

Whether review mode is active. Selects the report filename: a compliance report in review mode, a post-update review snapshot otherwise.

## Outputs

### report_path

Path to the written report file

#### artifact

`compliance-review.md` (compliance review mode) / `post-update-review.md` (post-update review mode)

## Protocol

### 1. Choose Report Filename

- Choose the bare filename for the mode: `compliance-review.md` for a compliance report, `post-update-review.md` for a post-update review snapshot

### 2. Persist Report Artifact

- Persist the report content via [write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md) with `target_dir` `{planning_folder_path}` and the chosen bare filename; the server prepends the activity `artifactPrefix` and find-or-creates the instance. Capture the written location as `{report_path}`
