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

The first note is this operation's output, not the pair's.
