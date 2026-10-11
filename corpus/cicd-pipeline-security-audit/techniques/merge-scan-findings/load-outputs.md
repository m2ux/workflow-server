---
metadata:
  version: 1.1.0
---

## Capability

Load every scanner output and extract its findings array.

## Inputs

### scanner_outputs

The per-submodule scanner [output files](../../resources/sub-agent-output-schema.md#schema), one per scanner agent.

## Protocol

### 1. Load All Outputs

- Load each of the `{scanner_outputs}` JSON files and extract its findings array
