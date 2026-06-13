---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 5
  legacy_id: 5
---

## Capability

Present a categorized change set to the user as a reviewable summary and apply any user-requested exclusion adjustments, yielding the approved change set to import.

## Protocol

### 1. Present Change Summary

- Display a categorized change table from `{change_set}`: a row per entry under each of the new, modified, renamed, and deleted categories.
- For each entry in `{change_set}.new`, show its per-prism detail: family, `optimal_model`, and `quality_baseline`.

### 2. Apply Exclusion Adjustments

- Remove each user-named prism from the relevant category of `{change_set}`, producing the approved set.
  > When the user makes no adjustment, the approved set equals the discovered set.

## Outputs

### change_set

The approved change set after any exclusion adjustments.
