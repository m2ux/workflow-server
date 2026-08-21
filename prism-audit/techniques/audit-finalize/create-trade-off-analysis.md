---
metadata:
  version: 1.2.0
---

## Capability

Distils the conservation laws the analysis recorded into a design trade-off analysis: a trade-off catalogue, a cross-domain interaction map, and a design decision register.

## Outputs

### trade_offs_path

Filesystem path to the written DESIGN-TRADE-OFFS.md (the design trade-off analysis).

#### artifact

`DESIGN-TRADE-OFFS.md`

#### audience

`human`

## Protocol

### 1. Create Trade-Off Analysis

- Read the "Conservation Laws & Design Trade-offs" section from each scope's DEFINITIVE-FINDINGS.md at the `definitive_findings_path` in `{completed_analyses}`, where every law recorded has already survived challenge.
- Write the analysis to `{trade_offs_path}` per [design-trade-offs](../../resources/design-trade-offs.md#template) and its [Rules](../../resources/design-trade-offs.md#rules)
