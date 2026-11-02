---
name: workflow-canon
description: >-
  A work-design assistant for workflow-server goals, requirements, architecture, contracts and design decisions. Use to author workflow definitions ("write a new activity", "apply this finding"), audit them against the design canon ("audit workflow X", "why is this an anti-pattern?"), review integrations ("check these branches together", "assess integration readiness"), or revise this skill ("update the workflow-canon skill").
hooks:
  PostToolUse:
    - matcher: "Edit|Write|MultiEdit"
      hooks:
        - type: command
          command: "python3 \"${CLAUDE_PROJECT_DIR}/.claude/skills/workflow-canon/scripts/edit_guard.py\""
---

# Workflow Canon

Workflow Canon is a work-design assistant for shaping workflow-server work around its goals, requirements, architecture and constraints.

- **Work**  Intended outcomes, requirements and constraints.
- **Design**  Architecture, responsibilities, definitions and contracts.
- **Canon**  The project's authoritative design criteria and conventions.
- **Evidence**  Observations supporting design decisions, with their limits stated.

## Modes

Read the selected mode's file in full, then follow its links as each step needs them:

- **[Author](references/author-mode.md)**
  - Forward-looking, scoped to the definitions a change names
  - Authoring definitions and specified changes
  - Closing confirmed findings with their prescribed fixes
- **[Audit](references/audit-mode.md)**
  - Backward-looking, scoped to the existing definitions under audit
  - Conformance of existing definitions with the design canon
  - A single canon question answered against that canon
- **[Review](references/review-mode.md)**
  - Backward-looking, scoped to one integration's branches
  - Branches checked for what they amount to taken together
  - A readiness assessment for an integration
- **[Revise](references/revise-mode.md)**
  - Forward-looking, scoped to this skill's own files
  - Changes to this skill's own files

## Rules

- **Measured claims.**
  Counts, revision identities and check outcomes come from command output or preserved run evidence.
- **One home.**
  Project documents own their design criteria. Fetch the authoritative section and apply it as written, including its exclusions; notes taken from it do not replace it.
- **Linked sections.**
  Retrieve a heading-linked section and its subsections only, stopping before the next heading of equal or higher level. Use targeted search and range reads; follow required prerequisites and expand only to resolve missing context. Explicit whole-document reading requirements still apply.
- **Planning.**
  When creating or using artifacts, all modes follow [Planning](references/planning.md).
- **Commands.**
  Before the first command spec, read the [shared command conventions](references/command-conventions.md). Each reference file carries the commands its own procedure runs, under its own conventions, so a file held in full supplies both.

## Dependencies

- **Git and repository search**
  Revision capture, comparisons, isolated worktrees and locating criteria and consumers.
- **GitHub CLI**
  PR metadata, requirements, check evidence and authorized publication through REST on GitHub.
- **Project instructions, documentation and runtimes**
  Branch ownership, canon homes, schemas and validation tools for the affected product.
- **Node and npm**
  Engine and corpus checks use the paired engine's runtime, lockfile and installed tools, including TypeScript and `tsx`.
- **Docker and Compose**
  Packaging checks build and exercise disposable images and containers when deployment behavior is affected.
- **Python 3.10+**
  The definition edit hook, audit inventory/state/dispatch scripts and their tests.
- **Paired YAML parser**
  The audit adapter loads the paired engine's installed `yaml` package through Node; its identity is captured with the source snapshot.
- **Agent host and sandbox**
  Repository access, local execution and artifact writing within the selected mode's authority. Independent sub-agents and observable tool results support audit slices and reading-path validation.
- **Claude Code hooks**
  Registers the definition edit hook for the session; its script resolves beneath the workspace root named by `CLAUDE_PROJECT_DIR`. Hosts without skill-hook support run the applicable explicit checks.
- **Workflow resource access**
  A running workflow's resource tool can supply canon sections and report guides when available.
