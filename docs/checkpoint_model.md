# Checkpoint Model (JIT Checkpointing)

The Workflow Server utilizes a **Just-In-Time (JIT) Checkpoint Model** to handle execution pauses. Checkpoints are declarative gates defined within activity steps that halt the workflow until an external condition is met—usually explicit user confirmation.

Because the system uses a [Hierarchical Dispatch Model](dispatch_model.md), sub-agents (workers) do not have the authority or capability to ask the user questions directly. Checkpoints must therefore "bubble up" from the executing worker to the top-level user-facing agent.

The checkpoint protocol uses a single token type throughout: **the `session_token` returned by `yield_checkpoint` IS the checkpoint handle.** Once `bcp` (blocking checkpoint) is set on that token, the server recognizes the token as a checkpoint handle for `present_checkpoint` and `respond_checkpoint`. There is no separate `checkpoint_handle` parameter or field — the API was collapsed in feat/112 (see [API Reference → Breaking Changes](api-reference.md#breaking-changes)).

## Interceptor and the Agent's View of the Protocol

When the workflow-server interceptor is installed in the host harness (see [interceptor recipe](interceptor-recipe.md)), the harness automatically rewrites outgoing MCP calls to inject the most recently captured `session_token` and captures the updated token from each response's `_meta`. From the LLM's perspective:

- The **worker** at L2 still calls `yield_checkpoint` explicitly and reads the returned `session_token` from the response body, because that token must be embedded literally inside the `<checkpoint_yield>` text block — the harness does not rewrite text content. The yield-time token (the checkpoint handle) is captured by the PostToolUse hook into `current.token`, so subsequent orchestrator calls automatically receive it.
- The **orchestrator** at L1 / L0 calls `present_checkpoint` and `respond_checkpoint` without supplying `session_token` in `tool_input`; the interceptor injects the captured handle from `current.token`. The orchestrator only needs to provide the user's decision (`option_id`, `auto_advance`, or `condition_not_met`).
- The advanced `session_token` returned by `respond_checkpoint` is captured by the PostToolUse hook and flows downward via the resume conversation to the worker, which then passes it to `resume_checkpoint` (again injected automatically by the interceptor).

Without an interceptor, the LLM must thread the same token explicitly at each step; the wire shape is identical either way.

## The Checkpoint Flow

### 1. Yielding at the Worker (Level 2)
When an Activity Worker reaches a step that defines a `checkpoint` ID, it halts its domain work and calls the server API:
```javascript
yield_checkpoint({ session_token, checkpoint_id: "verify-issue" })
```
The server marks the session token as blocked (setting the `bcp` field) and returns an advanced `session_token` in the response. This bcp-bearing token IS the checkpoint handle.

**Hard gate during yield:** Cannot yield a new checkpoint while another checkpoint (`bcp`) is already active. This prevents nested checkpoint yields.

To pass this pause up the chain, the worker outputs a specialized JSON block in its final text response and stops:
```json
<checkpoint_yield>
{
  "session_token": "<opaque_token_string_with_bcp>"
}
</checkpoint_yield>
```

### 2. Relaying through the Orchestrator (Level 1)
The Workflow Orchestrator (a background sub-agent) receives the worker's text output. It sees the `<checkpoint_yield>` block and recognizes that the worker is blocked.

The Workflow Orchestrator does not attempt to resolve the checkpoint itself. It simply echoes the exact same `<checkpoint_yield>` block up to its parent in its own final text response and goes to sleep.

### 3. Presenting and Resolving at the Meta Orchestrator (Level 0)
The Meta Orchestrator (the user-facing agent) receives the yield block. It extracts the `session_token` and queries the server for the human-readable metadata:
```javascript
present_checkpoint({ session_token: "<opaque_token_string_with_bcp>" })
```
The server decodes the token, locates the checkpoint in the workflow definition using the token's `wf`, `act`, and `bcp` fields, and returns the message, options, and effects.

The Meta Orchestrator then calls its UI tool (e.g., Cursor's `AskQuestion`) to present the options to the human user.

Once the user selects an option, the Meta Orchestrator finalizes the resolution on the server:
```javascript
respond_checkpoint({ session_token: "<opaque_token_string_with_bcp>", option_id: "proceed" })
```
The server clears the `bcp` block, records the decision, and returns an advanced `session_token` plus any state updates (`effects`, such as variable changes) associated with the user's choice.

**Three resolution modes:**

1. **`option_id`** — The user's selected option. The server validates the option against the checkpoint definition and enforces a minimum response time (default 3 seconds since the checkpoint was yielded). This prevents instant auto-resolve without user interaction.

2. **`auto_advance: true`** — For non-blocking checkpoints with `autoAdvanceMs`, the server uses the `defaultOption` but only after the full timer has elapsed. The elapsed time is estimated from the token's `ts` timestamp.

3. **`condition_not_met: true`** — Dismisses a conditional checkpoint whose prerequisite evaluated to false. Only valid when the checkpoint has a `condition` field. The server validates the presence of the condition field but cannot verify the condition's actual truth value.

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
resume_checkpoint({ session_token: "<advanced_session_token_from_respond>" })
```
The worker calls `resume_checkpoint` with the session token returned by `respond_checkpoint` (relayed down the resume chain, or auto-injected by the interceptor). The server verifies that the checkpoint was successfully resolved by the Meta Orchestrator (checking that `bcp` is cleared), and returns a fresh, unblocked session token. The Activity Worker uses this new token to execute the next step in its activity.

**Hard gate on resume:** `resume_checkpoint` throws a hard error if `bcp` is still active — the checkpoint must be resolved before the worker can proceed.

## Checkpoint Schema

Checkpoints are defined in activity TOON files with this structure:

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
2. **Stateless Hand-offs:** The bcp-bearing `session_token` encapsulates all necessary state cryptographically. The intermediate agents don't need to parse, understand, or store the checkpoint's prompt or options.
3. **Conversation as State:** Variable effects are passed down through natural language prompts during the `Task` resume sequence, eliminating the need to write intermediate state to disk just to sync the agents.
4. **Timing Enforcement:** Minimum response times and auto-advance timers prevent gaming of the checkpoint system.
5. **Flexible Resolution:** Three resolution modes (option selection, auto-advance, conditional dismissal) cover all checkpoint use cases without requiring separate tool implementations.
