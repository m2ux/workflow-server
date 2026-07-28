---
metadata:
  version: 1.0.0
---

## Capability

Detect knowledge gaps in the initial analysis output by applying the boundary and audit prisms to the L12 output

## Outputs

### detected_gaps

The epistemic weaknesses the boundary and audit prisms find in the analysis text.

#### artifact

`verified-gaps.md`

## Protocol

### 1. Gap Detection

- Dispatch gap detection to a fresh worker
- Worker loads [knowledge-boundary](../../resources/knowledge-boundary.md) (41) and [knowledge-audit](../../resources/knowledge-audit.md) (40)
- Worker applies both to the L12 OUTPUT (not source code), writing `{detected_gaps}` into `{output_path}`
