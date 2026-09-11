---
metadata:
  version: 2.0.0
---

## Capability

Assign one scanner agent per submodule with workflow files, building the roster the graph opens one scanner per entry of.

## Outputs

### scanner_assignments

The [agent-to-submodule roster](../../resources/intermediate-artifact-schemas.md#scanner-assignments), in scanner order.

#### artifact

`scanner-assignments.json`

#### audience

`agent`

## Protocol

### 1. Assign Scanner Agents

- Assign one scanner agent (`S1`-`Sn`), one per submodule with workflow files, into `{scanner_assignments}`. Each entry carries its designator at `id`, the submodule directory at `submodule`, the workflow files that scanner covers at `workflow_files`, and any AI configuration files found there at `ai_config_files`.
- The graph fans the reconnaissance exit over this roster, so its length is how many scanners run and the server's fan ceiling is the bound they answer to. Where a target repository holds more submodules with workflows than that ceiling admits, the run is scoped to a narrower `{target_submodules}` or the operator raises the ceiling.
