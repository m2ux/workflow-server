---
metadata:
  version: 1.2.0
---

## Capability

Scope-discipline audit of the committed change set against the confirmed scope manifest.

## Inputs

### manifest_entries

The confirmed file manifest for this run — one entry per file to create, modify or remove, each with its path, its action and a one-line statement of the change.

### target_path

Absolute filesystem path of the dedicated workflows edit-root worktree for this session — where create/update edits land.

### workflow_branch

Feature branch the edit-root worktree has checked out.

## Outputs

### scope_drift_findings

Severity-rated drift findings: each names a file changed outside the manifest (an unplanned change) or a manifest item with no corresponding change (unaddressed scope), with a recommended disposition. An empty result is a clean pass.

## Protocol

### 1. List Changed Files

- List the files actually changed for `{target_workflow_id}` under `{target_path}` (the committed diff on `{workflow_branch}`)

### 2. Compare Against Manifest

- Compare that set against `{manifest_entries}`: flag each file changed outside the manifest as an unplanned change, and each manifest item with no corresponding change as unaddressed scope

### 3. Compose Drift Findings

- Compose `{scope_drift_findings}` with a severity and a recommended disposition per drift item
