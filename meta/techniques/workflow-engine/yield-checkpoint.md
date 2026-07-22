---
metadata:
  version: 1.1.0
---

## Capability

Pause at a checkpoint and surface the yield — or continue immediately when the server replays a recorded response.

## Inputs

### checkpoint_id

ID of the checkpoint being yielded — the activity YAML `id`, or `<baseId>#<instance>` for a per-iteration loop-body decision.

## Outputs

### yielded_checkpoint

`<checkpoint_yield>` block signalling the pause (only when status is `yielded`)

## Protocol

1. Choose `{checkpoint_id}`: the activity YAML `id` as written for one-shot gates and for loop-body gates whose first answer should apply to every later iteration; for loop-body gates that need a distinct user decision per iteration, use `<baseId>#<instance>` (base id before `#`, plus a stable per-iteration discriminator — expand a declared `#{...}` template, or use the loop item's id/slug). Call `yield_checkpoint { session_index, checkpoint_id }`.
2. Branch on the response `status`:
   - **`yielded`** — the server recorded `session.json#activeCheckpoint`. Emit the `{yielded_checkpoint}` `<checkpoint_yield>` block (no payload required — the active checkpoint is server-resident and is read by the orchestrator via `present_checkpoint`). STOP — make no further tool calls until the orchestrator resumes you.
   - **`replayed`** — a response for this exact `checkpoint_id` is already recorded. Apply any returned `effect` / `resolved_option` to local state and CONTINUE with the next step. Do not emit `<checkpoint_yield>`, do not call `present_checkpoint`, and do not re-yield the same id.

## Rules

### replay-is-continue-not-error

`status: "replayed"` means continue under the stored decision. It is not a fault, not a missing active checkpoint, and not a reason to stop the activity.

### base-id-matches-full-string-keys-response

The server matches the checkpoint definition on the base id (before `#`) and keys the recorded response on the full `checkpoint_id` string, including any `#<instance>` suffix.
