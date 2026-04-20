# Hierarchical Dispatch Model

The Workflow Server utilizes a **Hierarchical Dispatch Model** to execute workflows. This architecture leverages multi-agent delegation, where specialized agents spawn sub-agents to handle specific scopes of work, ensuring clear boundaries between high-level user interaction, workflow state management, and low-level task execution.

This model relies heavily on native agent-spawning capabilities, such as Cursor's `Task` tool.

## The Three Layers of Orchestration

### 1. Meta Orchestrator (Level 0)
- **Role:** The user-facing top-level agent. It discovers workflows, handles high-level user goals, and dispatches the appropriate client workflows.
- **Skill:** `meta-orchestrator.toon`
- **Responsibilities:**
  - Finding and selecting workflows (`discover`, `list_workflows`).
  - Dispatching the workflow orchestrator.
  - Acting as the sole interface for user prompts (e.g., presenting checkpoints via `AskQuestion`).
  - **Never** executes domain work or tracks detailed workflow state.

### 2. Workflow Orchestrator (Level 1)
- **Role:** A persistent background sub-agent dedicated to managing a single client workflow from start to finish.
- **Skill:** `workflow-orchestrator.toon`
- **Responsibilities:**
  - Evaluating state variables and determining the `next_activity` to execute.
  - Dispatching Activity Workers to perform the actual steps.
  - Managing Git artifacts, state persistence (`workflow-state.json`), and mechanical/semantic tracing.
  - Relaying checkpoints yielded by workers up to the Meta Orchestrator.

### 3. Activity Worker (Level 2)
- **Role:** An ephemeral sub-sub-agent dispatched to execute one specific activity.
- **Skill:** `activity-worker.toon`
- **Responsibilities:**
  - Loading activity definitions and executing steps sequentially.
  - Using domain-specific tools to write code, review PRs, or modify files.
  - Yielding execution when hitting a blocking checkpoint.
  - Returning a structured `activity_complete` result containing modified variables and created artifacts.

---

## Mechanics of Dispatch

The dispatch process safely hands off execution from one layer to the next while preserving cryptographic session state.

### Dispatching the Workflow Orchestrator (L0 → L1)
When the Meta Orchestrator decides to start a workflow (e.g., `work-package`), it calls the `dispatch_workflow` API tool:
```javascript
dispatch_workflow({ 
  workflow_id: "work-package", 
  parent_session_token: "<meta_token>" 
})
```
This creates a **completely independent client session** on the server. The API returns a dispatch package containing a `client_session_token` and a pre-composed `client_prompt`. 

The Meta Orchestrator then uses Cursor's `Task` tool to spawn a background agent:
```javascript
Task({
  subagent_type: "generalPurpose",
  prompt: "<client_prompt_from_api>"
})
```

### Dispatching the Activity Worker (L1 → L2)
The Workflow Orchestrator evaluates the workflow, determines the next activity to run, and dynamically constructs a prompt for the worker. 

Crucially, the Workflow Orchestrator injects its **own `session_token`** into the worker's prompt. 
It then uses the `Task` tool to spawn the Activity Worker:
```javascript
Task({
  subagent_type: "generalPurpose",
  prompt: "You are an autonomous worker agent... Session token: <client_session_token>..."
})
```
Unlike the L0 → L1 transition (which creates a new session), the L1 → L2 transition **shares the same session token**. The worker uses this token directly to call `get_skill` and `next_activity`, ensuring its actions are cryptographically bound to the exact workflow and activity state tracked by the orchestrator.

## Resuming Sub-Agents

When an agent pauses (e.g., waiting for a checkpoint resolution), it doesn't die. Cursor's `Task` tool supports a `resume` parameter that accepts the `agent_id` of a previously spawned sub-agent. 

When the parent agent needs to wake the sub-agent back up, it simply calls the `Task` tool again:
```javascript
Task({
  resume: "<sub_agent_id>",
  prompt: "The checkpoint has been resolved. The user selected option 'proceed'. Please continue."
})
```
This appends the new instructions directly to the sub-agent's existing context window, allowing it to seamlessly continue its execution loop without losing its memory of the codebase or workflow state.

## Environment Considerations (Inline Fallback)

The Hierarchical Dispatch Model is optimized for environments like Cursor that support true background sub-agents via tools like `Task`. 

In environments that do not support sub-agent spawning (e.g., Claude Code), the top-level agent must execute the workflow **inline**. This means a single agent sequentially adopts the personas of the Meta Orchestrator, Workflow Orchestrator, and Activity Worker, executing all instructions within a single, contiguous conversation thread.