---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 10
  legacy_id: 10
---

## Capability

Assign one scanner agent per submodule with workflow files, recording the agent-to-submodule mapping.

## Outputs

### scanners_assigned

Count of scanner agents assigned, one per submodule with workflow files.

## Protocol

### 1. Assign Scanner Agents

- Assign one scanner agent (`S1`-`Sn`), one per submodule with workflow files, into `{scanner_assignments}` recording the agent-to-submodule mapping, and record the number of agents assigned as `{scanners_assigned}`.
