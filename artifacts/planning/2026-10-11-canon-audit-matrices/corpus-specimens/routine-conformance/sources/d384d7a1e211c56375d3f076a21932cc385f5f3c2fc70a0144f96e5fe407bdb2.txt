---
metadata:
  version: 1.0.0
---

## Capability

Confirm every workflow file in scope was scanned by diffing the set of scanned files against the workflow inventory to identify any unscanned files.

## Protocol

### 1. Verify File Coverage

- Build set of all scanned files across all `{scanner_outputs}`
- Diff against the `{workflow_inventory}` — identify unscanned files
