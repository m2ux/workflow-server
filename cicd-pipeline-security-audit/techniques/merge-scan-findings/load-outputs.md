---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 1
  legacy_id: 1
---

## Capability

Load every scanner output and extract its findings array.

## Protocol

### 1. Load All Outputs

- Load each of the `{scanner_outputs}` JSON files and extract its findings array
