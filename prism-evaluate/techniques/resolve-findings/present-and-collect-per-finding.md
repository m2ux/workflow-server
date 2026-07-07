---
metadata:
  version: 1.0.0
---

## Capability

Present a single finding with its claim, critique, and proposed mitigation, then collect the user's decision — accepting, modifying, skipping, or discussing — and record it.

## Outputs

### finding_decision

The recorded decision for `{current_finding}` — accept, modify, skip, or discuss — with the accepted mitigation text. Appended to the `accepted_mitigations` accumulator across the per-finding loop.

## Protocol

- Present `{current_finding}`: its ID and severity, the claim from the target with its location, the evaluation's critique, and the proposed mitigation with its replacement or new text.
- Collect the user's decision — accept, modify, skip, or discuss — as `{finding_decision}` and append it to the `{accepted_mitigations}` accumulator.  
  > On `discuss`, engage in clarifying dialogue, incorporate the user's context into a revised proposal, then re-present and re-collect.  
  > On `modify`, record the user's modification as the accepted version.
