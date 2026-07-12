---
metadata:
  version: 1.0.0
---

## Capability

Derive the ordered set of design dimensions to elicit for the current operation, selecting the create-mode or update-mode dimension set from the [elicitation-guide](../resources/elicitation-guide.md).

## Inputs

### is_update_mode

Whether update mode is active. Update mode elicits a reduced dimension set — the already-established activity model, variables, and techniques of the existing workflow are not re-elicited.

## Outputs

### design_dimensions

The ordered design dimensions to elicit, iterated by the dimension-elicitation loop. Create mode: purpose, activity list, activity model, checkpoints, artifacts, variables, techniques, rules. Update mode: purpose, activity list, checkpoints, artifacts, rules.

## Protocol

### 1. Derive Dimensions

- Select the dimension set from the [elicitation-guide](../resources/elicitation-guide.md) by mode: in create mode the full ordered set (purpose, activity list, activity model, checkpoints, artifacts, variables, techniques, rules); in update mode the reduced set (purpose, activity list, checkpoints, artifacts, rules), which skips the already-established activity model, variables, and techniques
- Emit the ordered list as `{design_dimensions}`
