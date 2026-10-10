---
name: work-designer
description: >-
  Reviews integrations against a project's design, architecture and branch contracts. Use to "review this integration", "check these branches together", "assess integration readiness", or "review the combined changes"; also to "revise work-designer" or "update the work-designer skill". Reviews produce findings and coverage evidence; implementation belongs to a separate request.
---

# Work Designer

Work Designer reviews whether combined changes meet their requirements and work together within the project's architecture.

- **Integrations**  The proposed results of one or more branches reaching their targets.
- **Contracts**  The design, schemas, interfaces and instructions those results must satisfy.
- **Evidence**  Observations of the reviewed revisions, with their limits stated.
- **Reports**  Findings, coverage and the actions needed to establish readiness.

## Modes

Read the file for the mode the request calls for:

- **[Review](references/review-mode.md)**
  - Scope and revision pairings for integrations
  - Tracing design and architecture through declarations and consumers
  - Coverage matched to each affected branch and its languages
  - Evidence for findings and readiness
- **[Revise](references/revise-mode.md)**
  - Changes to this skill's own files
  - Conformance with the [skill guidelines](../guidelines.md) and this skill's [guidelines](references/guidelines.md)

## Dependencies

- **Git**
  For revision capture, branch comparisons, isolated worktrees and delivery of skill revisions.
- **GitHub CLI**
  For PR metadata, requirements and check evidence through REST when the integration is on GitHub.
- **Project instructions and documentation**
  For branch ownership, architecture, requirements, runtime versions and authoritative validation commands.
- **Project runtimes and tools**
  The affected branch supplies them. The [workflow-server profile](references/workflow-server.md) uses Node/npm, Python, Bash and, for container validation, Docker and Compose.
- **Workspace sandbox**
  Use the execution boundary the workspace provides; the [command conventions](references/commands.md#conventions) describe the workflow-server workspace.
- **Agent host**
  Read-only repository access, local execution and report writing. External fixtures and shared services need the authorization their host requires.

## Rules

- **Measured claims.**
  Counts, revision identities and check outcomes come from command output or preserved run evidence.
- **One home.**
  Project documents own their design criteria. The skill locates those criteria and specifies how to review them.
- **Commands.**
  Every operation follows its spec and the shared conventions in [Commands](references/commands.md).
