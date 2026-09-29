---
metadata:
  version: 1.5.0
---

## Capability

Continue execution after the orchestrator resolves a checkpoint.

## Inputs

### session_index

`session_index` of the worker whose checkpoint was resolved.

### checkpoint_reply

The resolved checkpoint's reply.

## Outputs

### selected_exit

The exit the answer selected (only when the `resume_checkpoint` response carries `exit`)

## Protocol

### 1. Confirm Gate Cleared

- Call `resume_checkpoint { session_index }`; it confirms the orchestrator's `respond_checkpoint` has cleared the active checkpoint before the paused worker proceeds.
  > When `resume_checkpoint` refuses because the checkpoint is still active, it is not yet resolved: wait for the resume prompt to arrive before calling again.

### 2. Apply Effects

- Apply `{checkpoint_reply}`, and the `variables_changed` the `resume_checkpoint` response returns, to local state.

### 3. Continue Or Finalize

- Where the `resume_checkpoint` response carries `exit`, hold `exit.id` as `{selected_exit}`.
- Continue from the paused step.
  > When the response's `exit.ends_activity` is true, the answer ended the activity at this checkpoint: run none of the remaining steps, and finalize the activity with the steps you ran and `{selected_exit}`.
