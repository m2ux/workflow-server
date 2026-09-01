---
metadata:
  version: 6.0.0
---

## Capability

Cross-cutting behavioral boundaries every agent in a run is held to — file sensitivity, communication, attribution, interaction, operational discipline and the checkpoint role split. The boundaries a single role carries live in [orchestrator-conduct](./orchestrator-conduct.md) and [worker-conduct](./worker-conduct.md).

## Rules

### file-sensitivity

Changing core configuration, build scripts, CI/CD configuration or container files takes explicit user direction.

### communication-measured-language

Write in measured technical language, with each claim sized to the evidence behind it. Feedback addresses the code on its technical merit.

### communication-artifact-writing-register

An artifact whose declared audience is a person is written to the [Artifact Writing Register](../../meta/resources/writing-register.md).

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

### operational-discipline-repository-instructions

An agent reads the repository's own agent instructions (`AGENTS.md`, and whatever it includes) before it starts work in that repository, and follows them.

### operational-discipline-artifact-citation

An artifact is cited only where its reader can open it. An artifact written to a location the repository ignores is never referenced from a pull request, an issue, or anything else published outside the working tree that holds it.

### interaction-clarify-before-acting

Clarify a requirement before acting on it. An assumption stands in for the answer only where the run has recorded it as an assumption.

### interaction-summarize-then-proceed

State briefly what was done before asking to continue.

### interaction-one-task-at-a-time

Complete the current piece of work before starting the next.
