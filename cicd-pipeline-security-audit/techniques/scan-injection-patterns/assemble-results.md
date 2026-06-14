---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 9
  legacy_id: 9
---

## Capability

Collect every flagged item, observation, and per-file/per-pattern scan confirmation into the structured scanner output artifact for this submodule, and write it to the planning folder.

## Protocol

### 1. Assemble Results

- Collect every flagged item, observation, and per-file/per-pattern scan confirmation into `{scan_results}`, emitting the structured artifact for this submodule into `{planning_folder_path}`.
