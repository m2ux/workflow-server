---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 3
---

## Capability

Analyze each subsystem with its assigned prism in a fresh worker, prefixing the region with a context header naming its neighbours

## Protocol

### 1. Execute

- For each subsystem, dispatch a fresh worker with its assigned prism, prefixing the subsystem content with a context header that names the region and its neighbours: ``# SUBSYSTEM: {code_subsystem.subsystem_name} (lines {code_subsystem.start_line}-{code_subsystem.end_line} of {code_subsystem.source_filename})`` then ``# OTHER SUBSYSTEMS: {code_subsystem.other_subsystem_names}``
- Each worker writes one `{subsystem_result.subsystem_paths}` entry into `{output_path}`, collecting the per-subsystem analysis outputs

## Outputs

### subsystem_outputs

Per-subsystem analysis outputs.
