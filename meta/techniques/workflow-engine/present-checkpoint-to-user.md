---
metadata:
  version: 1.3.0
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
2. Apply [verify-auto-advance-capability](#verify-auto-advance-capability) against the `present_checkpoint` payload (and the activity definition when needed) before treating the checkpoint as auto-advanceable.
3. Resolve the checklist against the remote before it is published. A gate is reached mid-activity, before that activity's commit, so `git ls-tree -r --name-only origin/{branch} {planning_folder_path}` lists exactly what a reader can open: an item whose artifact is present renders as a link, and one whose artifact is absent renders as plain text. This stops a dead link being published; it does not make an artifact available sooner. It also catches a push that silently failed and an edit made out of band.
4. Call `AskQuestion` with the checkpoint's message and `options[]`. This is the user's only opportunity to respond — it is MANDATORY for every checkpoint, including those with `autoAdvanceMs` set. If `autoAdvanceMs` is set (verified in step 2), configure `AskQuestion`'s timeout to that value with `defaultOption` as the timeout fallback; if the user does not respond within the timer, capture that as `auto_advance: true`. If the user responds, capture their `option_id`. When `autoAdvanceMs` / `defaultOption` are absent, do not auto-advance — wait for an explicit selection.
5. Record the resolved `{user_selection}` — the user's `option_id` and its `effects` (or `auto_advance` / `condition_not_met`).
6. Apply the effects carried on `{user_selection}` to internal state, then pass `{user_selection}` down to the orchestrator or worker awaiting the resolution.

## Rules

### present-before-any-resolution

`present_checkpoint` returning data is not presentation. Every resolution path — `option_id`, `auto_advance`, or `condition_not_met` — MUST be preceded by an `AskQuestion` that displays the checkpoint's message and options. Never skip `AskQuestion` for a sleep + `auto_advance`, even when the default seems obvious. `auto_advance: true` is valid only after `AskQuestion` was shown and `autoAdvanceMs` elapsed without a response.

### verify-auto-advance-capability

Before treating a checkpoint as auto-advanceable, confirm whether `defaultOption` and `autoAdvanceMs` are actually present on the `present_checkpoint` payload (or the checkpoint definition it mirrors). Do not assert auto-advance from memory, prior runs, or prose alone when those fields are absent. Capability is verified, not assumed.
