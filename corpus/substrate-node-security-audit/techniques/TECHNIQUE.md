---
metadata:
  version: 1.1.0
---

## Capability

Shared Inputs, Outputs, Rules, and Errors for every technique in this set.

## Inputs

### planning_folder_path

The audit's working folder — where every sub-agent and orchestrator step reads prior artifacts from and writes its own output files into.

### repo_name

*(optional)* Name of the indexed graph covering the audited submodule, which every graph read addresses. Empty where no graph covers it.

#### default

`""`
