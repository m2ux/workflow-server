---
metadata:
  version: 1.4.0
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

### 1. Yield Gate

- Choose `{checkpoint_id}`: the activity YAML `id` as written for one-shot gates and for loop-body gates whose first answer should apply to every later iteration; for loop-body gates that need a distinct user decision per iteration, use `<baseId>#<instance>` (base id before `#`, plus a stable per-iteration discriminator — expand a declared `#{...}` template, or use the loop item's id/slug). Call `yield_checkpoint { session_index, checkpoint_id }` with the id alone — a declared gate owns its message and options, and sending either is refused — passing the values the steps before the gate produced as `variables_changed` so a gate message that interpolates them has them to render; omit it when those steps produced nothing.
- A decision the activity does not declare takes a `checkpoint_id` of its own choosing that says what it decides, plus `message` and at least two `options`, each with an `id` and a `label`.

### 2. Pause Or Continue

- Branch on the response `status`
  - **`yielded`** — the gate is recorded as the session's active checkpoint. Emit the `{yielded_checkpoint}` `<checkpoint_yield>` block (no payload — the active checkpoint is server-resident and is read with `present_checkpoint` by the agent that presents it). STOP — make no further tool calls until the orchestrator resumes you.
  - **`replayed`** — a response for this exact `checkpoint_id` is already recorded in this visit of the activity; entering an activity clears the answers an earlier visit recorded. Apply any returned `effect` / `resolved_option` to local state. Where the reply carries `exit.ends_activity`, the stored answer ended the activity at this gate: run none of the remaining steps, and finalize the activity with the steps you ran and `exit.id` as its `selected_exit`. Otherwise CONTINUE with the next step. Do not emit `<checkpoint_yield>`, do not call `present_checkpoint`, and do not re-yield the same id.

## Rules

### replay-is-continue-not-error

`status: "replayed"` means continue under the stored decision; where that decision selected an exit that ends the activity, continuing is finalizing the activity at this gate. It is not a fault, not a missing active checkpoint, and not a reason to yield again.

### base-id-matches-full-string-keys-response

The server matches the checkpoint definition on the base id (before `#`) and keys the recorded response on the full `checkpoint_id` string, including any `#<instance>` suffix.
