---
metadata:
  version: 1.0.0
---

## Capability

Pause at a checkpoint and surface the yield.

## Inputs

### checkpoint_id

ID of the checkpoint being yielded.

## Outputs

### yielded_checkpoint

`<checkpoint_yield>` block signalling the pause

## Protocol

1. Call `yield_checkpoint { session_index, checkpoint_id }`; the server records the checkpoint as active under `session.json#activeCheckpoint`.
2. Emit the `{yielded_checkpoint}` `<checkpoint_yield>` block (no payload required — the active checkpoint is server-resident and is read by the orchestrator via `present_checkpoint`).
3. STOP — make no further tool calls until the orchestrator resumes you.
