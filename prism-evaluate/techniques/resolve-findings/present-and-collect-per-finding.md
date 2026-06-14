---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 2
  legacy_id: 2
---

## Capability

Present a single finding with its claim, critique, and proposed mitigation, then collect the user's decision — accepting, modifying, skipping, or discussing — and record it.

## Protocol

- Present `{current_finding}`: its ID and severity, the claim from the target with its location, the evaluation's critique, and the proposed mitigation with its replacement or new text.
- Collect the user's decision — accept, modify, skip, or discuss — and record it in `{accepted_mitigations}`.  
  > On `discuss`, engage in clarifying dialogue, incorporate the user's context into a revised proposal, then re-present and re-collect.  
  > On `modify`, record the user's modification as the accepted version.
