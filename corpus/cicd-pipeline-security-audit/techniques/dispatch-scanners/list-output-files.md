---
metadata:
  version: 1.1.0
---

## Capability

The scanner output filenames the persistence check expects, one per roster entry.

## Outputs

### expected_output_files

The filename each entry of `{scanner_assignments}` persists, in roster order.

### scanner_outputs

The per-submodule scanner output files those filenames name, one per scanner agent, in the same order.

## Protocol

### 1. Name Each Scanner File

- For each entry in `{scanner_assignments}`, take the filename [File Naming Convention](../../resources/sub-agent-output-schema.md#file-naming-convention) assigns that entry.
- Emit those filenames as `{expected_output_files}`, and the files they name as `{scanner_outputs}`.
