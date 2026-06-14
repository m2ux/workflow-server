---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 1
---

## Capability

Decompose source code into structural subsystems via AST or regex heuristic, capturing each subsystem's name, line range, and peer names

## Protocol

### 1. Decompose

- Parse `{target_content}` via AST (Python) or regex heuristic (other languages), capturing the `{subsystem.source_filename}` and the identified subsystems — each with its `{subsystem.subsystem_name}`, `{subsystem.start_line}`, `{subsystem.end_line}`, and the `{subsystem.other_subsystem_names}` of its peers
- Identify classes, functions, top-level blocks as subsystems
- Min 10 lines per subsystem; merge smallest pairs to stay under 8 subsystems
- If only 1 subsystem found, fall back to single [L12](../../resources/l12.md) pass
- If AST parsing fails and regex finds no definitions, chunk into ~100-line blocks
