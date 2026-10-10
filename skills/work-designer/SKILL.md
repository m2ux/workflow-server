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

Read the selected mode's file in full, then follow its links as each step needs them:

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
- **Linked sections.**
  Retrieve a heading-linked section and its subsections only, stopping at the next heading of equal or higher level. Use targeted search and range reads; follow required prerequisites and expand only to resolve missing context. Explicit whole-document reading requirements still apply.
- **Project context.**
  When a mode needs project settings, follow [variant selection](references/variants.md#selection).
- **Planning.**
  When creating or using artifacts, all modes follow [Planning](references/planning.md) for locations and records.
- **Commands.**
  Before execution, read the command's linked spec and its file's Conventions section. Apply the [shared command conventions](references/commands.md#conventions).

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
