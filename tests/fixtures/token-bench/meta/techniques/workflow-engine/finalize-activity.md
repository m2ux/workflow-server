---
metadata:
  version: 1.0.0
---

## Capability

Compile the `activity_complete` envelope once every step, gate and artifact is done.

## Protocol

### 1. Finalize

- Fold the completed steps, the gate responses and the artifacts written into one envelope.
- Resolve where the run goes next from the activity definition and the exit destinations this delivery carried.
