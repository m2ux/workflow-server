---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 3
  legacy_id: 3
---

## Capability

Wait for all scanners to return and collect each one's structured output.

## Protocol

### 1. Collect Results

- Wait for all scanners to return and collect each one's structured output.  
  > If a scanner fails or times out, record the failure and proceed with the available results.
