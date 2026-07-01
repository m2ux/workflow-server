---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 4
---

## Capability

Run the selected analysis mode with the enriched content, injecting verified facts and capturing output for the dispute decision

## Protocol

### 1. Execute Analysis

- Execute the `{smart_pipeline_steps}` that [select-mode](./select-mode.md) composed, with enriched content (verified facts injected), applying each step via its matching technique: [single-lens-analysis](../single-lens-analysis.md) for a single concern lens, [structural-analysis](../structural-analysis.md) for L12, [portfolio-analysis](../portfolio-analysis.md) for two or more lenses, [full-prism](../full-prism.md) for the 3-pass pipeline, or the subsystem per-region assignment (which assigns different prisms per region, e.g. [claim](../../resources/claim.md) and [identity](../../resources/identity.md))
- Capture output for the dispute decision
