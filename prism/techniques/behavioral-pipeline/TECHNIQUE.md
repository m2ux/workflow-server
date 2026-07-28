---
metadata:
  version: 1.3.0
---

## Capability

The behavioral pipeline's passes: four independent behavioral lenses and the synthesis that reconciles them. The contract contributes the fixed lens-to-role label mapping both passes use and the code-only domain restriction.

## Rules

### label-mapping

The behavioral pipeline uses fixed role labels mapped to specific lenses: `error-resilience` → ERRORS, `optimize` → COSTS, `evolution` → CHANGES, `api-surface` → PROMISES. The `synthesis` lens expects these exact labels.

### code-only

The behavioral pipeline is code-only. `optimize` uses strongly code-oriented vocabulary with no domain-neutral variant. Do not use the behavioral pipeline when `{target_type}` is `general`.
