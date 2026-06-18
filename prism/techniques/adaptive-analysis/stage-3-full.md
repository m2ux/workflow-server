---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 3
---

## Capability

Escalate to the full-prism 3-pass pipeline when the signal is still insufficient, recording the deepest stage reached

## Protocol

### 1. Stage 3 Full

- If still insufficient: run full-prism 3-pass pipeline
- Produces structural, adversarial ([l12-complement-adversarial](../../resources/l12-complement-adversarial.md)), and synthesis ([l12-synthesis](../../resources/l12-synthesis.md)) artifacts — paths recorded in `{adaptive_result}.artifact_paths`
- Return `{adaptive_result}` recording the deepest stage reached, the artifact paths produced, and the final signal assessment across all stages run
