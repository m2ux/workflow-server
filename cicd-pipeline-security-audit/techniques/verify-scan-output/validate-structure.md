---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 1
  legacy_id: 1
---

## Capability

Load and structurally validate every scanner output against the output schema, counting malformed or missing-field outputs as gaps.

## Protocol

### 1. Validate Structure

- Load each of the `{scanner_outputs}` JSON files
- Validate each against the [sub-agent output schema](../../resources/sub-agent-output-schema.md#schema) — flag malformed or missing fields
- Malformed outputs count as gaps
