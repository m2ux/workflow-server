# System Architecture Overview

The Workflow Server is designed to orchestrate complex software engineering tasks using an autonomous, multi-agent framework. To handle ambiguity, long-running processes, and safe state transitions, the system's architecture is strictly modularized across several key paradigms.

Below is the collection of architectural models that govern how the server and its agents interact.

## 1. [Hierarchical Dispatch Model](dispatch_model.md)
To prevent prompt degradation and ensure safe boundaries, the server uses a multi-layered agent model. The Meta Orchestrator (Level 0) handles high-level user interaction and workflow dispatch. The Workflow Orchestrator (Level 1) manages the state machine for a specific workflow. The Activity Worker (Level 2) executes the actual domain tasks (coding, reviewing, etc.). This document details how these agents are spawned, how they share session state (via `start_session` with `parent_session_token`), and how they resume each other.

## 2. [Just-In-Time (JIT) Checkpoint Model](checkpoint_model.md)
The JIT Checkpoint Model handles execution pauses. When a worker agent needs human input (like confirming a target directory or approving a PR), it cannot ask the user directly. Instead, it yields a `checkpoint_handle` up the chain to the Meta Orchestrator. This document explains how the handle bubbles up, how the server resolves it (via `present_checkpoint` and `respond_checkpoint`), and how the resulting variable updates are passed back down the chain via conversational resumes to unblock the worker.

## 3. [State Management & Deterministic Transitions](state_management_model.md)
The orchestration engine strictly enforces deterministic state transitions. Rather than asking an LLM to guess what to do next based on conversation history, the Workflow Orchestrator evaluates a rigid set of JSON variables against structured `Condition` objects in the workflow definition. This document covers how variables are initialized, how checkpoint effects and worker outputs mutate them, and how modes modify standard workflow behavior.

## 4. [Artifact & Workspace Isolation](artifact_management_model.md)
The system enforces strict boundaries between orchestration metadata (the workflow engine, plans, and state) and the user's domain codebase. This document outlines the purpose of the `.engineering` directory, the mandatory updates to the planning folder's `README.md`, the `artifactPrefix` naming conventions, the `ArtifactSchema` with `create`/`update` actions, and the specific Git submodule procedures agents must follow when committing orchestration artifacts.

## 5. [Skill & Resource Resolution Architecture](resource_resolution_model.md)
To preserve the precious context windows of Large Language Models, the system uses a lazy-loading resource architecture. Instead of injecting massive prompts, the server utilizes Canonical IDs and a Universal Skill Fallback mechanism. This document explains how `.toon` skill files declare lightweight `resources` arrays, prompting agents to call the `get_resource` tool only when they need to read large, specialized markdown guides (like Git or Atlassian API tutorials). It also covers the workflow-level primary skill loaded via `get_skills`.

## 6. [Workflow Fidelity](workflow-fidelity.md)
Because agents are autonomous, they must be audited to ensure they actually followed the instructions defined in the workflow's TOON files. This document details the Step Completion Manifest (a structured summary of what the agent did), the Activity Manifest (tracking the workflow journey), and the cryptographic Trace Tokens. It explains how mechanical and semantic traces are recorded, validated against the workflow schema, and appended to the permanent audit log.

## Tool Reference

See [API Reference](api-reference.md) for the complete list of MCP tools, their parameters, and the session token lifecycle.

See [Development Guide](development.md) for setup, build commands, and testing.
