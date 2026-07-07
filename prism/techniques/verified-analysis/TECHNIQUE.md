---
metadata:
  version: 1.0.0
---

## Capability

Run L12 analysis, detect knowledge gaps via boundary + audit prisms, then re-analyze with gap corrections for highest accuracy

## Outputs

### verified_result

Paths to the three verified pipeline artifacts

#### artifact

`verified-initial.md` (initial L12) / `verified-gaps.md` (gap detection) / `verified-corrected.md` (corrected re-analysis)

#### initial_path

Filesystem path to the initial L12 artifact

#### gaps_path

Filesystem path to the gap-detection artifact

#### corrected_path

Filesystem path to the corrected re-analysis artifact

## Rules

### gap-detection-on-output

Gap detection runs the boundary and audit prisms on the L12 OUTPUT, not on the source code — both prisms run in one worker context, detecting epistemic weaknesses in the analysis rather than structural properties of the code.
