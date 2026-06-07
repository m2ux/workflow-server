---
metadata:
  version: 1.0.0
---

## Capability

Send the user's selection back to the server, clearing the active checkpoint.

## Inputs

### session_index

`session_index` of the worker whose active checkpoint is being resolved

### resolution

`{ option_id }` | `{ auto_advance: true }` | `{ condition_not_met: true }`

## Output

### effects

Variable updates returned by the server, to pass back down to the worker on resume

## Protocol

1. Call `respond_checkpoint { session_index, ...resolution }`; the server clears `session.json#activeCheckpoint` and returns `{effects}`. Capture `{effects}` and propagate them to the worker on resume.
   - If the call returns `no active checkpoint on session`, there is no active checkpoint to resolve: verify `{session_index}` references the correct worker session and that an active checkpoint was reported before this call.

## Rules

### no-option-hallucination

If `respond_checkpoint` returns `Invalid option`, STOP. Apply [present-checkpoint-to-user](./present-checkpoint-to-user.md) on the same `{session_index}` to retrieve the valid options. Never guess.
