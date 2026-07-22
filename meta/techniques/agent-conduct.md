---
metadata:
  version: 4.4.0
---

## Capability

Cross-cutting behavioral boundaries for agents — file sensitivity, communication, attribution, operational discipline, checkpoint role split, and orchestrator constraints.

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

Workers never call `respond_checkpoint`. Pause via [yield-checkpoint](./workflow-engine/yield-checkpoint.md).

### checkpoint-discipline-workflow-orchestrators-bubble-up

Workflow orchestrators never call `respond_checkpoint`. Bubble the worker's yield to the meta-orchestrator unchanged.

### checkpoint-discipline-meta-only-resolves

Only the meta-orchestrator resolves checkpoints — via [present-checkpoint-to-user](./workflow-engine/present-checkpoint-to-user.md) then [respond-checkpoint](./workflow-engine/respond-checkpoint.md).

### checkpoint-discipline-explicit-user-decision

Never fabricate an `option_id` or skip user presentation. Honor [present-checkpoint-to-user](./workflow-engine/present-checkpoint-to-user.md)::present-before-any-resolution.

### operational-discipline-bundled-tools-only

Domain-specific tools may ONLY be invoked from operations bundled into the current activity or workflow response. References in the user's request (URLs, issue keys) are context to preserve, not triggers for immediate API calls.

### operational-discipline-resources-via-tool

Do not read workflow resource files from disk. Load via [resource-loading-via-tool](./workflow-engine/TECHNIQUE.md#resource-loading-via-tool) (and [resource-section-or-whole](./workflow-engine/TECHNIQUE.md#resource-section-or-whole) / [force-full-after-summarization](./workflow-engine/TECHNIQUE.md#force-full-after-summarization) as needed).

### operational-discipline-cargo-fmt-exempt

`cargo fmt` is exempt from `nice` — it is fast and should run at normal priority.

### operational-discipline-artifact-location

Write planning artifacts only under the server-returned `{planning_folder_path}` — never compose or reconstruct that path ([start-session](./workflow-engine/start-session.md)::planning-folder-absolute-or-omit). Filename prefix and find-or-update discipline belong to the artifact-writing techniques (e.g. manage-artifacts [artifact-prefix](../../work-package/techniques/manage-artifacts/TECHNIQUE.md#artifact-prefix)).

### orchestrator-no-domain-work

Orchestrators (meta or workflow) never execute activity steps or produce domain artifacts. Delegate via [dispatch-activity](./workflow-engine/dispatch-activity.md).

### orchestrator-no-inline-on-resume

On resume, still dispatch a worker via [dispatch-activity](./workflow-engine/dispatch-activity.md) — resume changes which activity is dispatched, not whether one is. Do not execute steps inline from restored bag/folder context.

### orchestrator-target-path-scope

Branch creation, PR creation, and code commits MUST be performed inside the `target_path` directory (the submodule), NEVER in the parent monorepo. Planning artifact commits (`.engineering/artifacts/`) MUST be performed in the parent repo where that directory lives, on the current branch — do NOT create a new branch in the parent repo.

### orchestrator-automatic-transitions

No user pause between activities after `activity_complete` — advance via [finalize-activity](./workflow-engine/finalize-activity.md) / [dispatch-activity](./workflow-engine/dispatch-activity.md) (orchestrator does not re-walk `transitions[]`).

### orchestrator-no-ad-hoc-interaction

Orchestrators never solicit user input outside presenting `checkpoint_pending` yields. Informational status may be emitted; it must not wait for a reply.
