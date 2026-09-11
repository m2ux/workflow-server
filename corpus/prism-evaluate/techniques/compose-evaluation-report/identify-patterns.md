---
metadata:
  version: 2.0.0
---

## Capability

Reads the findings against each other to name the one insight that explains the most of them, and the patterns spanning more than one dimension.

## Protocol

### 1. Compare Across Dimensions

- Compare `{evaluation_report.dimension_findings}` for one underlying issue surfacing in several dimensions, asymmetries between deeply and shallowly specified areas, and risks that reinforce each other toward a single failure mode.

### 2. Name the Core Finding

- Record `{evaluation_report.core_finding}` — the insight explaining the most findings across dimensions — with its title and description.  
  > Where no insight spans dimensions, the dimensions are independent, and the report carries the per-dimension findings with that stated and no core finding.

### 3. Record the Patterns

- Record `{evaluation_report.cross_cutting_patterns}` as an array of `{ pattern, affected_dimensions, evidence }`.
