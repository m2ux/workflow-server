---
metadata:
  version: 1.2.0
---

## Capability

Continue execution after the orchestrator resolves a checkpoint.

## Inputs

### session_index

`session_index` of the worker whose checkpoint was resolved.

### effects

Variable updates carried by the resolved checkpoint.

## Protocol

1. Call `resume_checkpoint { session_index }`; it confirms the orchestrator's `respond_checkpoint` has cleared the active checkpoint before the paused worker proceeds.
   > When `resume_checkpoint` returns `no active checkpoint` or `checkpoint is still active`, the checkpoint is not yet resolved: wait for the resume prompt to arrive before calling again.
2. Apply `{effects}` to local state and continue from the paused step.
