---
metadata:
  version: 1.1.0
---

## Capability

Confirm every workflow file in scope was scanned by diffing the set of scanned files against the workflow inventory to identify any unscanned files.

## Inputs

### scanner_outputs

The per-submodule scanner [output files](../../resources/sub-agent-output-schema.md#schema), one per scanner agent.

### workflow_inventory

Complete [inventory of workflow files](../../resources/intermediate-artifact-schemas.md#workflow-inventory) with classification data.

## Protocol

### 1. Verify File Coverage

- Build set of all scanned files across all `{scanner_outputs}`
- Diff against the `{workflow_inventory}` — identify unscanned files
