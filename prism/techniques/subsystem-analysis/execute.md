---
metadata:
  version: 1.2.0
---

## Capability

Analyze each subsystem with its assigned prism in a fresh worker, prefixing the region with a context header naming its neighbours

## Inputs

### subsystem_assignments

Map of subsystem to the prism assigned to analyse it.

## Outputs

### subsystem_outputs

Per-subsystem analysis outputs — one for each decomposed subsystem, produced by that subsystem's assigned prism.

#### artifact

`subsystem-{code_subsystem.subsystem_name}.md`

#### audience

`human`

## Protocol

### 1. Execute

- For each subsystem, dispatch a fresh worker with the prism `{subsystem_assignments}` gives it, prefixing the subsystem content with a context header that names the region and its neighbours: ``# SUBSYSTEM: {code_subsystem.subsystem_name} (lines {code_subsystem.start_line}-{code_subsystem.end_line} of {code_subsystem.source_filename})`` then ``# OTHER SUBSYSTEMS: {code_subsystem.other_subsystem_names}``
- Each worker writes its own `{subsystem_outputs}` entry into `{output_path}`, collecting the per-subsystem analysis outputs
