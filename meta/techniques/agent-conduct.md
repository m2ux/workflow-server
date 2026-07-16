---
metadata:
  version: 4.2.0
---

## Capability

Cross-cutting behavioral boundaries for agents — spanning file sensitivity, communication, operational discipline, checkpoint resolution, and orchestrator constraints. This technique has no procedure — its body is a catalogue of rules attached to any activity that touches it. Rules apply to all agent execution contexts (workers and orchestrators) for the duration of a workflow.

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

### operational-discipline-resource-section-or-whole

Choose bare vs `#section` `resource_id` by how much of the resource this agent context will need. Prefer a `#section` anchor when the current step needs a single slice of a large resource. When the same agent context will need two or more sections from the same resource in the current activity (or in the immediate next steps of that activity), call `get_resource` once with the bare resource id and reuse that content — do not issue repeated section fetches for the same file. Bare and `#section` ids are distinct delivery keys: loading sections does not populate the whole-resource key, and loading the whole file does not collapse a later section fetch under a different key. Under `context_mode: "persistent"`, a byte-identical refetch of the same exact `resource_id` may arrive as an unchanged-reference; pass `full: true` only when that content is no longer in context.

### operational-discipline-cargo-fmt-exempt

`cargo fmt` is exempt from `nice` — it is fast and should run at normal priority.

### operational-discipline-artifact-location

Most workflow artifacts — the per-activity planning documents — live under the work package's planning folder at the absolute `planning_folder_path` the server returns. That path is rooted at the server's OWN workspace `.engineering` root (the `.engineering` location supplied to the server at init — the monorepo root), NOT the target component repo or your CWD. There is exactly ONE such folder per work package. Write artifacts to that absolute path verbatim; NEVER to the bare `planning/` root, NEVER relative to `target_path` or any working directory, and NEVER compose or reconstruct the path yourself — the server is the single source of truth for it (read it back from `start_session` / `dispatch_child` / `create-session`). A dedicated artifact class is the exception: when a technique declares its own artifact-directory input (with a default location), that technique is authoritative for where its artifacts live and writes them to that directory instead of the planning subfolder. Do not assume every artifact lands under `planning_folder_path`. Each artifact filename carries the server-provided `artifactPrefix` for its activity (e.g. `09-code-review.md`). Because the path is the server-resolved absolute location, it resolves correctly even when the target component is the workflow-server repository itself, and even when `target_path` is a submodule or git worktree nested under the monorepo. A logical artifact (a given bare filename) has exactly ONE numbered instance — created by its first activity; any later activity that writes the same bare filename UPDATES that instance in place, preserving its original number, never minting a new prefix (only token-templated names like `strategic-review-{n}.md` create a numbered series).

### orchestrator-no-domain-work

The orchestrator (meta or workflow) MUST NOT execute activity steps, write code, review code, or produce artifacts. All domain work is delegated to the worker via [dispatch-activity](./workflow-engine/dispatch-activity.md).

### orchestrator-no-inline-on-resume

On resume, the orchestrator MUST dispatch every activity through [dispatch-activity](./workflow-engine/dispatch-activity.md) (spawn a worker) — exactly as on a fresh start. Restored variables, a populated planning folder, prior artifacts visible in context, and a `current_activity` preserved in the session token are NOT licence to bypass dispatch and execute steps in the orchestrator's own context. Resume changes WHICH activity gets dispatched (`current_activity`, not `initialActivity`); it does not change WHETHER a worker is dispatched. The worker is responsible for detecting already-completed work from artifact presence and skipping accordingly — that discipline does not transfer to the orchestrator.

### orchestrator-target-path-scope

Branch creation, PR creation, and code commits MUST be performed inside the `target_path` directory (the submodule), NEVER in the parent monorepo. Planning artifact commits (`.engineering/artifacts/`) MUST be performed in the parent repo where that directory lives, on the current branch — do NOT create a new branch in the parent repo.

### orchestrator-automatic-transitions

After an activity completes, the orchestrator MUST evaluate the transition table and immediately dispatch the next activity WITHOUT pausing for user confirmation. Transitions are deterministic — they are evaluated against state variables, not user prompts. Any pause between activities for user confirmation is a protocol violation.

### orchestrator-no-ad-hoc-interaction

The orchestrator MUST NOT generate questions, solicit confirmation, or produce any output that waits for user input outside of checkpoint yields from the worker. The ONLY mechanism for user interaction is presenting `checkpoint_pending` yields. Summaries, status updates, and progress notes may be emitted as informational messages, but MUST NOT be phrased as questions or imply the user should respond before the workflow continues.