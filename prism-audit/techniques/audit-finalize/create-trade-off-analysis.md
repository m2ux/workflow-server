---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 5
  legacy_id: 5
---

## Capability

Distil the conservation laws prism recorded into a design trade-off analysis: a trade-off catalogue, a cross-domain interaction map, and a design decision register. Prism has already excluded the laws its adversarial pass rejected, so this technique reads only the surviving laws from the findings contract.

## Inputs

### completed_analyses

The triggered prism runs, each carrying its scope's `definitive_findings_path`. The Conservation Laws & Design Trade-offs section of each DEFINITIVE-FINDINGS.md is the source of laws.

## Protocol

### 1. Create Trade-Off Analysis

- Read the "Conservation Laws & Design Trade-offs" section from each scope's DEFINITIVE-FINDINGS.md at the `definitive_findings_path` in `{completed_analyses}` — not the raw synthesis documents. Every law recorded there survived or was refined through prism's adversarial challenge; rejected laws are already absent.
- Write the analysis to `{trade_offs_path}` in three parts.
- Part 1 — Trade-Off Catalogue: one entry per domain with its constraint, current operating point, shift prediction, and design questions. Each entry must have a falsifiable constraint, code-level evidence for the operating point (citing specific finding IDs), concrete shift predictions, and actionable design questions.
- Part 2 — Cross-Domain Interactions: map which trade-offs compound.
- Part 3 — Design Decision Register: a table of implicit decisions that should be made explicit, with current choice, alternative, governing trade-off, and documentation status.

## Outputs

### trade_offs_path

Filesystem path to the written DESIGN-TRADE-OFFS.md (the design trade-off analysis).

#### artifact

`DESIGN-TRADE-OFFS.md`
