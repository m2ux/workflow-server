---
metadata:
  version: 1.1.0
---

## Capability

Collect every flagged item, observation, and per-file/per-pattern scan confirmation into the structured scanner output artifact for this submodule, and write it to the planning folder.

## Inputs

### scanner_assignment

This scanner's [roster entry](../../resources/intermediate-artifact-schemas.md#scanner-assignments): its designator at `id`, the submodule directory at `submodule`, the workflow file paths it scans at `workflow_files`, and the submodule's AI configuration files at `ai_config_files`.

## Protocol

### 1. Assemble Results

- Collect every flagged item, observation, and per-file/per-pattern scan confirmation into `{scan_results}`, and write that artifact into `{planning_folder_path}` under the name `{scanner_assignment.id}` and `{scanner_assignment.submodule}` give it.
