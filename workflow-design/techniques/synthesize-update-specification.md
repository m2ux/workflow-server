---
metadata:
  version: 1.1.0
---

## Capability

Update-mode design specification covering only dimensions that change.

## Inputs

### operation_type

The classified operation type (`update`).

### change_category

Categorized change request for the update (when set).

### structural_inventory

Baseline structural inventory of the target workflow.

### report_path

*(optional)* Absolute path to the compliance or findings report when the update was seeded from review; empty otherwise.

## Outputs

### accumulated_design

The assembled update specification covering **changed** members of the update dimension set (purpose, activity list, checkpoints, artifacts, rules) — ready for persist and batch confirmation. Unchanged dimensions are omitted.

## Protocol

### 1. Load Change Sources

- Load `{change_category}`, `{user_description}`, and `{structural_inventory}`
- When `{report_path}` is non-empty, load that report as the primary change specification

### 2. Assemble Changed Dimensions Only

- From the update dimension set in [elicitation-guide](../resources/elicitation-guide.md) `## Mode Dimension Sets`, emit only dimensions that change relative to the baseline and change request
- Omit unchanged dimensions from `{accumulated_design}` — do not assemble the full five every update
- Derive each included dimension from the change sources and baseline; prefer additive edits named by findings or the change request; do not invent unrelated structural changes

## Rules

### update-mode-only

This technique applies only when `{operation_type}` is `update`.
