---
metadata:
  version: 1.4.0
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
2. Apply [verify-auto-advance-capability](#verify-auto-advance-capability) against the `present_checkpoint` payload (and the activity definition when needed) to establish whether the gate is soft or hard.
3. Resolve the checklist against the remote before it is published. A gate is reached mid-activity, before that activity's commit, so `git ls-tree -r --name-only origin/{branch} {planning_folder_path}` lists exactly what a reader can open: an item whose artifact is present renders as a link, and one whose artifact is absent renders as plain text. This stops a dead link being published; it does not make an artifact available sooner. It also catches a push that silently failed and an edit made out of band.
4. Read `{headless_mode}` from the session's variable bag to establish which resolution path this run takes. A run whose bag does not hold the name is interactive.
5. On the interactive path, and on every hard gate whatever the run's mode: call `AskQuestion` with the checkpoint's message and `options[]`, and wait for an explicit selection. This is the user's only opportunity to respond. Capture their `option_id`.
6. On the headless path, and only for a soft gate: resolve to `defaultOption` without `AskQuestion`, and record that the resolution reached no user. The audit record carries the distinction, so a reader of the session can tell a person's answer from a default.
7. Record the resolved `{user_selection}` — the `option_id` and its `effects` (or `auto_advance` / `condition_not_met`).
8. Apply the effects carried on `{user_selection}` to internal state, then pass `{user_selection}` down to the orchestrator or worker awaiting the resolution.

## Rules

### softness-is-the-field-pair

A checkpoint declaring both `defaultOption` and `autoAdvanceMs` is soft: it carries an answer the run may take when no person is reached. A checkpoint declaring neither is hard: it resolves only on an explicit selection. There is no third spelling and no partial declaration — a checkpoint declares both fields or neither.

### present-before-any-resolution

`present_checkpoint` returning data is not presentation. A hard gate's every resolution path — `option_id` or `condition_not_met` — is preceded by an `AskQuestion` that displays the checkpoint's message and options, whatever mode the run is in. A soft gate is presented the same way on an interactive run. `{headless_mode}` is the one exception this contract admits, and it reaches only a soft mid-flow gate: that gate resolves to its `defaultOption` with no `AskQuestion`. This rule is the single home for when a checkpoint is presented; a workflow states its own gating in `condition`, and defers to this rule for the presentation question.

### never-soft-when-the-answer-authorises

A gate whose subject is content the resolving dispatch itself authored declares no `defaultOption` when its default would authorise rather than record. A default that records a judgement the run can stand behind — a comprehension check, a convergence assessment — is legitimate softness. A default that creates, publishes, pushes, approves, attests, or admits work into a later stage is a decision no agent takes on the user's behalf, so that gate is hard. The discriminator is what the default does, not who is watching: the same test the repo's review-mode gating guard applies to a review-reachable default, applied here to the author of the content under review.

### verify-auto-advance-capability

Before treating a checkpoint as auto-advanceable, confirm whether `defaultOption` and `autoAdvanceMs` are actually present on the `present_checkpoint` payload (or the checkpoint definition it mirrors). Do not assert auto-advance from memory, prior runs, or prose alone when those fields are absent. Capability is verified, not assumed.

### the-interval-times-the-server-route

`autoAdvanceMs` states the interval the server spends before it applies a `defaultOption` on `respond_checkpoint { auto_advance: true }`: that call is refused until the full interval has elapsed since the gate was yielded. The headless path of `present-before-any-resolution` spends no interval, because no call is made and no one is waiting — there the pair's presence is what marks the gate soft. A gate that must spend wall-clock before its default applies is resolved through `respond_checkpoint`.
