---
metadata:
  version: 1.0.0
---

## Capability

Audit the committed change set for scope discipline: compare the files actually changed for the workflow against the confirmed `{scope_manifest}`, flagging drift — files changed outside the manifest, and manifest items left unaddressed.

## Outputs

### scope_drift_findings

Severity-rated drift findings: each names a file changed outside the manifest (an unplanned change) or a manifest item with no corresponding change (unaddressed scope), with a recommended disposition. An empty result is a clean pass.

## Protocol

### 1. Audit Scope Discipline

- List the files actually changed for `{target_workflow_id}` in the workflows worktree (the committed diff)
- Compare that set against `{scope_manifest}`: flag each file changed outside the manifest as an unplanned change, and each manifest item with no corresponding change as unaddressed scope
- Compose `{scope_drift_findings}` with a severity and a recommended disposition per drift item
