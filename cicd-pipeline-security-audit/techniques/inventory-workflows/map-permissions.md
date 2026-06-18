---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 4
  legacy_id: 4
---

## Capability

Map permission scopes per workflow at workflow, job, and step levels, flagging workflows with write scopes or no explicit permissions.

## Protocol

### 1. Map Permissions

- Extract the top-level `permissions:` block (workflow-level defaults) and per-job overrides, flagging workflows with write scopes or no explicit permissions.
