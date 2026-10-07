---
metadata:
  version: 1.1.0
---

## Capability

Identify referenced scripts for later P7 scanning and assemble the per-workflow classification summary — the classified files, triggers, permissions, and checkout patterns — into the workflow inventory.

## Outputs

### workflow_inventory

Complete [inventory of workflow files](../../resources/intermediate-artifact-schemas.md#workflow-inventory) with classification data.

#### artifact

`reconnaissance-summary.json`

#### audience

`agent`

#### workflow_files

All workflow file paths with metadata.

#### trigger_classification

Per-workflow trigger types.

#### permission_map

Per-workflow permission scopes.

#### checkout_patterns

Per-workflow checkout configurations.

## Protocol

### 1. Identify Scripts And Build Summary

- Find all `run:` blocks and referenced script files for later P7 scanning, and assemble the classified files, triggers, permissions, and checkout patterns into `{workflow_inventory}`.
