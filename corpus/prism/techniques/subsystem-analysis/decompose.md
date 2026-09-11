---
metadata:
  version: 1.1.0
---

## Capability

Decompose source code into structural subsystems via AST or regex heuristic, capturing each subsystem's name, line range, and peer names

## Protocol

### 1. Decompose

- Parse `{target_content}` via AST (Python) or regex heuristic (other languages), capturing the `{code_subsystem.source_filename}` and the identified subsystems — each with its `{code_subsystem.subsystem_name}`, `{code_subsystem.start_line}`, `{code_subsystem.end_line}`, and the `{code_subsystem.other_subsystem_names}` of its peers
- Identify classes, functions, top-level blocks as subsystems
- Min 10 lines per subsystem; merge smallest pairs to stay under 8 subsystems
- If only 1 subsystem found, fall back to single [L12](../../resources/l12.md) pass
- If AST parsing fails and regex finds no definitions, chunk into ~100-line blocks
