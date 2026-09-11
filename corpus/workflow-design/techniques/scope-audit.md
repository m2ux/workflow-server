---
metadata:
  version: 1.1.0
---

## Capability

Scope-discipline audit of the committed change set against the confirmed scope manifest.

## Outputs

### scope_drift_findings

Severity-rated drift findings: each names a file changed outside the manifest (an unplanned change) or a manifest item with no corresponding change (unaddressed scope), with a recommended disposition. An empty result is a clean pass.

## Protocol

### 1. List Changed Files

- List the files actually changed for `{target_workflow_id}` under `{target_path}` (the committed diff on `{workflow_branch}`)

### 2. Compare Against Manifest

- Compare that set against `{scope_manifest}`: flag each file changed outside the manifest as an unplanned change, and each manifest item with no corresponding change as unaddressed scope

### 3. Compose Drift Findings

- Compose `{scope_drift_findings}` with a severity and a recommended disposition per drift item
