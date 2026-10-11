---
metadata:
  version: 1.1.0
---

## Capability

Run the initial L12 structural analysis on the target in a fresh worker

## Outputs

### initial_analysis

L12 structural analysis of the target, as first run — before any gap correction.

#### artifact

`verified-initial.md`

#### audience

`human`

## Protocol

### 1. Initial Analysis

- Dispatch [L12](../../resources/l12.md) to a fresh worker, configured for the `{target_type}` of input ('code' or 'general')
- Worker writes `{initial_analysis}` into `{output_path}`
