---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 1
---

## Capability

Run the cheapest SDL scan on Haiku and assess signal quality to decide whether escalation is needed

## Protocol

### 1. Stage 1 Sdl

- Dispatch [deep-scan](../../resources/deep-scan.md) to a fresh worker on Haiku, passing `{target_content}` and `{target_type}` so the scan adapts to whether the input is code or general text
- Worker writes `{adaptive_result.artifact_paths}` stage-1 entry into `{output_path}`
- Assess signal quality: conservation law + word count > 300 + bug table

### 2. Assess Signal

- If all three signals are present — conservation law (regex: 'conservation law' or '= constant'), word count > 300, and a bug table — set `{adaptive_signal_quality}` to `adequate` and stop escalation. Otherwise set it to `insufficient` and continue.

## Outputs

### adaptive_signal_quality

Signal-quality assessment at the current stage.
