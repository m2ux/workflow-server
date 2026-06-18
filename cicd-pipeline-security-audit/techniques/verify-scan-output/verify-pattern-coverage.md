---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 3
  legacy_id: 3
---

## Capability

Identify any scanner that skipped a detection pattern by checking each output's coverage section for all seven patterns (P1-P7).

## Protocol

### 1. Verify Pattern Coverage

- For each scanner output, check the coverage section for all seven patterns (P1-P7)
- Flag any scanner that reports incomplete pattern application
