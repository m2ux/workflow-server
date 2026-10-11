---
metadata:
  version: 1.1.0
---

## Capability

Extract structured gap data from the gap analysis into a context block for re-analysis

## Outputs

### gap_data

Structured gap data extracted from the gap analysis, injected as the `verified_knowledge` context block for the corrected re-analysis.

## Protocol

### 1. Gap Extraction

- Parse the structured claims `{gap_data}` from the gap output
- Construct `verified_knowledge` context block with `{gap_data}`
