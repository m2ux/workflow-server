---
metadata:
  version: 1.0.0
---

## Capability

The run status emitted once the engineering push is on the remote.

## Protocol

### 1. Emit the Status

- Emit the run status, filling the [Template](/meta/resources/run-status.md#template) and honouring the [Rules](/meta/resources/run-status.md#rules) beneath it. The emission follows the push, so every link it publishes points at an artifact the remote already holds.
