---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 4
  legacy_id: 4
---

## Capability

Map every scanner finding to its merged finding and confirm zero unaccounted findings for every scanner.

## Inputs

### duplicate_mappings

Mapping of each duplicate scanner finding to the retained finding it was merged into.

## Protocol

### 1. Reconcile

- Build reconciliation table from `{duplicate_mappings}`, mapping every original scanner finding to its merged finding number
- Verify Unaccounted equals zero for every scanner
- Every scanner finding must map to a merged finding or be marked duplicate
