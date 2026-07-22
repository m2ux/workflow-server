---
metadata:
  version: 1.1.0
---

## Capability

Applied-fix record for selected audit findings with post-edit schema-validation results.

## Inputs

### selected_findings

The audit findings selected for repair — each naming the file, the construct, and the corrective action.

## Outputs

### fixes_applied

Per-finding record of the file edited and the change made, with the post-edit schema-validation result for each affected file.

## Protocol

### 1. Record Fixes Applied

- Record `{fixes_applied}`: the file edited, the change made, and the post-edit validation result per finding in `{selected_findings}`

## Rules

### no-collateral-removal

Record only the change a finding calls for. Never treat removal or rewrite of content a finding does not name as part of the fix — a fix is the smallest edit that resolves the flagged issue. Content not named by a finding is preserved; record any collateral removal in `{fixes_applied}` so it is visible in the durable fix record.
