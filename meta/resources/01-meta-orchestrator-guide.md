---
id: meta-orchestrator-guide
version: 1.1.0
---

# Meta Orchestrator Guide

This guide is exclusively for the **meta-orchestrator** (the top-level agent running the `meta` workflow).

## 4. Dispatching a Client Workflow

The top-level `meta-orchestrator` starts a client workflow by calling `dispatch_workflow`:
- **dispatch_workflow(`workflow_id`, `parent_session_token`, `variables`)** — Creates a new, independent client session. It returns a dispatch package containing:
  - `client_session_token` — the token the `workflow-orchestrator` uses
  - `client_session_id` — the sid for trace correlation
  - `initial_activity` — the first activity to execute
  - `client_prompt` — the pre-composed prompt for the `workflow-orchestrator`
- Save `client_session_token` and `client_session_id` in session state.
- Spawn a new agent (Task/sub-agent) with the `client_prompt`.
- **Note:** The `workflow-orchestrator` does NOT inherit the `meta-orchestrator`'s token. They are independent sessions.

The `meta-orchestrator` does NOT manage transitions or poll. It dispatches the `workflow-orchestrator` and awaits the result:
- **workflow_complete:** Apply `variables_changed` to session state, record completion, proceed to end-workflow.

## 5. The Checkpoint Gate

**The top-level `meta-orchestrator` is the ONLY agent permitted to call `AskQuestion` (Cursor) or `AskUserQuestion` (Claude Code) .**

When `next_activity` loads an activity with required checkpoints, those checkpoint IDs are embedded in the session token. **All tools are blocked until every checkpoint is resolved via `respond_checkpoint`.**

When the `workflow-orchestrator` (or its worker) needs user input, it yields a raw JSON block wrapped in `<checkpoint_yield>` tags.

1. The `meta-orchestrator` parses this JSON block.
2. The `meta-orchestrator` populates and calls the `AskQuestion` tool using the parsed JSON.
3. Receive the user's response from the tool.
4. Call `respond_checkpoint({ session_token, checkpoint_id, option_id })`.
5. Resume the `workflow-orchestrator` with the user's chosen option.

**Strict Anti-Automation:** Agents MUST NEVER auto-resolve blocking checkpoints. If a checkpoint is `blocking: true`, it requires the user's explicit confirmation.
