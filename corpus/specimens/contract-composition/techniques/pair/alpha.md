---
metadata:
  version: 1.0.0
---

## Capability

Record that the first operation of the pair executed.

## Outputs

### first_noted

True once this operation has executed.

## Protocol

### 1. Record

- Set `{first_noted}` to true.

## Rules

### alpha-own

This operation records the first note and nothing else.
