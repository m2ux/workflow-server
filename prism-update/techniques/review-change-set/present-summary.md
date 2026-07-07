---
metadata:
  version: 1.0.0
---

## Capability

Present a categorized change set to the user as a reviewable summary, with per-prism detail for new entries.

## Protocol

### 1. Present Change Summary

- Display a categorized change table from `{change_set}`: a row per entry under each of the new, modified, renamed, and deleted categories.
- For each entry in `{change_set}.new`, show its per-prism detail: family, `optimal_model`, and `quality_baseline`.
