---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 5
  legacy_id: 5
---

## Capability

Write the unified finding set, reconciliation table, and observation list to the planning folder.

## Outputs

### merge_complete

true when the reconciliation shows zero unaccounted findings.

## Protocol

### 1. Write Output

- Produce `{merged_findings}` and `{finding_reconciliation}` into `{planning_folder_path}`.
- Set `{merge_complete}` to true when the reconciliation shows zero unaccounted findings.
