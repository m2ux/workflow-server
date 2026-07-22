---
metadata:
  version: 1.0.0
---

## Capability

Load the active checkpoint's details and present them to the user.

## Inputs

### session_index

`session_index` of the worker whose active checkpoint is being presented

## Outputs

### user_selection

`{ option_id, effects }` — captured user response

## Protocol

1. Call `present_checkpoint { session_index }`; the server reads the active checkpoint from `session.json#activeCheckpoint` and returns its message + options. If this returns `no active checkpoint on session`, the worker has not yet yielded a checkpoint or the previous one was already resolved — re-check that you are presenting against the correct `{session_index}`.
2. Call `AskQuestion` with the checkpoint's message and `options[]`. This is the user's only opportunity to respond — it is MANDATORY for every checkpoint, including those with `autoAdvanceMs` set. If `autoAdvanceMs` is set, configure `AskQuestion`'s timeout to that value with `defaultOption` as the timeout fallback; if the user does not respond within the timer, capture that as `auto_advance: true`. If the user responds, capture their `option_id`.
3. Record the resolved `{user_selection}` — the user's `option_id` and its `effects` (or `auto_advance` / `condition_not_met`).

## Rules

### present-before-any-resolution

`present_checkpoint` returning data is not presentation. Every resolution path — `option_id`, `auto_advance`, or `condition_not_met` — MUST be preceded by an `AskQuestion` that displays the checkpoint's message and options. Never skip `AskQuestion` for a sleep + `auto_advance`, even when the default seems obvious. `auto_advance: true` is valid only after `AskQuestion` was shown and `autoAdvanceMs` elapsed without a response.

### apply-effects-immediately

Apply the resolved effects to internal state on receipt, then pass them down to the orchestrator/worker.
