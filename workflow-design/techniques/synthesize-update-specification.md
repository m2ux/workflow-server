---
metadata:
  version: 1.0.1
---

## Capability

Assemble the update-mode design specification from the settled change request — compliance report when present, otherwise `{change_category}` / `{user_description}` and `{structural_inventory}` — without per-dimension elicitation.

## Inputs

### operation_type

Must be `update` for this technique to apply.

### change_category

Categorized change request for the update (when set).

### structural_inventory

Baseline structural inventory of the target workflow.

### report_path

*(optional)* Absolute path to the compliance or findings report when the update was seeded from review; empty otherwise.

## Outputs

### accumulated_design

The assembled update specification covering the update dimension set (purpose, activity list, checkpoints, artifacts, rules) as derived from the change request and baseline — ready for persist and batch confirmation.

## Protocol

### 1. Load Change Sources

- Load `{change_category}`, `{user_description}`, and `{structural_inventory}`
- When `{report_path}` is non-empty, load that report as the primary change specification

### 2. Assemble Update Specification

- Assemble `{accumulated_design}` for the update dimension set in [elicitation-guide](../resources/elicitation-guide.md) `## Mode Dimension Sets`: purpose, activity list, checkpoints, artifacts, and rules
- Derive each dimension from the change sources and baseline — do not invent unrelated structural changes; prefer additive edits named by findings or the change request
