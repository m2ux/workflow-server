# Checkpoint Model (JIT Checkpointing)

The Workflow Server utilizes a **Just-In-Time (JIT) Checkpoint Model** to handle execution pauses. Checkpoints are declarative gates defined within activity steps that halt the workflow until an external condition is met—usually explicit user confirmation.

Because the system uses a [Hierarchical Dispatch Model](dispatch_model.md), sub-agents (workers) do not have the authority or capability to ask the user questions directly. Checkpoints must therefore "bubble up" from the executing worker to the top-level user-facing agent.

## The Checkpoint Flow

### 1. Yielding at the Worker (Level 2)
When an Activity Worker reaches a step that defines a `checkpoint` ID, it halts its domain work and calls the server API:
```javascript
yield_checkpoint({ session_token, checkpoint_id: "verify-issue" })
```
The server marks the session token as blocked (setting the `bcp` field) and returns a new token string. The worker uses this token string as the `checkpoint_handle`.

To pass this pause up the chain, the worker outputs a specialized JSON block in its final text response and stops:
```json
<checkpoint_yield>
{
  "checkpoint_handle": "<opaque_token_string>"
}
</checkpoint_yield>
```

### 2. Relaying through the Orchestrator (Level 1)
The Workflow Orchestrator (a background sub-agent) receives the worker's text output. It sees the `<checkpoint_yield>` block and recognizes that the worker is blocked. 

The Workflow Orchestrator does not attempt to resolve the checkpoint itself. It simply echoes the exact same `<checkpoint_yield>` block up to its parent in its own final text response and goes to sleep.

### 3. Presenting and Resolving at the Meta Orchestrator (Level 0)
The Meta Orchestrator (the user-facing agent) receives the yield block. It extracts the `checkpoint_handle` and queries the server for the human-readable metadata:
```javascript
present_checkpoint({ checkpoint_handle: "<opaque_token_string>" })
```
The server decodes the handle, locates the specific checkpoint in the workflow definition, and returns the `prompt`, `options`, and effects.

The Meta Orchestrator then calls its UI tool (e.g., Cursor's `AskQuestion`) to present the options to the human user.

Once the user selects an option, the Meta Orchestrator finalizes the resolution on the server:
```javascript
respond_checkpoint({ checkpoint_handle: "<opaque_token_string>", option_id: "proceed" })
```
The server clears the `bcp` block, records the decision, and returns any state updates (`effects`, such as variable changes) associated with the user's choice.

## The Resume Protocol

Once the server has resolved the checkpoint, the agents must be woken back up in reverse order using the `Task(resume=...)` mechanism.

**Waking the Orchestrator (L0 → L1):**
The Meta Orchestrator resumes the Workflow Orchestrator, passing the effects via plain text conversation:
> "The checkpoint has been resolved. Please update your state with these variables: `is_monorepo = true`. Resume the worker."

**Waking the Worker (L1 → L2):**
The Workflow Orchestrator updates its internal JSON state tracker, and then resumes the Activity Worker:
> "The checkpoint has been resolved. Apply these variable updates: `is_monorepo = true`. Call `resume_checkpoint` to proceed."

**Clearing the Local Lock (L2 API Call):**
Because the Activity Worker needs a cryptographically valid, unblocked token to continue calling server tools (like `next_activity`), it must make one final API call:
```javascript
resume_checkpoint({ session_token: "<checkpoint_handle>" })
```
The server verifies that the checkpoint was successfully resolved by the Meta Orchestrator, and returns a fresh, unblocked session token. The Activity Worker uses this new token to execute the next step in its activity.

---

## Why this Architecture?

1. **Clean UI Boundaries:** Sub-agents running in hidden background tasks never attempt to prompt the user directly, preventing frozen processes.
2. **Stateless Hand-offs:** The `checkpoint_handle` encapsulates all necessary state cryptographically. The intermediate agents don't need to parse, understand, or store the checkpoint's prompt or options.
3. **Conversation as State:** Variable effects are passed down through natural language prompts during the `Task` resume sequence, eliminating the need to write intermediate state to disk just to sync the agents.