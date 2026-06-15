---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 2
---

## Capability

Escalate to a full L12 pass on Sonnet and re-assess signal quality

## Protocol

### 1. Stage 2 L12

- Dispatch [L12](../../resources/l12.md) to a fresh worker on Sonnet
- Worker writes `{adaptive_result.artifact_paths}` stage-2 entry into `{output_path}`
- Re-assess signal quality with same criteria

## Outputs

### adaptive_signal_quality

Signal-quality assessment at the current stage.
