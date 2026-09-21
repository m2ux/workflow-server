---
metadata:
  version: 1.0.0
---

## Capability

Record that the second operation of the pair executed.

## Outputs

### second_noted

True once this operation has executed.

## Protocol

### 1. Record

- Set `{second_noted}` to true.

## Rules

### beta-own

This operation records the second note and nothing else.
