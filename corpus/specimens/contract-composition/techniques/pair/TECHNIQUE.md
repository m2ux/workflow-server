---
metadata:
  version: 1.0.0
---

## Capability

Contract shared by every operation in this group.

## Inputs

### pair_id

Identifier of the pair these operations belong to.

#### default

`pair`

## Rules

### pair-together

Both operations of this pair execute in the same activity.
