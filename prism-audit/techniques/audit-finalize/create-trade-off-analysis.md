---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 5
  legacy_id: 5
---

## Capability

Distil the conservation laws surfaced during the prism passes into a design trade-off analysis: a trade-off catalogue, a cross-domain interaction map, and a design decision register — including only laws that survived or were refined through adversarial challenge.

## Protocol

### 1. Create Trade-Off Analysis

- Read all synthesis documents and extract each domain's Refined Conservation Law and Refined Meta-Law.
- Include only laws that SURVIVED or were REFINED through adversarial challenge; exclude rejected laws.
- Write the analysis to `{trade_offs_path}` in three parts.
- Part 1 — Trade-Off Catalogue: one entry per domain with its constraint, current operating point, shift prediction, and design questions. Each entry must have a falsifiable constraint, code-level evidence for the operating point (citing specific finding IDs), concrete shift predictions, and actionable design questions.
- Part 2 — Cross-Domain Interactions: map which trade-offs compound.
- Part 3 — Design Decision Register: a table of implicit decisions that should be made explicit, with current choice, alternative, governing trade-off, and documentation status.

## Outputs

### trade_offs_path

Filesystem path to the written DESIGN-TRADE-OFFS.md (the design trade-off analysis).

#### artifact

`DESIGN-TRADE-OFFS.md`
