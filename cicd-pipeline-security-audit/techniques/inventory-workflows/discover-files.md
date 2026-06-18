---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 2
  legacy_id: 2
---

## Capability

Enumerate and count the workflow files across the confirmed targets, recording each file's path, size, and last-modified date.

## Protocol

### 1. Discover Files

- For each resolved target, enumerate `.github/workflows/*.yml` and `.github/workflows/*.yaml` and record each file's path, size, and last-modified date.  
  > If a submodule has no `.github/workflows/` directory, record it as a zero-workflow submodule and skip it for scanner assignment.
