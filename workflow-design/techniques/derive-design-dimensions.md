---
metadata:
  version: 1.2.0
---

## Capability

Derive the ordered set of design dimensions to elicit for the current operation from the mode dimension sets in the [elicitation-guide](../resources/elicitation-guide.md).

## Inputs

### is_update_mode

Whether update mode is active. Selects the update dimension set from the elicitation-guide when true.

## Outputs

### design_dimensions

The ordered design dimensions to elicit. Exact create vs update lists are defined in the elicitation-guide Mode Dimension Sets section.

## Protocol

### 1. Select Dimension Set

- Select the create or update dimension set from [elicitation-guide](../resources/elicitation-guide.md) `## Mode Dimension Sets` according to `{is_update_mode}` — do not hardcode or restate the lists here

### 2. Emit Design Dimensions

- Emit the ordered list as `{design_dimensions}`
