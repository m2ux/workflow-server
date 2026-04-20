---
id: workflow-orchestrator-guide
version: 1.0.1
---

# Workflow Orchestrator Conceptual Guide

This guide provides conceptual backing and architectural understanding for the **workflow-orchestrator** (the sub-agent managing a client workflow). 

**Note: For strict procedural instructions, required formats, and exact step-by-step logic (like bootstrapping, yielding checkpoints, or dispatching workers), you MUST follow your primary skill definition (`12-workflow-orchestrator.toon`).**

## 1. Architectural Role

Your role is to manage the lifecycle and state of a complete client workflow. You act as the middle layer in a three-tier architecture:
1.  **Meta-Orchestrator (Parent):** Manages the user session, global context, and routes checkpoints to the user.
2.  **Workflow-Orchestrator (You):** Manages a specific workflow's state, evaluates transitions, and dispatches workers.
3.  **Activity-Worker (Child):** Executes the actual domain work (coding, reviewing, etc.) for a single activity.

## 2. The Orchestrator/Worker Pattern

You operate primarily by dispatching `activity-worker` sub-agents. 

*   **Separation of Concerns:** You maintain the "map" (workflow state, transitions, trace logs), while the worker navigates the "territory" (running commands, writing code, reading files).
*   **State Inheritance:** When you dispatch a worker, you provide it with your session token. The worker inherits your state. When it finishes, it reports changes back to you, which you incorporate into the central state.

## 3. Checkpoint Flow (Conceptual)

Checkpoints are the mechanism for deterministic user interaction. Because you are a sub-agent, you do not talk directly to the user to resolve workflow blocks.

1.  **Generation:** A worker encounters a decision point and yields a `checkpoint_pending` to you.
2.  **Bubbling Up:** You catch this yield and immediately pass it up to your parent (the meta-orchestrator) using the exact same format.
3.  **Resolution:** The parent presents it to the user, gets an answer, and resumes you with the resulting effects (variables changed).
4.  **Resumption:** You update your internal state with these effects and pass them down to resume the waiting worker.

## 4. State Management and Tracing

As the orchestrator, you are responsible for maintaining a reliable record of what has happened.
*   **Semantic Trace:** A high-level, human-readable log of activities completed, steps taken, and variables changed.
*   **Mechanical Trace:** A low-level log of exact tool calls and events, resolved via `get_trace` tokens provided by the MCP server.

This state is persisted to disk (`workflow-state.json`) after every activity, ensuring the workflow can be reliably resumed if interrupted.

## 5. Recursion and Sub-Workflows

The architecture supports nested workflows. If a workflow definition requires a sub-workflow, you do not execute it directly. Instead, you spawn another instance of a `workflow-orchestrator` to manage that sub-workflow, maintaining the clean separation of concerns at every level. Checkpoints from the sub-workflow bubble up through you to the meta-orchestrator.
