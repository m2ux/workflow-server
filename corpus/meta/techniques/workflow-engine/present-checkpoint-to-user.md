---
metadata:
  version: 1.10.0
---

## Capability

Load the active checkpoint's details and present them to the user.

## Inputs

### session_index

`session_index` of the worker whose active checkpoint is being presented

### headless_mode

*(optional)* Whether the run resolves a soft mid-flow gate to its default without reaching a person. Unset on an interactive run.

## Outputs

### user_selection

`{ option_id, effects }` — captured user response

## Protocol

### 1. Load Active Checkpoint

- Call `present_checkpoint { session_index }`; it returns the active checkpoint's message and options. If this returns `no active checkpoint on session`, the worker has not yet yielded a checkpoint or the previous one was already resolved — re-check that you are presenting against the correct `{session_index}`.

### 2. Establish Gate Softness

- Read whether the gate is soft or hard from the `present_checkpoint` payload, or from the checkpoint definition it mirrors where the payload leaves it unsettled, per verify-auto-advance-capability.

### 3. Resolve Published Links

- Resolve the checklist against the remote before it is published. A gate is reached mid-activity, before that activity's commit, so `git -C {host_repo_path} rev-parse --abbrev-ref HEAD` names the session branch `{$branch}`, and `git -C {host_repo_path} ls-tree -r --name-only origin/{branch} {planning_folder_path}` lists exactly what a reader can open: an item whose artifact is present renders as a link, and one whose artifact is absent renders as plain text. This stops a dead link being published; it does not make an artifact available sooner. It also catches a push that silently failed and an edit made out of band.

### 4. Pick Resolution Path

- Take the resolution path this run uses from `{headless_mode}` — interactive where it is unset.

### 5. Put Gate To User

- On the interactive path, and on every hard gate whatever the run's mode: put the checkpoint's message and its `options[]` to the user through the host's own question primitive, and wait for an explicit selection. This is the user's only opportunity to respond. Capture their `option_id`.

### 6. Apply Declared Answer

- On the headless path, and only for a soft gate: resolve to the answer the gate declares without putting anything to the user, and record that the resolution reached no user. The audit record carries the distinction, so a reader of the session can tell a person's answer from a default.

### 7. Capture Selection

- Record the resolved `{user_selection}` — the `option_id` and its `effects` (or `auto_advance` / `condition_not_met`).

### 8. Relay Selection

- Apply the effects carried on `{user_selection}` to internal state, then pass `{user_selection}` down to the orchestrator or worker awaiting the resolution.

## Rules

### softness-is-declared

A gate is **soft** when it declares an answer the run may take where no person is reached, and **hard** when it does not: a hard gate resolves only on an explicit selection. Which fields carry that declaration, and the refusal of a gate that declares half of it, are the definition schema's — verify-auto-advance-capability is how a presenter reads them off the gate in front of it. The declared interval is spent by the resolving call, per respond-checkpoint.auto-advance-spends-the-declared-interval; the headless path below makes no such call and spends none, so there the declaration only marks the gate soft.

### present-before-any-resolution

`present_checkpoint` returning data is not presentation. A hard gate's every resolution path — `option_id` or `condition_not_met` — is preceded by the host's question primitive displaying the checkpoint's message and options, whatever mode the run is in. A soft gate is presented the same way on an interactive run. `{headless_mode}` is the one exception, and it reaches only a soft mid-flow gate: that gate resolves to its declared answer with nothing put to the user. This rule is the single home for when a checkpoint is presented — a workflow states which gates it has and what opens them, and says nothing about presentation.

### a-correction-lands-in-the-bag

A reply that corrects a value, rather than only selecting an option, is written into the variable bag against the value it corrects — so every later gate and step reads the corrected one. A correction held in the resolving agent's own reasoning is unreadable to the worker that acts on it next, and to anyone reading the session afterwards.

### never-soft-when-the-answer-authorises

A gate whose subject is content the resolving dispatch itself authored is hard when the answer it would take unattended authorises rather than records. A default that records a judgement the run can stand behind — a comprehension check, a convergence assessment — is legitimate softness. A default that creates, publishes, pushes, approves, attests, or admits work into a later stage is a decision no agent takes on the user's behalf, so that gate is hard. The discriminator is what the default does, not who is watching.

### verify-auto-advance-capability

A gate's softness is whatever the gate in front of you declares, and the checkpoint schema defines which fields carry that declaration. Never assert it from memory, from a prior run, or from prose — capability is verified, not assumed.
