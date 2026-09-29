---
metadata:
  version: 1.4.0
---

## Capability

Ordered design-dimension set for the current technique from the elicitation-guide mode dimension sets.

## Outputs

### design_dimensions

The ordered design dimensions to elicit. Exact create vs update lists are defined in [Mode Dimension Sets](../resources/elicitation-guide.md#mode-dimension-sets).

## Protocol

### 1. Select Dimension Set

- Select the create or update dimension set from [Mode Dimension Sets](../resources/elicitation-guide.md#mode-dimension-sets) according to `{operation_type}` — do not hardcode or restate the lists here

### 2. Emit Design Dimensions

- Emit the ordered list as `{design_dimensions}`
