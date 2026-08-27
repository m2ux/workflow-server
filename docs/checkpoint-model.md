# Checkpoint Model

A workflow sometimes has to stop and ask. Which directory to target, whether a pull request is ready, which of two readings of a request was meant — none of these can be settled from state, and a wrong guess produces work nobody wanted. A **checkpoint** is a declared pause for exactly that question: a gate written into an activity's steps that holds the run until someone answers.

The agent that reaches the gate is not the agent that can ask. Work is [dispatched down a chain of sub-agents](dispatch-model.md), and the ones at the bottom run in the background with no channel to the user, so the question has to travel up to the user-facing agent and the answer has to travel back down. Because the pause comes into being at the moment a worker reaches it rather than being declared ahead of the run, this is just-in-time checkpointing.

## The checkpoint flow

### The worker pauses

On reaching a `kind: checkpoint` step, the worker stops its domain work and calls the server:

```javascript
yield_checkpoint({ session_index, checkpoint_id: "verify-issue" })
```

The server records the pause in the session's `activeCheckpoint` field, stamps it with the time, and answers with a status the worker branches on:

- **`yielded`** — the pause is recorded. The worker emits a `<checkpoint_yield>` block and stops. The block carries no payload; the active checkpoint lives in the session, and whoever presents it reads it from there.
- **`replayed`** — this checkpoint already has a recorded answer. The worker applies that answer and carries straight on, without pausing and without emitting anything.

The replay path is what makes a lost worker cheap. Responses are keyed by activity and checkpoint with no agent component, so a replacement worker re-crossing a gate its predecessor already answered crosses it silently.

Only one checkpoint may be active at a time. Yielding a second while one is outstanding is refused by name, which stops a run nesting pauses it cannot unwind.

A worker that meets a decision its activity never declared may yield one anyway, supplying its own `message` and `options`. A declared gate owns its own wording, so those two fields are refused there.

### The orchestrator relays

The orchestrator is itself a background sub-agent, so it cannot resolve the gate either. It finds the `<checkpoint_yield>` block in the worker's output, echoes it upward unchanged, and goes to sleep.

### The user-facing agent presents and resolves

The top-level agent receives the block and asks what the question is:

```javascript
present_checkpoint({ session_index })
```

The server reads `activeCheckpoint`, finds the matching definition in the workflow, and returns the message, the options, and the effects each option carries. The agent puts those to the user through whatever prompt its host offers, then records the answer:

```javascript
respond_checkpoint({ session_index, option_id: "proceed" })
```

The server clears `activeCheckpoint`, records the decision, and applies each effect on its own terms. A `setVariable` effect is written into the session variable bag. An `exit` effect names one of the activity's declared outcomes; the server reads its destination from the workflow graph and hands both back for the orchestrator to enact, because resolving a checkpoint does not itself move the session. Where the named exit is `immediate`, the response says so, and the activity's remaining steps do not run.

### Three ways to resolve one

| Mode | What it means | Timing |
|------|---------------|--------|
| `option_id` | The user picked this option | At least three seconds must have passed since the pause was recorded |
| `auto_advance` | Take the checkpoint's own `defaultOption` | The full `autoAdvanceMs` must have passed |
| `condition_not_met` | The checkpoint's prerequisite is false, so dismiss it | None |

The server validates the chosen option against the definition, and exactly one of the three modes may be supplied. Both timers are measured from the moment the pause was recorded, so an orchestrator that answers instantly is rejected rather than trusted — a gate resolved in under three seconds cannot have been shown to anyone.

Auto-advance needs both `defaultOption` and `autoAdvanceMs` on the checkpoint. That pair is the whole of softness: a gate declaring both is soft, and a gate that must wait for a person declares neither. Declaring one without the other is a defect.

Dismissal by `condition_not_met` is only open to a checkpoint carrying a structured `condition`; one gated by an inline `when` expression cannot be dismissed this way. The server checks that the condition field is present but cannot check whether it is true, so the agent's evaluation is taken on trust and recorded for audit.

## The resume protocol

With the checkpoint resolved, the agents wake in reverse order through the host's sub-agent resume mechanism. Under single-agent execution the wake is a no-op: the same agent switches back to its worker persona and continues.

The user-facing agent resumes the orchestrator, passing the variable updates in plain text. The orchestrator updates its own state and resumes the worker the same way. The worker then clears its own pause with the server:

```javascript
resume_checkpoint({ session_index })
```

The server verifies that `activeCheckpoint` really has been cleared and returns the recorded effects so the worker can apply them locally. Calling this while the checkpoint is still active is a hard error — the answer has to exist before the worker moves.

## Declaring a checkpoint

A checkpoint is a step in an activity's `steps` list, tagged with its kind:

```yaml
steps:
  - kind: checkpoint
    id: verify-issue
    message: "Please confirm the issue details are correct."
    condition:
      type: simple
      variable: has_issue
      operator: exists
    options:
      - id: proceed
        label: "Proceed"
        description: "Issue details are correct, continue with implementation."
        effect:
          setVariable:
            issue_verified: true
      - id: edit
        label: "Edit Issue"
        description: "Issue needs correction before proceeding."
        effect:
          setVariable:
            issue_verified: false
```

| Field | Role |
|-------|------|
| `id` | Identifies the checkpoint within its activity |
| `message` | The question put to the user |
| `options` | At least one option, each with `id`, `label`, `description` and an optional `effect` |
| `condition` | Structured condition that must hold for the gate to be presented; when false it is skipped |
| `when` | Inline expression alternative to `condition`, and not dismissible by `condition_not_met` |
| `defaultOption` | The answer a soft gate takes when no person is reached; declared with `autoAdvanceMs` |
| `autoAdvanceMs` | Milliseconds the server waits before taking `defaultOption`; declared with it |
| `ref` | Names a shared checkpoint body instead of writing one inline |
| `required` | Authoring metadata |

A checkpoint used at several sites is declared once as a fragment under `fragments.checkpoints` in the owning workflow's `workflow.yaml`, and each site imports it with `ref`. The site keeps only its own `id`, the `ref`, and a `condition` where the fragment declares none. The loader splices the fragment body into the step before delivery, so every consumer downstream sees an ordinary checkpoint. The `check:fragments` guard rejects an inline body that duplicates a fragment.

## Where a checkpoint belongs

A checkpoint's position in the step list decides whether its answer can steer anything. Every step
gated on a variable the checkpoint decides has to run after it: a gate reading an unbound variable is
false, so the step is skipped, and the answer arrives with nothing left to apply it to. The run
completes, having asked a question that changed nothing.

`check:decision-order` holds the line mechanically — it reports a checkpoint whose decision a step
before it is already gated on. Five cases are exempt, because in each the earlier read has an answer
or loses nothing by not firing:

| Exempt | Why |
|--------|-----|
| The variable declares a `defaultValue` | Seeding puts it in the bag at session creation, so the earlier gate reads the default rather than nothing |
| The earlier gate reads by `exists` / `notExists` | A presence test answers on a missing variable; absence is one of its two answers |
| The earlier step only messages or logs | An announcement that does not fire costs nothing, and gating one on a not-yet-decided value is the ordinary way to stay quiet until it is known |
| The deciding option carries an `exit` | Leaving the activity sends the run back through the earlier step on its next visit, which then reads what the option wrote |
| The two gates demand incompatible values of one variable | No single run reaches both steps, so the earlier one was never waiting on this decision |

The last two carve out the corpus's standard way of settling a value: a technique derives it, an
announcement reports it when the derivation was confident, a checkpoint decides it when the derivation
was ambiguous, and the announcement and the checkpoint carry opposite gates on the ambiguity flag. On
the corpus the guard was written against, the rule without its exemptions reports 14 pairs and 12 of
them are that shape or one of the other four; every exemption is load-bearing, and removing any single
one puts a working pattern back on the report.

Requirements come from conjuncts only. An `or` proves nothing about which branch a run took, so a
gate built from one contributes no exclusion — the guard reports rather than assumes.

Positioning interacts with the entry rule: `check:checkpoint-entry` refuses a checkpoint as an
activity's first step, because that dispatch pays full delivery and yields before doing any work. A
decision that has to precede all of an activity's work belongs at the preceding activity's tail or as
the orchestrator's precondition on dispatching at all.

## What the design buys

**Background agents never try to prompt.** A sub-agent with no user channel that attempts to ask a question hangs. Routing every question to the one agent that has a channel is what keeps that from happening.

**Relaying costs nothing to understand.** The orchestrator in the middle passes a block it never parses. It needs no view of the question, the options or the effects, so a gate can be added to an activity without touching anything between the worker and the user.

**The pause survives the agent.** Because the active checkpoint and its answer live in the session rather than in an agent's context, a worker that dies mid-gate loses no decision. Its replacement replays the answer and continues.

**Instant resolution is refused.** The two timers make the cheapest way to fake a checkpoint fail. They cannot prove a human saw the question, which [workflow fidelity](workflow-fidelity.md) records among its limits.
