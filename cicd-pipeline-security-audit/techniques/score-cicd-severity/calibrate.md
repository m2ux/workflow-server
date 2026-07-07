---
metadata:
  version: 1.0.0
---

## Capability

Cross-check severity assignments against the campaign calibration anchors, adjust any finding that diverges by two or more levels, and emit the calibrated findings.

## Protocol

### 1. Calibrate

- Cross-check severity assignments against the campaign [calibration anchors](../../resources/cicd-severity-rubric.md#calibration-anchors)
- Adjust any finding that diverges by >= 2 levels from a matching anchor
- Emit the calibrated `{scored_findings}`, each carrying its final severity level and scoring rationale
