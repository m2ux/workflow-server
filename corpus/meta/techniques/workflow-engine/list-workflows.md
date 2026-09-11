---
metadata:
  version: 1.0.0
---

## Capability

Retrieve the catalog of available workflows.

## Outputs

### workflow_catalog

Array of `{ id, title, description, tags }` entries

## Protocol

1. Call `list_workflows` and return its result as the `{workflow_catalog}`.
