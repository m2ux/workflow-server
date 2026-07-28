---
metadata:
  version: 1.0.0
---

## Capability

Run dispute self-correction when the analysis output is sufficient, closing the smart run against the pipeline trace

## Inputs

### smart_pipeline_steps

The pipeline steps composed for this run, in execution order.

## Protocol

### 1. Dispute Correction

- Check analysis output quality: look for conservation law presence and output length
- If adequate output (>200 chars): run [dispute-synthesis](../../resources/dispute-synthesis.md) for self-correction
- If analysis found a conservation law, dispute is supplementary; if not, dispute is critical
- Close the run against `{smart_pipeline_steps}` in execution order, over the artifacts each executed step persisted into `{output_path}`
