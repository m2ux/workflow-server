---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 3
---

## Capability

Select the analysis approach from the target characteristics by attempting subsystem decomposition and falling back to a single or 3-pass L12

## Protocol

### 1. Select Mode

- Branch on `{target_type}`: when it is 'code', attempt AST-based subsystem decomposition (apply [subsystem-analysis](../subsystem-analysis/TECHNIQUE.md)::[decompose](../subsystem-analysis/decompose.md))
- If >1 subsystem found: use subsystem mode (different prisms per region)
- If 1 subsystem, or `{target_type}` is 'general': use [L12](../../resources/l12.md) single pass (or 3-pass for general)
- Record the resulting composed pipeline steps

## Outputs

### smart_pipeline_steps

The composed pipeline steps.
