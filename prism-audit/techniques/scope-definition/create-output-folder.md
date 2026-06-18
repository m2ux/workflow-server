---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 4
  legacy_id: 4
---

## Capability

Create the audit output directory, materialising `{output_path}` when it does not already exist so subsequent activities can write artifacts into it.

## Protocol

### 1. Create Output Folder

- Run `mkdir -p {output_path}` to create the output directory when it does not already exist.
- Verify the directory exists and is writable before proceeding.
