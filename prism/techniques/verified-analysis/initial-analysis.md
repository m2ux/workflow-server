---
metadata:
  version: 1.0.0
---

## Capability

Run the initial L12 structural analysis on the target in a fresh worker

## Protocol

### 1. Initial Analysis

- Dispatch [L12](../../resources/l12.md) to a fresh worker, configured for the `{target_type}` of input ('code' or 'general')
- Worker writes `{verified_result.initial_path}` into `{output_path}`
