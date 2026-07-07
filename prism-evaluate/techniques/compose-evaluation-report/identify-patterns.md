---
metadata:
  version: 1.0.0
---

## Capability

Compare findings across dimensions to identify the single deepest cross-dimensional insight and the cross-cutting patterns that span multiple dimensions.

## Protocol

- Compare findings across dimensions for the same underlying issue surfacing in different dimensions, systemic asymmetries (deep specification in one area versus shallow in another), and reinforcing risks (multiple dimensions pointing to one failure mode).
- Identify `{evaluation_report.core_finding}` — the single deepest insight that explains the most findings across dimensions — with its title and description.
- Record `{evaluation_report.cross_cutting_patterns}` as an array of `{ pattern, affected_dimensions, evidence }`.  
  > When no meaningful pattern spans multiple dimensions, report the per-dimension findings without a core finding and note that the dimensions appear independent.
