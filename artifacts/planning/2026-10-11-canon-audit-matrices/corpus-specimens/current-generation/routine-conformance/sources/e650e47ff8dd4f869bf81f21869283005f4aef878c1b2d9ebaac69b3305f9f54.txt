---
metadata:
  version: 1.0.0
---

## Capability

Run L12 analysis, detect knowledge gaps via boundary + audit prisms, then re-analyze with gap corrections for highest accuracy

## Rules

### gap-detection-on-output

Gap detection runs the boundary and audit prisms on the L12 OUTPUT, not on the source code — both prisms run in one worker context, detecting epistemic weaknesses in the analysis rather than structural properties of the code.
