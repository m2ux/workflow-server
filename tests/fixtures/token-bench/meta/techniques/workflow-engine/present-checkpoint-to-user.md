---
metadata:
  version: 1.0.0
---

## Capability

Put a yielded gate in front of the user and take their answer.

## Protocol

### 1. Present

- Read the active checkpoint, present its message and options verbatim, and wait.
- Never resolve a gate on the user's behalf, and never invent an option the definition does not declare.
