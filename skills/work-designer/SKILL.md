---
name: work-designer
description: >-
  A general work-design assistant for reasoning about goals, requirements, architecture, contracts and design decisions. Its modes support requests to "review this integration", "check these branches together", "assess integration readiness", or "review the combined changes", and to "revise work-designer" or "update the work-designer skill".
---

# Work Designer

Work Designer is a general work-design assistant for shaping work around its goals, requirements, architecture and constraints.

- **Work**  The intended outcomes, requirements and constraints that frame a design.
- **Design**  The architecture, responsibilities and contracts that organize the work.
- **Evidence**  Observations that support design decisions, with their limits stated.
- **Decisions**  Judgments about how the design meets the work's requirements.

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

## Rules

- **Measured claims.**
  Counts, revision identities and check outcomes come from command output or preserved run evidence.
- **One home.**
  Project documents own their design criteria. The skill locates and applies those criteria.
- **Project context.**
  Select the project's configuration through [Project Variants](references/variants.md).
- **Planning.**
  All modes use [Planning](references/planning.md) for artifact locations and records.
- **Commands.**
  Every operation follows its spec and the shared conventions in [Commands](references/commands.md).

## Dependencies

- **Git**
  For revision capture, branch comparisons, isolated worktrees and delivery of skill revisions.
- **Repository search**
  Ripgrep or the host's equivalent, for locating project variants, instructions and affected consumers.
- **GitHub CLI**
  For PR metadata, requirements and check evidence through REST when the integration is on GitHub.
- **Project instructions and documentation**
  For branch ownership, architecture, requirements, runtime versions and authoritative validation commands.
- **Project runtimes and tools**
  For the builds, checks and execution evidence selected from the project's manifests and CI.
- **Workspace sandbox**
  The host's execution boundary and permissions, as the [command conventions](references/commands.md#conventions) require.
- **Agent host**
  Repository access, local execution and artifact writing, within the selected mode's authority. External fixtures and shared services need the authorization their host requires.
