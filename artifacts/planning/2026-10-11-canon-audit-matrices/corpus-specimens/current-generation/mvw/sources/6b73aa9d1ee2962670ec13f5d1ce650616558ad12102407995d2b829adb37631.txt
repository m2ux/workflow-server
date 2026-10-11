---
metadata:
  version: 1.2.0
---

## Capability

Re-run the L12 analysis with the extracted gap context injected, producing the corrected re-analysis artifact

## Inputs

### gap_data

Structured gap claims extracted from the gap-detection output, injected as the `verified_knowledge` context block for the corrected re-analysis

## Outputs

### corrected_analysis

L12 structural analysis re-run against the target with the gap context injected.

#### artifact

`verified-corrected.md`

#### audience

`human`

## Protocol

### 1. Corrected Analysis

- Dispatch re-analysis to a fresh worker with [L12](../../resources/l12.md)  
  > Corrected re-analysis worker does not see the initial L12 output — only the target content + gap context.
- Worker receives: `<verified_knowledge source='GAP-ANALYSIS'>`
`{gap_data}`
`</verified_knowledge>`

`{target_content}`
- Worker writes `{corrected_analysis}` into `{output_path}`
- Return `{corrected_analysis}`
