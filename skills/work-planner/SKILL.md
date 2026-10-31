---
name: work-planner
description: >-
  Plans and maintains agent-engineering work on GitHub: proposals, initiatives, epics, tasks and theme boards. Use to propose work or scope a problem; plan or break down work; raise, restructure, align or renumber an initiative or epic; check issue format, criteria, dependencies or delivery; fold review findings into issues; sync completed work and close what is finished; advance a board, decide what moves to ready or what to pick up next; deliver board work or dispatch ready tasks; explain a pull request, write its architecture overview or diagram its changes; hoist, triage or find a home for orphan issues; produce a standup or Slack status update; or revise the work-planner skill itself.
---

# Work Planner

Work Planner plans work as GitHub issues and keeps the plan current until the work is delivered. The issues are the plan:

- **Proposal**  States the problem and the goal, with no Work Breakdown.
- **Initiative**  States a goal and lists its epics.
- **Epic**  Lists its tasks in a Work Breakdown table.
- **Task**  One pull request's worth of work.
- **Standalone issue**  Work outside any initiative.

Each theme's project board shows where its items stand. The Proposals board holds proposals. A planning record holds what an initiative leaves out: the evidence, the decisions and each review.

## Modes

Select the mode as appropriate to fulfill the user request:

- **[Propose](modes/propose-mode.md)**
  - Forward-looking, scoped to one problem
  - Scoping a problem nothing is planned against yet
  - Raising a proposal issue with optional board placement
- **[Plan](modes/plan-mode.md)**
  - Forward-looking, scoped to one approved proposal
  - Turning an approved proposal into initiatives
  - Raising, breaking down and restructuring initiatives and epics
  - Review passes of a plan against its goal, dependencies included
  - Renumbering of epics and tasks
  - Folding review findings into issues
- **[Align](modes/align-mode.md)**
  - Backward-looking, scoped to one epic, initiative or board
  - Checks of existing issues against their templates and the rules that bind them, with fixes
  - Acceptance criteria checked for verifiability and against the sources the initiative marks
  - Epic branch structure and task pull request bases brought to the delivery shape
- **[Sync](modes/sync-mode.md)**
  - Backward-looking, scoped to one epic, initiative or board
  - Delivery recorded against the issues that planned it
  - Closure of complete task issues, epics and initiatives
  - The theme board brought current with its issues
- **[Advance](modes/advance-mode.md)**
  - Forward-looking, scoped to one board
  - Placement of initiatives and epics as In Progress or as Ready
  - A parallel work map for initiatives with no priority
- **[Deliver](modes/deliver-mode.md)**
  - Forward-looking, scoped to one board
  - Delivery of a theme board's work, each unit planned, implemented and raised as a pull request
  - Dispatch of one session per unit of work
  - Merging task pull requests through the shared delivery procedure
- **[Understand](modes/understand-mode.md)**
  - Backward-looking, scoped to one pull request
  - An architecture overview of one pull request
  - Structural and functional diagrams of its changes
  - The order to read the diff in
- **[Hoist](modes/hoist-mode.md)**
  - Forward-looking, scoped to a repository's orphan issues
  - Discovery of orphan issues
  - Placements for each in an existing or new initiative, epic or task
- **[Standup](modes/standup-mode.md)**
  - Backward-looking, scoped to one board's reporting window
  - Standup summaries of a theme's board for a Slack channel
- **[Revise](modes/revise-mode.md)**
  - Forward-looking, scoped to this skill's own files
  - Changes to SKILL.md, its modes, artifacts, references and scripts

## Rules

- **Linked sections.**
  Read a heading-linked section and its subsections, stopping before the next heading of equal or higher level. Read that file's Prerequisites first; reading prerequisites does not execute procedures. A mode named in another mode's Prerequisites is read as a document, and its own Prerequisites load only where a step runs it. Preserve boundaries in batched reads and recover truncated output. Reuse complete prerequisites already read at the same revision. Explicit whole-document requirements still apply.
- **Decisions.**
  Ask one at a time, following the [interview rules](guidelines.md#modes). A decision the run's [allowance](artifacts/plan-change.md#allowance) covers is taken with its recommended option rather than asked. Record each decision in the affected issues and, when there is one, the planning record.
- **Layers.**
  Modes, protocols, artifacts. A mode aggregates protocol calls, as an application calls services; a protocol runs artifact operations and other protocols; an artifact runs neither. A call goes down the stack, never up. A mode reaches an artifact operation directly only where no protocol owns that change.
- **Execution.**
  A call passes its named inputs. A protocol is one change that lands in several artifacts together, and is run whole. Run another mode, a protocol, or a named subsection only where the procedure calls it; finish that call and return its result before continuing, unless the procedure explicitly dispatches concurrent work.

## Conventions

- **Session.**
  Once per session, before the first `gh` call, unset `GH_TOKEN` and `GITHUB_TOKEN` so `gh` uses its keyring login. Where shell state does not persist between commands, confirm instead that neither is set in the shell profile.
- **Repository.**
  `gh` resolves `{owner}/{repo}` from the git remote of the directory it runs in, so run `gh` commands inside a checkout of the repository that holds the issues. `{other}` is a further repository the board's issues live in.
- **Bodies.**
  - Bodies and long comments always go through a file (`-F body=@file`), never inline, which avoids quoting.
  - **Example.**  workflow-server's dynamic-shell restrictions deny a body inlined in the command.
  - Keep these files in a working directory outside the repository.
- **Scripts.**
  Scripts run under `sbx`, invoked by its absolute path from `<workspace>`, the checkout holding this skill.
- **Boards.**
  A project board sits under `users/{owner}`, or `orgs/{owner}` when `gh api repos/{owner}/{repo} --jq .owner.type` is `Organization`.
- **Example values.**  Substitute the real ones:
  - `936` an initiative issue, `943` and `937` its epics, `637` a task issue, `874` an orphan, `946` an initiative off the board, `960` a proposal;
  - `950` a pull request, `I07` and `I08` initiative numbers;
  - board `9`, workflow-server's Canon theme, and `419167630` its Status field id;
  - `1` the Initiative Template board, `13` a board copied from it;
  - `14` the Proposals Template, `15` the Proposals board;
  - `m2ux` the user.
  - `<checkout>` any checkout of the project, a linked worktree included.

## Dependencies

- **GitHub CLI (`gh`).**
- **Sandbox.** (`scripts/sbx`).
- **Python 3.10 or later.**
- **git.**
- **GitNexus.**
- **Sub-agents.**
