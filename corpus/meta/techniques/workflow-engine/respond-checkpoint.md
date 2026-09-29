---
metadata:
  version: 1.8.0
---

## Capability

Send the user's selection back to the server, clearing the active checkpoint.

## Inputs

### checkpoint_resolution

`{ option_id, reply }` | `{ auto_advance: true }` | `{ condition_not_met: true }`. `reply` is the text the user typed with an option whose effect declares `recordReply`, and is absent for any other option.

## Outputs

### checkpoint_reply

The reply the server returns on clearing the active checkpoint: `resolved_option`, the option taken; `effect`, its `setVariable` assignments, the variable `recordReply` stored the reply in, and `exit`; `exit`, the selected exit with its `next_activity`, carrying `ends_activity` where selecting it ends the activity at this gate; and `dismissed`, set on a `condition_not_met` resolution, which selects no option.

## Protocol

### 1. Verify Auto-Advance

- When `{checkpoint_resolution}` is `{ auto_advance: true }`, confirm the gate is one the definition declares soft, per `present-checkpoint-to-user.verify-auto-advance-capability`, before calling `respond_checkpoint`.
  > `auto_advance: true` is valid only on a soft gate, and the server refuses it on a gate that carries no such declaration. Never resolve a hard gate by auto-advance.

### 2. Clear Active Gate

- Call `respond_checkpoint { session_index, ...checkpoint_resolution }`; it clears the active checkpoint and returns its reply. Capture the reply as `{checkpoint_reply}` and propagate it to the worker on resume.
  > - When the call returns `no active checkpoint on session`, there is no active checkpoint to resolve: verify `{session_index}` references the correct worker session and that an active checkpoint was reported before this call.
  > - When the call returns `Invalid option`, STOP. Apply [present-checkpoint-to-user](./present-checkpoint-to-user.md) on the same `{session_index}` to retrieve the valid options. Never guess.
  > - When the call refuses an option that records the user's typed reply, the reply was not captured: apply [present-checkpoint-to-user](./present-checkpoint-to-user.md) on the same `{session_index}` to ask for it. Never compose it.

## Rules

### auto-advance-spends-the-declared-interval

The server refuses `auto_advance: true` until the gate's declared interval has elapsed since it was yielded. A resolution that must not wait takes the headless path of `present-checkpoint-to-user.present-before-any-resolution`, which makes no call.

### dismiss-only-a-gate-whose-condition-is-false

`condition_not_met: true` is the resolution for a checkpoint whose declared `condition` evaluates false against the run's variable bag, and clears the gate without a decision. The server refuses it on a checkpoint carrying no `condition`. Never use it to clear a gate whose condition holds.
