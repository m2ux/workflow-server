---
id: meta-orchestrator-guide
version: 1.1.0
---

# Meta Orchestrator Guide

This guide is exclusively for the **meta-orchestrator** (the top-level agent running the `meta` workflow).

## 1. 3-Tier Hierarchy

The orchestration model uses a strict hierarchy:

1. **`meta-orchestrator`**: The top-level agent. It manages session state, dispatches client workflows, and is the ONLY agent permitted to interact with the user via `AskQuestion`.
2. **`workflow-orchestrator`**: Dispatched by the `meta-orchestrator`. It manages a single client workflow, evaluating transitions and dispatching activities.
3. **`activity-worker`**: Dispatched by the `workflow-orchestrator`. It executes a single activity to completion.

## 2. Bootstrapping a Meta Session

1. **discover** — Call first (no parameters). Returns the server info and this bootstrap procedure.
2. **list_workflows** — Match the user's goal to a workflow from the returned list. No session token needed.
3. **start_session(`workflow_id: "meta"`)** — Start a meta session.
4. **get_skills(`session_token`)** — Load behavioral protocols for the meta session.
5. **get_workflow(`session_token`, `summary=true`)** — Load the meta workflow structure.
6. **next_activity(`session_token`, `activity_id`)** — Execute either `start-workflow` or `resume-workflow` based on the user's intent. MUST use the initialActivity ID from `get_workflow` for the first call. 

## 3. Workflow Discovery and Goal Resolution

When the user does not specify a workflow:
1. Call `list_workflows` to get available workflows.
2. Compare the user's goal to workflow descriptions. If multiple workflows could match, ask the user to clarify. NEVER skip workflow matching to use a skill directly. If no workflow matches, inform the user — this is a design gap.
3. Present workflows with title, description, and tags and let the user select one.

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

**The top-level `meta-orchestrator` is the ONLY agent permitted to call `AskQuestion`.**

When `next_activity` loads an activity with required checkpoints, those checkpoint IDs are embedded in the session token. **All tools are blocked until every checkpoint is resolved via `respond_checkpoint`.**

When the `workflow-orchestrator` (or its worker) needs user input, it yields a raw JSON block wrapped in `<checkpoint_yield>` tags.

1. The `meta-orchestrator` parses this JSON block.
2. The `meta-orchestrator` populates and calls the `AskQuestion` tool using the parsed JSON.
3. Receive the user's response from the tool.
4. Call `respond_checkpoint({ session_token, checkpoint_id, option_id })`.
5. Resume the `workflow-orchestrator` with the user's chosen option.

**Strict Anti-Automation:** Agents MUST NEVER auto-resolve blocking checkpoints. If a checkpoint is `blocking: true`, it requires the user's explicit confirmation.
