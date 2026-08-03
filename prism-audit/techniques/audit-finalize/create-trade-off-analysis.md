---
metadata:
  version: 1.2.0
---

## Capability

Distil the conservation laws prism recorded into a design trade-off analysis: a trade-off catalogue, a cross-domain interaction map, and a design decision register. Prism has already excluded the laws its adversarial pass rejected, so this technique reads only the surviving laws from the findings contract.

## Outputs

### trade_offs_path

Filesystem path to the written DESIGN-TRADE-OFFS.md (the design trade-off analysis).

#### artifact

`DESIGN-TRADE-OFFS.md`

#### audience

`human`

## Protocol

### 1. Create Trade-Off Analysis

- Read the "Conservation Laws & Design Trade-offs" section from each scope's DEFINITIVE-FINDINGS.md at the `definitive_findings_path` in `{completed_analyses}` — not the raw synthesis documents. Every law recorded there survived or was refined through prism's adversarial challenge; rejected laws are already absent.
- Write the analysis to `{trade_offs_path}` per [design-trade-offs](../../resources/design-trade-offs.md#template) and its [Rules](../../resources/design-trade-offs.md#rules)
