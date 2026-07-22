---
metadata:
  version: 1.3.0
---

## Capability

Ordered design-dimension set for the current operation from the elicitation-guide mode dimension sets.

## Inputs

### operation_type

The classified operation. Selects the update dimension set when `update`; otherwise the create dimension set.

## Outputs

### design_dimensions

The ordered design dimensions to elicit. Exact create vs update lists are defined in the elicitation-guide Mode Dimension Sets section.

## Protocol

### 1. Select Dimension Set

- Select the create or update dimension set from [elicitation-guide](../resources/elicitation-guide.md) `## Mode Dimension Sets` according to `{operation_type}` — do not hardcode or restate the lists here

### 2. Emit Design Dimensions

- Emit the ordered list as `{design_dimensions}`
