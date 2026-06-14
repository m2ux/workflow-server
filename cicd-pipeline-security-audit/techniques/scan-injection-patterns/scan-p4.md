---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 5
  legacy_id: 5
---

## Capability

Apply P4 excessive permissions detection: flag workflows with `contents: write`, `pull-requests: write`, or no permissions block, and check whether the write scope is justified.

## Protocol

### 1. P4 Excessive Permissions

- Flag workflows with `contents: write`, `pull-requests: write`, or no permissions block
- Check whether write permissions are justified by the workflow's purpose
