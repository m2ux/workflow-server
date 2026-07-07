---
metadata:
  version: 1.0.0
---

## Capability

Identify referenced scripts for later P7 scanning and assemble the per-workflow classification summary — the classified files, triggers, permissions, and checkout patterns — into the workflow inventory.

## Protocol

### 1. Identify Scripts And Build Summary

- Find all `run:` blocks and referenced script files for later P7 scanning, and assemble the classified files, triggers, permissions, and checkout patterns into `{workflow_inventory}`.
