---
metadata:
  version: 1.1.0
---

## Capability

Escalate to a full L12 pass on Sonnet and re-assess signal quality

## Outputs

### adaptive_signal_quality

Signal-quality assessment at the current stage.

### l12_analysis

Full L12 analysis of the target at the escalated stage.

#### artifact

`adaptive-stage2.md`

#### audience

`human`

## Protocol

### 1. Stage 2 L12

- Dispatch [L12](../../resources/l12.md) to a fresh worker on Sonnet
- Worker writes `{l12_analysis}` into `{output_path}`
- Re-assess signal quality with same criteria
