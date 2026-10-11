---
metadata:
  version: 1.1.0
---

## Capability

Load and structurally validate every scanner output against the output schema, counting malformed or missing-field outputs as gaps.

## Inputs

### scanner_outputs

The per-submodule scanner [output files](../../resources/sub-agent-output-schema.md#schema), one per scanner agent.

## Protocol

### 1. Validate Structure

- Load each of the `{scanner_outputs}` JSON files
- Validate each against the [sub-agent output schema](../../resources/sub-agent-output-schema.md#schema) — flag malformed or missing fields
- Malformed outputs count as gaps
