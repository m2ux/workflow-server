---
metadata:
  version: 2.0.0
---

## Capability

Groups the target's observed characteristics into risk-calibrated audit domains, with the user's stated concerns folded into the areas that cover them.

## Protocol

### 1. Group the Characteristics into Domains

- Group the target's observed characteristics per [Domains](../../resources/audit-domain-rubric.md#domains), taking only those the target holds corresponding code for.

### 2. Calibrate Each Domain's Risk

- Assign each domain a level per [Risk Levels](../../resources/audit-domain-rubric.md#risk-levels).  
  > Where `{trust_boundaries}` is available, the crossing call edges belong among the patterns of the domains that hold them.

### 3. Name What an Audit Would Examine

- Record `{audit_prompt.domains}`: per domain, its level and the patterns and code paths an audit of it would examine.  
  > Where `{audit_description}` names a specific concern, the domains covering it carry that concern among their patterns.
