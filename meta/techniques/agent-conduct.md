---
metadata:
  version: 5.1.0
---

## Capability

Cross-cutting behavioral boundaries for agents — file sensitivity, communication, attribution, operational discipline, checkpoint role split, and orchestrator constraints.

## Rules

### file-sensitivity

Changing core configuration, build scripts, CI/CD configuration or container files takes explicit user direction.

### communication-measured-language

Write in measured technical language, with each claim sized to the evidence behind it. Feedback addresses the code on its technical merit.

### communication-artifact-writing-register

An artifact whose declared audience is a person is written to the [Artifact Writing Register](../resources/writing-register.md). The artifact's own creation guide keeps its sections, its budget, and the form it prefers.

### attribution-prohibition

Design decisions, code comments and documentation state what is. They carry no account of how it came to be — which tool produced it, what process it went through, whose suggestion it was.

### code-commentary-why-not-what

Comments explain why code exists and the rationale for design choices, rather than narrating what the code does.

### checkpoint-discipline

Resolving a checkpoint is the meta-orchestrator's, via [present-checkpoint-to-user](./workflow-engine/present-checkpoint-to-user.md) then [respond-checkpoint](./workflow-engine/respond-checkpoint.md). A worker reaching a gate pauses there via [yield-checkpoint](./workflow-engine/yield-checkpoint.md); a workflow orchestrator passes the yield it receives upward unchanged.

### operational-discipline-bundled-tools-only

Domain-specific tools may ONLY be invoked from operations bundled into the current activity or workflow response. References in the user's request (URLs, issue keys) are context to preserve, not triggers for immediate API calls.

### operational-discipline-resources-via-tool

Workflow resources reach an agent from the server. Load them per [resource-loading-via-tool](./workflow-engine/TECHNIQUE.md#resource-loading-via-tool) rather than reading resource files from disk.

### operational-discipline-artifact-location

Write planning artifacts only under the server-returned `{planning_folder_path}` — never compose or reconstruct that path. Filename prefix and find-or-update discipline belong to whichever artifact-writing technique the workflow bundles, not here.

### orchestrator-no-domain-work

Orchestrators (meta or workflow) never execute activity steps or produce domain artifacts. Delegate via [dispatch-activity](./workflow-engine/dispatch-activity.md).

### orchestrator-no-inline-on-resume

Resuming a saved session still dispatches a worker via [dispatch-activity](./workflow-engine/dispatch-activity.md) — the restored state changes which activity is dispatched, not whether one is. Do not execute steps inline from restored bag/folder context. A worker paused at a gate is continued under its bound identity via [resume-worker](./workflow-engine/resume-worker.md).

### orchestrator-component-path-scope

Branch creation, PR creation, and code commits MUST be performed inside the component directory (the submodule), NEVER in the host monorepo root. Planning artifact commits (`.engineering/artifacts/`) land on the current branch of the checkout that holds that directory — which checkout that is, and the primitive it takes, are resolved by [commit-and-persist](./workflow-engine/commit-and-persist.md). Do NOT create a new branch for them.

### orchestrator-automatic-transitions

No user pause between activities after `activity_complete` — advance via [finalize-activity](./workflow-engine/finalize-activity.md) / [dispatch-activity](./workflow-engine/dispatch-activity.md) (orchestrator does not re-walk `transitions[]`).

### orchestrator-no-ad-hoc-interaction

Orchestrators never solicit user input outside presenting `checkpoint_pending` yields. Informational status may be emitted; it must not wait for a reply.
