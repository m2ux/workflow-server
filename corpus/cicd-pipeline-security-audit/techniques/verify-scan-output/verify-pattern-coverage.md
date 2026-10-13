---
metadata:
  version: 1.1.0
---

## Capability

Identify any scanner that skipped a detection pattern by checking each output's coverage section for all seven patterns (P1-P7).

## Inputs

### scanner_outputs

The per-submodule scanner [output files](../../resources/sub-agent-output-schema.md#schema), one per scanner agent.

## Protocol

### 1. Verify Pattern Coverage

- For each of `{scanner_outputs}`, check the coverage section for all seven patterns (P1-P7)
- Flag any scanner that reports incomplete pattern application
