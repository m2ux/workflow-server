---
metadata:
  version: 1.0.0
---

## Capability

Apply user-requested exclusion adjustments to a categorized change set, yielding the approved set to import.

## Protocol

### 1. Apply Exclusion Adjustments

- Remove each user-named prism from the relevant category of `{change_set}`, producing the approved set.
  > When the user makes no adjustment, the approved set equals the discovered set.
