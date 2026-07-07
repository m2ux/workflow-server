---
metadata:
  version: 1.0.0
---

## Capability

Detect knowledge gaps in the initial analysis output by applying the boundary and audit prisms to the L12 output

## Protocol

### 1. Gap Detection

- Dispatch gap detection to a fresh worker
- Worker loads [knowledge-boundary](../../resources/knowledge-boundary.md) (41) and [knowledge-audit](../../resources/knowledge-audit.md) (40)
- Worker applies both to the L12 OUTPUT (not source code), writing `{verified_result.gaps_path}` into `{output_path}`
