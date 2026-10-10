---
name: workflow-canon
description: >-
  A general work-design assistant for reasoning about goals, requirements, architecture, contracts and design decisions. Use to author workflow definitions ("write a new activity", "apply this finding"), audit them against their project's canon ("audit workflow X", "why is this an anti-pattern?"), review integrations ("check these branches together", "assess integration readiness"), or revise this skill ("update the workflow-canon skill").
hooks:
  PostToolUse:
    - matcher: "Edit|Write|MultiEdit"
      hooks:
        - type: command
          command: "python3 \"${CLAUDE_PROJECT_DIR}/.claude/skills/workflow-canon/scripts/edit_guard.py\""
---

# Workflow Canon

Workflow Canon is a general work-design assistant for shaping work around its goals, requirements, architecture and constraints.

- **Work**  Intended outcomes, requirements and constraints.
- **Design**  Architecture, responsibilities, definitions and contracts.
- **Canon**  The project's authoritative design criteria and conventions.
- **Evidence**  Observations supporting design decisions, with their limits stated.

## Modes

Read the selected mode's file in full, then follow its links as each step needs them:

- **[Author](references/author-mode.md)**
  - Authoring definitions and specified changes
  - Closing confirmed findings with their prescribed fixes
  - Draft walks and verification of written changes
- **[Audit](references/audit-mode.md)**
  - Canon questions and conformance of existing definitions
  - Attribution and verification of findings
  - Reports with coverage ledgers
- **[Review](references/review-mode.md)**
  - Scope and revision pairings for integrations
  - Tracing design and architecture through declarations and consumers
  - Coverage matched to affected branches and languages
  - Evidence for findings and readiness
- **[Revise](references/revise-mode.md)**
  - Changes to this skill's own files
  - Conformance with shared and local skill guidelines

## Rules

- **Measured claims.**
  Counts, revision identities and check outcomes come from command output or preserved run evidence.
- **One home.**
  Project documents own their design criteria. Fetch the authoritative section and apply it as written, including its exclusions; notes taken from it do not replace it.
- **Linked sections.**
  Retrieve a heading-linked section and its subsections only, stopping before the next heading of equal or higher level. Use targeted search and range reads; follow required prerequisites and expand only to resolve missing context. Explicit whole-document reading requirements still apply.
- **Project context.**
  When a mode needs project settings, follow [variant selection](references/variants.md#selection).
- **Planning.**
  When creating or using artifacts, all modes follow [Planning](references/planning.md).
- **Commands.**
  Before the first command spec, read the [shared command conventions](references/commands.md#conventions) and any additional conventions linked by its caller. Reuse complete prerequisites already read at the same revision; retrieve each operation's spec at its point of use.

## Dependencies

- **Git and repository search**
  Revision capture, comparisons, isolated worktrees and locating criteria, variants and consumers.
- **GitHub CLI**
  PR metadata, requirements, check evidence and authorized publication through REST on GitHub.
- **Project instructions, documentation and runtimes**
  Branch ownership, canon homes, schemas and validation tools selected by the active configuration.
- **Python 3.10+**
  The definition edit hook and its tests; the selected project's configuration supplies its tooling.
- **Agent host and sandbox**
  Repository access, local execution and artifact writing within the selected mode's authority. Independent sub-agents and observable tool results support audit slices and reading-path validation.
- **Claude Code hooks**
  Registers the definition edit hook for the session; its script resolves beneath the workspace root named by `CLAUDE_PROJECT_DIR`. Hosts without skill-hook support use the selected project's explicit checks.
- **Workflow resource access**
  A running workflow's resource tool can supply canon sections and report guides when available.
