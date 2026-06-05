---
metadata:
  version: 1.0.0
---

## Capability

Load the active checkpoint's details and present them to the user.

## Inputs

### session_index

`session_index` of the worker whose active checkpoint is being presented

## Output

### selection

`{ option_id, effects }` — captured user response

## Protocol

1. Call `present_checkpoint { session_index }`; the server reads the active checkpoint from `session.json#activeCheckpoint` and returns its message + options.
2. Call `AskQuestion` with the checkpoint's message and `options[]`. This is the user's only opportunity to respond — it is MANDATORY for every checkpoint, including those with `autoAdvanceMs` set. If `autoAdvanceMs` is set, configure `AskQuestion`'s timeout to that value with `defaultOption` as the timeout fallback; if the user does not respond within the timer, capture that as `auto_advance: true`. If the user responds, capture their `option_id`.
3. Capture the user's `option_id` (or `auto_advance` / `condition_not_met`).

## Errors

### no_active_checkpoint

**Cause:** `present_checkpoint` returned `no active checkpoint on session`.

**Recovery:** The worker has not yielded a checkpoint, or the previous checkpoint was already resolved. Re-check that you are presenting against the correct `session_index`.

## Rules

### no-auto-resolution

NEVER auto-resolve a checkpoint without first presenting it. `auto_advance: true` is only valid after `AskQuestion` has been shown to the user and the `autoAdvanceMs` timer has elapsed without a response. Skipping `AskQuestion` and going straight to a sleep + `auto_advance` is a protocol violation, even when the default option seems obvious from prior context or prior user input on a different checkpoint.

### present-before-any-resolution

`present_checkpoint` returning data is not the same as presenting to the user. Every checkpoint resolution path — `option_id`, `auto_advance`, or `condition_not_met` — MUST be preceded by an `AskQuestion` that displays the checkpoint's message and options. All checkpoints block; `autoAdvanceMs` is a fallback for when the user does not respond, not a license to skip the prompt.

### apply-effects-immediately

Apply the resolved effects to internal state on receipt, then pass them down to the orchestrator/worker.
