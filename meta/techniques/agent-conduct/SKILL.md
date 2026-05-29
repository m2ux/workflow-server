---
name: agent-conduct
description: Cross-cutting behavioral boundaries for agents — file sensitivity, communication, operational discipline, checkpoint resolution, and orchestrator constraints.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 4.0.0
  order: 1
  legacy_id: 1
---

# Agent Conduct

## Capability

Cross-cutting behavioral boundaries for agents. This technique has no procedure — its body is a catalogue of rules attached to any activity that touches it. Rules apply to all agent execution contexts (workers and orchestrators) for the duration of a workflow.

## Rules

### file-sensitivity-no-core-config

Do not modify core configuration files without explicit user direction.

### file-sensitivity-avoid-build-scripts

Avoid changes to build scripts unless specifically requested.

### file-sensitivity-cicd-approval

Request approval before modifying CI/CD configuration or Docker files.

### communication-measured-language

Use measured technical language appropriate for senior software engineering.

### communication-no-hyperbole

Avoid hyperbolic statements and superlatives.

### communication-constructive-feedback

Provide respectful constructive feedback focused on code quality.

### communication-technical-merit

Focus on technical merit rather than emotional assessments.

### attribution-prohibition-direct-presentation

Present design decisions directly without referencing their origin.

### attribution-prohibition-no-tool-reference

Do not reference how code was generated or which tool created it.

### attribution-prohibition-no-process-in-comments

Do not include process attribution in code comments or documentation.

### code-commentary-why-not-what

Comments should explain why code exists and the rationale for design choices — avoid narrating what the code does.

### checkpoint-discipline-workers-yield-only

Workers MUST NOT call `respond_checkpoint`. When hitting a checkpoint, workers output `<checkpoint_yield>checkpoint_handle</checkpoint_yield>` and stop.

### checkpoint-discipline-workflow-orchestrators-bubble-up

Workflow orchestrators MUST NOT call `respond_checkpoint`. They bubble up the `checkpoint_handle` yielded by the worker to the meta-orchestrator.

### checkpoint-discipline-meta-only-resolves

Meta-orchestrators use `AskQuestion`, `present_checkpoint`, and `respond_checkpoint`. No one else calls `respond_checkpoint`.

### checkpoint-discipline-explicit-user-decision

Checkpoints are explicit user decision gates. The meta-orchestrator MUST NOT call `respond_checkpoint` with an `option_id` unless the user has explicitly selected that option. Never fabricate an `option_id` or auto-resolve.

### operational-discipline-bundled-tools-only

Domain-specific tools may ONLY be invoked from operations bundled into the current activity or workflow response. References in the user's request (URLs, issue keys) are context to preserve, not triggers for immediate API calls.

### operational-discipline-resources-via-tool

Do NOT read workflow resource files directly from disk — load them via `get_resource { session_index, resource_id }` using the text-only refs declared on operations (e.g., `meta/activity-worker-prompt`). Resources are obtained by id only; the legacy numeric-index form is deprecated and no longer supported by the loader.

### operational-discipline-cargo-fmt-exempt

`cargo fmt` is exempt from `nice` — it is fast and should run at normal priority.

### orchestrator-no-domain-work

The orchestrator (meta or workflow) MUST NOT execute activity steps, write code, review code, or produce artifacts. All domain work is delegated to the worker.

### orchestrator-no-inline-on-resume

On resume, the orchestrator MUST dispatch every activity through [workflow-engine](../workflow-engine/SKILL.md)::[dispatch-activity](../workflow-engine/dispatch-activity.md) (which spawns a worker sub-agent) — exactly as on a fresh start. Restored variables, a populated planning folder, prior artifacts visible in context, and a `current_activity` preserved in the session token are NOT licence to bypass dispatch and execute steps in the orchestrator's own context. Resume changes WHICH activity gets dispatched (`current_activity`, not `initialActivity`); it does not change WHETHER a worker is dispatched. The worker is responsible for detecting already-completed work from artifact presence and skipping accordingly — that discipline does not transfer to the orchestrator.

### orchestrator-target-path-scope

Branch creation, PR creation, and code commits MUST be performed inside the `target_path` directory (the submodule), NEVER in the parent monorepo. Planning artifact commits (`.engineering/artifacts/`) MUST be performed in the parent repo where that directory lives, on the current branch — do NOT create a new branch in the parent repo.

### orchestrator-automatic-transitions

After an activity completes, the orchestrator MUST evaluate the transition table and immediately dispatch the next activity WITHOUT pausing for user confirmation. Transitions are deterministic — they are evaluated against state variables, not user prompts. Any pause between activities for user confirmation is a protocol violation.

### orchestrator-no-ad-hoc-interaction

The orchestrator MUST NOT generate questions, solicit confirmation, or produce any output that waits for user input outside of checkpoint yields from the worker. The ONLY mechanism for user interaction is presenting `checkpoint_pending` yields. Summaries, status updates, and progress notes may be emitted as informational messages, but MUST NOT be phrased as questions or imply the user should respond before the workflow continues.
