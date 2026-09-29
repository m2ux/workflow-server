---
metadata:
  version: 1.5.0
---

## Capability

Pause at a checkpoint and surface the yield — or continue immediately when the server replays a recorded response.

## Outputs

### yielded_checkpoint

`<checkpoint_yield>` block signalling the pause (only when status is `yielded`)

### selected_exit

The exit a replayed answer selected (only when status is `replayed` and the reply carries `exit`)

## Protocol

### 1. Yield Gate

- Choose `{$checkpoint_id}`: the activity YAML `id` as written for one-shot gates and for loop-body gates whose first answer should apply to every later iteration; for loop-body gates that need a distinct user decision per iteration, use `<baseId>#<instance>` (base id before `#`, plus a stable per-iteration discriminator — expand a declared `#{...}` template, or use the loop item's id/slug); for a decision the activity does not declare, an id that says what it decides.
- Call `yield_checkpoint { session_index, checkpoint_id }` with `{$checkpoint_id}`, passing the values the steps before the gate produced as `variables_changed`. A declared gate is yielded by its id alone.
  > When the activity does not declare the decision, the call also carries its question as `message` and its answers as `options`.

### 2. Pause Or Continue

- Branch on the response `status`
  - **`yielded`** — the gate is recorded as the session's active checkpoint. Emit the `{yielded_checkpoint}` `<checkpoint_yield>` block with no payload. STOP — make no further tool calls until the orchestrator resumes you.
  - **`replayed`** — a response for this exact `checkpoint_id` is already recorded in this visit of the activity. Apply any returned `effect` / `resolved_option` to local state, and hold a returned `exit.id` as `{selected_exit}`. Where the reply carries `exit.ends_activity`, the stored answer ended the activity at this gate: run none of the remaining steps, and finalize the activity with the steps you ran and `{selected_exit}`. Otherwise CONTINUE with the next step. Do not emit `<checkpoint_yield>`, do not call `present_checkpoint`, and do not re-yield the same id.
    > A `replayed` status is not a fault and not a missing active checkpoint.

## Rules

### base-id-matches-full-string-keys-response

The server matches the checkpoint definition on the base id (before `#`) and keys the recorded response on the full `checkpoint_id` string, including any `#<instance>` suffix.
