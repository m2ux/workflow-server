---
name: work-planner
description: >-
  Plans and maintains agent-engineering work on GitHub: proposals, initiatives, epics, tasks and theme boards. Use to propose work or scope a problem; plan or break down work; raise, restructure, align or renumber an initiative or epic; check issue format, criteria, dependencies or delivery; fold review findings into issues; sync completed work and close what is finished; advance a board, decide what moves to ready or what to pick up next; deliver board work or dispatch ready tasks; understand or explain a pull request, write its architecture overview or diagram its changes; hoist, triage or find a home for orphan issues; produce a standup or Slack status update; or revise the work-planner skill itself.
---

# Work Planner

Work Planner plans work as GitHub issues and keeps the plan current until the work is delivered. The issues are the plan:

- **Proposal**  States the problem and the goal, with no Work Breakdown.
- **Initiative**  States a goal and lists its epics.
- **Epic**  Lists its tasks in a Work Breakdown table.
- **Task**  One pull request's worth of work.
- **Standalone issue**  Work outside any initiative.
- **[Hot-fix](artifacts/hotfix-body.md)**  A fix to a long-lived branch beside all queued work.

Each theme's project board shows where its items stand. The [proposals board](configuration.md#proposals-board) holds proposals. A planning record holds what an initiative leaves out: the evidence, the decisions and each review.

Read [Rules](rules.md) and [Conventions](conventions.md) before selecting a mode.

## Modes

Select the mode as appropriate to fulfill the user request:

- **[Propose](modes/propose-mode.md "ƒ")**
  - Forward-looking, scoped to one problem
  - Scoping a problem nothing is planned against yet
  - Raising a proposal issue with optional board placement
- **[Plan](modes/plan-mode.md "ƒ")**
  - Forward-looking, scoped to one approved proposal
  - Turning an approved proposal into initiatives
  - Raising, breaking down and restructuring initiatives and epics
  - Review passes of a plan against its goal, dependencies included
  - Renumbering of epics and tasks
  - Folding review findings into issues
- **[Align](modes/align-mode.md "ƒ")**
  - Backward-looking, scoped to one epic, initiative or board
  - Checks of existing issues against their templates and the rules that bind them, with fixes
  - Acceptance criteria checked for verifiability and against the sources the initiative marks
  - Epic branch structure and task pull request bases brought to the delivery shape
- **[Sync](modes/sync-mode.md "ƒ")**
  - Backward-looking, scoped to one epic, initiative or board
  - Delivery recorded against the issues that planned it
  - Closure of complete task issues, epics and initiatives
  - The theme board brought current with its issues
- **[Advance](modes/advance-mode.md "ƒ")**
  - Forward-looking, scoped to one board
  - Placement of initiatives and epics as In Progress or as Ready, and of hot-fixes as their [Board Status](artifacts/hotfix.md#board-status) gives
  - A parallel work map for initiatives with no priority
- **[Deliver](modes/deliver-mode.md "ƒ")**
  - Forward-looking, scoped to one board
  - Delivery of a theme board's work, each unit planned, implemented and raised as a pull request
  - Dispatch of one session per unit of work
  - Merging task pull requests through the shared delivery procedure
- **[Understand](modes/understand-mode.md "ƒ")**
  - Backward-looking, scoped to one pull request
  - An architecture overview of one pull request
  - Structural and functional diagrams of its changes
  - The order to read the diff in
- **[Hoist](modes/hoist-mode.md "ƒ")**
  - Forward-looking, scoped to a repository's orphan issues
  - Discovery of orphan issues
  - Placements for each in an existing or new initiative, epic or task, or as a hot-fix
- **[Standup](modes/standup-mode.md "ƒ")**
  - Backward-looking, scoped to one board's reporting window
  - Standup summaries of a theme's board for a Slack channel
- **[Revise](modes/revise-mode.md "ƒ")**
  - Forward-looking, scoped to this skill's own files
  - Changes to SKILL.md, its modes, artifacts, references and scripts

## Dependencies

- **GitHub CLI (`gh`).**
- **Sandbox.** (`scripts/sbx`).
- **Python 3.10 or later.**
- **git.**
- **GitNexus.**
- **Sub-agents.**
- **Epic-base merge permission.**
  The agent harness grants the [Merge Permission](artifacts/pull-request.md#merge-permission) Deliver needs.
