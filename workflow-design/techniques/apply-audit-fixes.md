---
metadata:
  version: 1.0.0
---

## Capability

Apply the selected audit findings, editing the affected YAML files in place via [yaml-authoring](./yaml-authoring.md) and re-validating each changed file with [audit-schema-validation](./audit-schema-validation.md).

## Inputs

### selected_findings

The audit findings selected for repair — each naming the file, the construct, and the corrective action.

## Outputs

### fixes_applied

Per-finding record of the file edited and the change made, with the post-edit schema-validation result for each affected file.

## Protocol

### 1. Edit Findings

- For each finding in `{selected_findings}`, edit the affected file from `{scope_manifest}` via [yaml-authoring](./yaml-authoring.md), making the smallest change that resolves the finding without touching unrelated content

### 2. Re-Validate Changed Files

- Re-validate every changed file with [audit-schema-validation](./audit-schema-validation.md); resolve any new schema failure

### 3. Record Fixes Applied

- Record `{fixes_applied}`: the file edited, the change made, and the post-edit validation result per finding

## Rules

### no-collateral-removal

Apply only the change a finding calls for. Never remove or rewrite content a finding does not name — a fix is the smallest edit that resolves the flagged issue. Content not named by a finding is preserved; record any collateral removal in `{fixes_applied}` so it is visible in the durable fix record.
