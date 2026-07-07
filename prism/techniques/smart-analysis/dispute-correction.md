---
metadata:
  version: 1.0.0
---

## Capability

Run dispute self-correction when the analysis output is sufficient, then assemble the smart result from the written artifacts and pipeline trace

## Protocol

### 1. Dispute Correction

- Check analysis output quality: look for conservation law presence and output length
- If adequate output (>200 chars): run [dispute-synthesis](../../resources/dispute-synthesis.md) for self-correction
- If analysis found a conservation law, dispute is supplementary; if not, dispute is critical
- Assemble `{smart_result}` from the artifacts written to `{output_path}` and the ordered pipeline trace
