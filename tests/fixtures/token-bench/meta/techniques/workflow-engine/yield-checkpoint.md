---
metadata:
  version: 1.0.0
---

## Capability

Pause at a gate and surface the yield.

## Protocol

### 1. Yield

- Mark the gate active and emit the yield block, then stop until the orchestrator resumes this context.
- A gate whose answer is already recorded replays: apply the recorded effect and carry on.
