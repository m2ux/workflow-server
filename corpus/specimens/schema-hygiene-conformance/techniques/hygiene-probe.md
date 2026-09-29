---
metadata:
  version: 1.0.0
---

## Capability

Record that the probe executed.

## Outputs

### probe_recorded

True once the probe has executed.

## Protocol

### 1. Record

- Set `{probe_recorded}` to true. That is the whole of the work.

## Rules

### local-marker

`{probe_recorded}` is true only once the probe has executed.
