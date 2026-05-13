# System Architecture Overview

The Workflow Server is designed to orchestrate complex software engineering tasks using an autonomous, multi-agent framework. To handle ambiguity, long-running processes, and safe state transitions, the system's architecture is strictly modularized across several key paradigms.

Below is the collection of architectural models that govern how the server and its agents interact.

## 1. [Hierarchical Dispatch Model](dispatch_model.md)
To prevent prompt degradation and ensure safe boundaries, the server uses a multi-layered agent model. The Meta Orchestrator (Level 0) handles high-level user interaction and workflow dispatch. The Workflow Orchestrator (Level 1) manages the state machine for a specific workflow. The Activity Worker (Level 2) executes the actual domain tasks (coding, reviewing, etc.). This document details how these agents are spawned, how they share session state (via `start_session` with `parent_session_token`), and how they resume each other.

## 2. [Just-In-Time (JIT) Checkpoint Model](checkpoint_model.md)
The JIT Checkpoint Model handles execution pauses. When a worker agent needs human input (like confirming a target directory or approving a PR), it cannot ask the user directly. Instead, it yields its bcp-bearing `session_token` (which acts as the checkpoint handle) up the chain to the Meta Orchestrator. This document explains how the handle bubbles up, how the server resolves it (via `present_checkpoint` and `respond_checkpoint`, both of which now accept only `session_token`), and how the resulting variable updates and advanced token are passed back down the chain via conversational resumes to unblock the worker.

## 3. [State Management & Deterministic Transitions](state_management_model.md)
The orchestration engine strictly enforces deterministic state transitions. Rather than asking an LLM to guess what to do next based on conversation history, the Workflow Orchestrator evaluates a rigid set of JSON variables against structured `Condition` objects in the workflow definition. This document covers how variables are initialized, how checkpoint effects and worker outputs mutate them, and how modes modify standard workflow behavior.

## 4. [Artifact & Workspace Isolation](artifact_management_model.md)
The system enforces strict boundaries between orchestration metadata (the workflow engine, plans, and state) and the user's domain codebase. This document outlines the purpose of the `.engineering` directory, the mandatory updates to the planning folder's `README.md`, the `artifactPrefix` naming conventions, the `ArtifactSchema` with `create`/`update` actions, and the specific Git submodule procedures agents must follow when committing orchestration artifacts.

## 5. [Skill, Operation & Resource Resolution Architecture](resource_resolution_model.md)
To preserve the precious context windows of Large Language Models, the system pairs a lazy-loading resource architecture with an operation-focused skill model. Skills are containers for named **operations**, **rules**, and **errors**; activities and workflows compose behaviour by listing flat `skill-id::operation-name` references. The server pre-resolves these refs (alongside core orchestrator and worker op sets) and bundles them into the responses of `get_workflow` and `get_activity`. Lightweight `resources` arrays — at the skill or per-operation level — defer loading of large markdown guides (Git CLI tutorials, API references, templates) until an agent calls `get_resource`. This document explains the resolution pipeline, the universal `meta/` skill fallback, the operation bundles, and the canonical ID convention.

## 6. [Workflow Fidelity](workflow-fidelity.md)
Because agents are autonomous, they must be audited to ensure they actually followed the instructions defined in the workflow's TOON files. This document details the Step Completion Manifest (a structured summary of what the agent did), the Activity Manifest (tracking the workflow journey), and the cryptographic Trace Tokens. It explains how mechanical and semantic traces are recorded, validated against the workflow schema, and appended to the permanent audit log.

## 7. [MCP-Client Interceptor](interceptor-recipe.md)
The `workflow-server-interceptor` CLI is a host-harness companion that removes session-token threading from the LLM's responsibilities. It is **not** part of the workflow server process itself; it runs as a transient subprocess inside the harness's MCP lifecycle hooks (Claude Code's `PreToolUse` / `PostToolUse`, Cursor's `beforeMCPExecution` / `afterMCPExecution`, OpenCode's `tool.execute.before` / `tool.execute.after`, etc.).

**Where it sits.** Between the LLM emitting an MCP tool call and the harness forwarding it to the workflow-server, and again between the workflow-server's response and the harness handing it back to the LLM.

**What it owns.** A user-scoped state directory at `~/.claude/workflow-server-tokens/` (mode `0700`) containing per-session token files `<sid-hex>.token` and a shared pointer `current.token` (mode `0600` each, written via atomic rename).

**What it modifies.**
- *PreToolUse* (`inject`): for any `mcp__workflow-server__*` call other than `start_session` that does not already carry a `session_token`, it emits an `updatedInput` JSON that merges the captured token into `arguments.session_token`. All other shapes pass through unchanged.
- *PostToolUse* (`capture`): reads `_meta.session_token` from the response, extracts the `sid` from the token payload, and writes the token to both the per-sid file and `current.token`.

The CLI is failure-safe — every error path degrades to pass-through and exits zero, because harnesses interpret non-zero as "block the call". From the workflow-server's perspective, an interceptor-present session and an interceptor-absent session are wire-equivalent; the server has no notion of "interceptor mode". The interceptor pattern is the implementation strategy that makes the collapsed `session_token`-only checkpoint API ergonomic across the L0 / L1 / L2 dispatch hierarchy.

## Tool Reference

See [API Reference](api-reference.md) for the complete list of MCP tools, their parameters, and the session token lifecycle.

See [Development Guide](development.md) for setup, build commands, and testing.
