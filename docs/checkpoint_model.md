# Checkpoint Model (JIT Checkpointing)

The Workflow Server utilizes a **Just-In-Time (JIT) Checkpoint Model** to handle execution pauses. Checkpoints are declarative gates defined within activity steps that halt the workflow until an external condition is met—usually explicit user confirmation.

Because the system uses a [Hierarchical Dispatch Model](dispatch_model.md), sub-agents (workers) do not have the authority or capability to ask the user questions directly. Checkpoints must therefore "bubble up" from the executing worker to the top-level user-facing agent.

## The Checkpoint Flow

### 1. Yielding at the Worker (Level 2)
When an Activity Worker reaches a step that defines a `checkpoint` ID, it halts its domain work and calls the server API:
```javascript
yield_checkpoint({ session_index, checkpoint_id: "verify-issue" })
```
The server records the active checkpoint in the session's `session.json` (`activeCheckpoint`) and mints a one-shot `checkpoint_handle` (an opaque, HMAC-signed string) that the worker passes up the chain. The persistent session state continues to live under `session_index`; the handle is purely a transport for the JIT bubble-up.

**Hard gate during yield:** Cannot yield a new checkpoint while another checkpoint is already active in `session.json`. This prevents nested checkpoint yields.

To pass this pause up the chain, the worker outputs a specialized JSON block in its final text response and stops:
```json
<checkpoint_yield>
{
  "checkpoint_handle": "<opaque_handle_string>"
}
</checkpoint_yield>
```

### 2. Relaying through the Orchestrator (Level 1)
The Workflow Orchestrator (a background sub-agent) receives the worker's text output. It sees the `<checkpoint_yield>` block and recognizes that the worker is blocked.

The Workflow Orchestrator does not attempt to resolve the checkpoint itself. It simply echoes the exact same `<checkpoint_yield>` block up to its parent in its own final text response and goes to sleep.

### 3. Presenting and Resolving at the Meta Orchestrator (Level 0)
The Meta Orchestrator (the user-facing agent) receives the yield block. It extracts the `checkpoint_handle` and queries the server for the human-readable metadata:
```javascript
present_checkpoint({ checkpoint_handle: "<opaque_handle_string>" })
```
The server decodes the handle, looks up the active checkpoint recorded in `session.json`, locates the matching checkpoint in the workflow definition, and returns the message, options, and effects.

The Meta Orchestrator then calls its host UI tool (e.g., Cursor's `AskQuestion`, Claude Code's interactive prompts) to present the options to the human user.

Once the user selects an option, the Meta Orchestrator finalizes the resolution on the server:
```javascript
respond_checkpoint({ checkpoint_handle: "<opaque_handle_string>", option_id: "proceed" })
```
The server clears `activeCheckpoint` from `session.json`, records the decision and any `effects` in the persistent session state, and returns those effects to the caller. Enforcement is per-effect: `setVariable` is applied to the session variable bag, `skipActivities` is recorded in `skippedActivities` bookkeeping, and `transitionTo` is returned for the orchestrator to enact via `next_activity` — resolving the checkpoint does not itself move the session.

**Three resolution modes:**

1. **`option_id`** — The user's selected option. The server validates the option against the checkpoint definition and enforces a minimum response time (default 3 seconds since the checkpoint was yielded). This prevents instant auto-resolve without user interaction.

2. **`auto_advance: true`** — For checkpoints that define both `defaultOption` and `autoAdvanceMs`, the server uses the `defaultOption` but only after the full timer has elapsed. The elapsed time is measured from the `yieldedAt` timestamp recorded in `session.json` when the checkpoint was yielded. The server checks only those two fields — `blocking` is an orchestrator directive it does not consult, so a checkpoint intended to block must not declare `defaultOption`/`autoAdvanceMs`.

3. **`condition_not_met: true`** — Dismisses a conditional checkpoint whose prerequisite evaluated to false. Only valid when the checkpoint has a structured `condition` field; a checkpoint gated with the inline `when` expression is not dismissible this way. The server validates the presence of the condition field but cannot verify the condition's actual truth value — the agent evaluates it.

## The Resume Protocol

Once the server has resolved the checkpoint, the agents must be woken back up in reverse order using the host's sub-agent resume mechanism (e.g., Cursor's `Task(resume=…)`). For inline (single-agent) execution, the "wake" is a no-op — the same agent simply switches persona back to the worker and continues.

**Waking the Orchestrator (L0 → L1):**
The Meta Orchestrator resumes the Workflow Orchestrator, passing the effects via plain text conversation:
> "The checkpoint has been resolved. Please update your state with these variables: `is_monorepo = true`. Resume the worker."

**Waking the Worker (L1 → L2):**
The Workflow Orchestrator updates its internal JSON state tracker, and then resumes the Activity Worker:
> "The checkpoint has been resolved. Apply these variable updates: `is_monorepo = true`. Call `resume_checkpoint` to proceed."

**Clearing the Local Lock (L2 API Call):**
Before the Activity Worker can resume calling regular workflow tools (like `next_activity`), it must signal the unblock to the server with its `session_index` and the one-shot handle:
```javascript
resume_checkpoint({ session_index, checkpoint_handle: "<opaque_handle_string>" })
```
The server verifies that the checkpoint has been resolved (by the Meta Orchestrator) and that `activeCheckpoint` is cleared in `session.json`, then returns the recorded variable effects so the worker can apply them locally. The Activity Worker uses its existing `session_index` for the next step.

**Hard gate on resume:** `resume_checkpoint` throws a hard error if `activeCheckpoint` is still set in `session.json` — the checkpoint must be resolved before the worker can proceed.

## Checkpoint Schema

Checkpoints are defined in activity YAML files with this structure:

```yaml
checkpoints:
  - id: verify-issue
    name: "Verify Issue"
    message: "Please confirm the issue details are correct."
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
    condition:
      type: simple
      variable: has_issue
      operator: exists
```

Fields:
- `id` — Unique identifier for the checkpoint within the activity
- `name` — Human-readable name
- `message` — Prompt text presented to the user
- `condition` — Optional `ConditionSchema` that must be true for the checkpoint to be presented. If false, the checkpoint is skipped.
- `options` — Array of at least one option, each with `id`, `label`, `description`, and optional `effect`
- `defaultOption` — Optional option ID to auto-select when `autoAdvanceMs` elapses
- `autoAdvanceMs` — Optional milliseconds to wait before auto-selecting `defaultOption`

## Why this Architecture?

1. **Clean UI Boundaries:** Sub-agents running in hidden background tasks never attempt to prompt the user directly, preventing frozen processes.
2. **Stateless Hand-offs:** The `checkpoint_handle` encapsulates all necessary state cryptographically. The intermediate agents don't need to parse, understand, or store the checkpoint's prompt or options.
3. **Conversation as State:** Variable effects are passed down through natural language prompts during the `Task` resume sequence, eliminating the need to write intermediate state to disk just to sync the agents.
4. **Timing Enforcement:** Minimum response times and auto-advance timers prevent gaming of the checkpoint system.
5. **Flexible Resolution:** Three resolution modes (option selection, auto-advance, conditional dismissal) cover all checkpoint use cases without requiring separate tool implementations.
