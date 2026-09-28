---
metadata:
  version: 1.4.0
---

## Capability

Continue execution after the orchestrator resolves a checkpoint.

## Inputs

### session_index

`session_index` of the worker whose checkpoint was resolved.

### effects

Variable updates carried by the resolved checkpoint.

## Protocol

### 1. Confirm Gate Cleared

- Call `resume_checkpoint { session_index }`; it confirms the orchestrator's `respond_checkpoint` has cleared the active checkpoint before the paused worker proceeds.
  > When `resume_checkpoint` refuses because the checkpoint is still active, it is not yet resolved: wait for the resume prompt to arrive before calling again.

### 2. Apply Effects

- Apply `{effects}`, and the `variables_changed` the response returns, to local state.
- Where the response carries `exit`, hold `exit.id` as the activity's `selected_exit`. Where `exit.ends_activity` is true, the answer ended the activity at this checkpoint: run none of the remaining steps, and finalize the activity with the steps you ran and that exit.
- Otherwise continue from the paused step.

