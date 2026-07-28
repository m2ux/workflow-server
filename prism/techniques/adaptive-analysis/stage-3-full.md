---
metadata:
  version: 1.0.0
---

## Capability

Escalate to the full-prism 3-pass pipeline when the signal is still insufficient, recording the deepest stage reached

## Protocol

### 1. Stage 3 Full

- If still insufficient: run full-prism 3-pass pipeline
- The pipeline's structural, adversarial ([l12-complement-adversarial](../../resources/l12-complement-adversarial.md)), and synthesis ([l12-synthesis](../../resources/l12-synthesis.md)) passes each persist their own artifact
- Return `{adaptive_result}` recording the deepest stage reached and the final signal assessment across all stages run
