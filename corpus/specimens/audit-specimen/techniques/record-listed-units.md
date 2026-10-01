---
metadata:
  version: 1.0.0
---

## Capability

Record the units a capability rewrite loads, beside the units the listing command prints.

## Outputs

### units_listed

Units the listing command prints for `technique.capability`, one path and heading per line.

### units_used

Units the author step loads while rewriting the subject capability, one path and heading per line.

## Protocol

### 1. List

- Run the listing command for `technique.capability` against this corpus tree. Write each printed unit into `{units_listed}`.

### 2. Load

- Apply each unit in `{units_listed}` to the rewrite of `techniques/subject.md` `## Capability`. Write `{units_used}` as one row per unit: the listing's heading, a tab, and `applied` or `finding:` plus the sentence. A heading absent from `{units_listed}` is not a row.
