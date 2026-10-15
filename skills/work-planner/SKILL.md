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

Read the selected mode's file in full, then follow its links as each step needs them:

- **[Propose](references/propose-mode.md)**
  - Forward-looking, scoped to one problem
  - Scoping a problem nothing is planned against yet
  - Raising one proposal issue on the Proposals board
- **[Plan](references/plan-mode.md)**
  - Forward-looking, scoped to one initiative and its epics
  - Turning an approved proposal into an initiative
  - Raising, breaking down and restructuring initiatives and epics
  - Review passes of a plan against its goal, dependencies included
  - Renumbering of epics and tasks
  - Folding review findings into issues
- **[Align](references/align-mode.md)**
  - Backward-looking, scoped to one initiative's issues
  - Checks of existing issues against their templates and the rules that bind them, with fixes
  - Acceptance criteria checked for verifiability and against the sources the initiative marks
  - Epic branch structure and task pull request bases brought to the delivery shape
- **[Sync](references/sync-mode.md)**
  - Backward-looking, scoped to one initiative
  - Delivery recorded against the issues that planned it
  - Closure of complete task issues, epics and initiatives
  - The theme board brought current with its issues
- **[Advance](references/advance-mode.md)**
  - Forward-looking, scoped to one board
  - Placement of initiatives and epics as In Progress or as Ready
  - A parallel work map for initiatives with no priority
- **[Deliver](references/deliver-mode.md)**
  - Forward-looking, scoped to one board
  - Delivery of a theme board's work, each unit planned, implemented and raised as a pull request
  - Dispatch of one session per unit of work
  - Merging task pull requests through the shared delivery procedure
- **[Understand](references/understand-mode.md)**
  - Backward-looking, scoped to one pull request
  - An architecture overview of one pull request
  - Structural and functional diagrams of its changes
  - The order to read the diff in
- **[Hoist](references/hoist-mode.md)**
  - Forward-looking, scoped to a repository's orphan issues
  - Discovery of orphan issues
  - Placements for each in an existing or new initiative, epic or task
- **[Standup](references/standup-mode.md)**
  - Backward-looking, scoped to one board's reporting window
  - Standup summaries of a theme's board for a Slack channel
- **[Revise](references/revise-mode.md)**
  - Forward-looking, scoped to this skill's own files
  - Changes to SKILL.md, its references, templates and scripts

## Formatting Scheme

Every issue the skill writes follows this scheme: its title, labels and body.

| Level | Title | Labels |
| --- | --- | --- |
| Proposal | `Name: Subtitle`, with no prefix | `type:proposal` |
| Initiative | `[I07] Name: Subtitle` | `type:initiative`, a `theme:*` |
| Epic | `[I07:E00] Name: Subtitle` | `type:epic`, its initiative's `theme:*` |
| Task | `[I07:E00:W01] Name: Subtitle` | `type:task` |
| Standalone issue | `Name: Subtitle`, with no prefix | no `type:*` |

- **Numbers.**
  - `I` is the initiative number, `E` the epic within it, and `W` the task within the epic.
  - Initiatives and epics count from `00`, and tasks from `W01`.
- **Titles.**
  - The prefix separates levels with colons (`[I07:E00:W01]`), then a short name, a colon, and a subtitle stating the outcome.
  - The name is two or three words and the subtitle a succinct summary of at most ten, in [title case](references/guidelines.md#titles): `[I07:E06] Reliability Evaluation: Briefs, Measures and the Thresholds That Define Reliable`.
  - A standalone issue's title is the same without the prefix.
- **Bodies.**
  - Every body follows its template: a [proposal](templates/proposal.md), an [initiative](templates/initiative.md), an [epic](templates/epic.md), a [task](templates/task.md), a [standalone issue](templates/issue.md), and a [pull request](templates/pull-request.md).
  - A proposal has the initiative's sections without the Work Breakdown table.
  - A task or standalone issue has an epic's structure without the Work Breakdown table.
  - Keep the section order and the table columns.
  - Fill each `{{…}}` and delete a section the template marks as optional when it has nothing to say.
  - What a body leaves out is in the [Work Breakdown Guide](references/work-breakdown.md#rules).
- **Code references.**
  A body references code as a link on the words it supports, a permalink pinned to a commit with its line anchors, never a bare `path:line`: `the [extrinsic type](…/blob/<sha>/runtime/src/lib.rs#L1231-L1232)`.
- **Succinct items.**
  Each Problem and Proposal item, and each of its sub-bullets, is at most two lines. A bold opener does not count toward the two. Several distinct points go in a bulleted list, never packed into those two lines.
- **Bold leads.**
  - A Problem or Proposal item that opens with a bold statement puts its body on the next line, indented under the bullet:

    ```markdown
    - **Length is the only check on entry.**
      The data source decodes the key and never checks its value.
    ```

  - A bulleted item with sub-bullets keeps the line introducing them on its bold statement's line:

    ```markdown
    - **Framing is undocumented.** Nothing describes:
      - the runtime's extrinsic type;
    ```
- **Next number.**
  Find the next initiative number with [List Initiative Titles](references/commands.md#list-initiative-titles).
- **Labels.**
  - Besides the type and theme, add `enhancement`, `bug` and `tech-debt` as they apply. Priority labels follow [Advance Mode](references/advance-mode.md#rules).
  - **Example.**  workflow-server adds `workflows`.
  - Only labels that exist, as [List Labels](references/propose-mode.md#list-labels) shows.

## Themes and Boards

Every initiative belongs to one theme, and each theme has one project board. Each project names its own themes.

- **Example.**  workflow-server's themes.

| Theme | Label | Description |
| --- | --- | --- |
| Canon | `theme:canon` | Definitions Checked Against the Design Canon |
| Language | `theme:language` | The Definition Language and Its Rules |
| Mechanical | `theme:mechanical` | The Engine That Runs Definitions |
| Delivery | `theme:delivery` | What Reaches Agents and Hosts |

- **One theme.**
  An initiative carries one `theme:*` label, and each of its epics carries the same one.
- **One board per theme.**
  - Its title is the theme's name, a colon, and its description. In the example, Canon is `Canon: Definitions Checked Against the Design Canon`.
  - It is linked to the repository.
  - It holds the theme's initiatives, their epics and their task issues.
- **Assignees.**
  An issue at Ready, In Progress, In Review or Done is assigned to the user; one in Backlog has no assignee.
- **Standalone issues.**  A standalone issue sits on no board.
- **Proposals.**
  - The board is titled `Proposals`. It holds proposal issues, the incoming funnel for work that may become an initiative.
  - Its copy source is the open board titled `Proposals Template`. That template carries Priority: High, Medium and Low, and its view is a board grouped by Status.
  - When no open board is titled `Proposals`, [Create Proposals Board](references/propose-mode.md#create-proposals-board) creates it.
  - **Suggested.**
    Raised, and nobody has taken it up. A new proposal lands here, with no assignee.
  - **Considering.**
    Someone is weighing the goal, the evidence and the criteria. That person is the assignee.
  - **Approved.**
    Qualified to become an initiative. The assignee is the user.
  - **Held.**
    Not now. It stays on the board, with no assignee.
  - **Declined.**
    It will not become an initiative. It has no assignee.
- **A new theme.**
  - It needs its label and its board before an initiative takes it.
  - [Create Board](references/sync-mode.md#create-board) copies the Initiative Template, titles the copy as above, and links it to the repository.

## Rules

- **Linked sections.**
  Read a heading-linked section and its subsections, stopping before the next heading of equal or higher level. Follow required prerequisites; preserve each boundary in batched reads and recover truncated output. Explicit whole-document requirements still apply.
- **Work Breakdown Guide.**
  Every mode reads the [Work Breakdown Guide](references/work-breakdown.md): the columns, numbering, references and delivery of the Work Breakdown tables, and what a [Problem and a Proposal](references/work-breakdown.md#problem-and-proposal) hold.
- **Issue closure.**
  Every completion follows [Issue Closure](references/work-breakdown.md#issue-closure), including its repository prerequisite before linking or merging delivery pull requests.
- **Decisions.**
  - Ask them one at a time, as an [Interview](references/interview.md).
  - Record each answer in the affected issues and, when there is one, the planning record.
- **Measured claims.**  A count or a chain comes from a command's output, never from a hand count.
- **Bodies state the plan as it is.**
  - No body carries change narrative: nothing moved, renumbered, replaced, discharged or formerly anything.
  - How the plan evolved goes in the planning record and in commit and pull request bodies.
- **Other initiatives.**  Editing another initiative's issue needs the user's explicit approval.
- **References.**
  An issue's References section does not link issues or pull requests on the same board. The GitHub project holds those relationships. Pull request References follow [Review pull request](references/work-breakdown.md#review-pull-request) and [Understand Mode](references/understand-mode.md#rules).
- **Replies to feedback.**
  - Once feedback on an issue is folded into its body, a comment mentions the reviewer and answers each of their points in turn, precisely and factually, with no thanks or filler. It is posted with [Comment on Issue](references/commands.md#comment-on-issue).
  - Each answer names what the body now says, by criterion id where one carries it, or the issue that takes the point.
- **Commands**
  Every command spec runs under the [Command Conventions](#command-conventions) below. Reuse complete prerequisites already read at the same revision; retrieve specific operations where needed.

## Command Conventions

How every command of this skill runs, held here because selecting a mode already opens this file.

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
  - Logged in through its keyring, with the `repo` scope for issues and pull requests and the `project` scope for project boards.
  - Issue and pull request API calls use REST (`gh api`), with full host permissions. Development links use [Development Access](references/commands.md#development-access).
  - A board is created with `gh project`, as [Create Board](references/sync-mode.md#create-board) and [Create Proposals Board](references/propose-mode.md#create-proposals-board) specify.
- **Sandbox.**
  `scripts/sbx` in the workspace checkout, the one holding this skill, runs the skill's scripts under bubblewrap with no network. `<workspace>` in the mode files stands for that checkout.
- **Python 3.10 or later.**
  Standard library only, for the scripts in `scripts/` and their tests in `test/`.
- **git.**
  - For the planning record: [Add Planning Record](references/commands.md#add-planning-record).
  - For delivery: each epic's base branches, per the [Work Breakdown Guide](references/work-breakdown.md#delivery).
  - For dispatch: a worktree per unit of work, as [Create Task Worktree](references/deliver-mode.md#create-task-worktree) cuts it.
  - For understanding a change: a worktree at a pull request's head commit, as [Create Pull Request Worktree](references/understand-mode.md#create-pull-request-worktree) cuts it.
- **GitNexus.**
  The `gitnexus` command, for the structure [Understand Mode](references/understand-mode.md) measures over a change. It indexes the repository under review itself, as [Index Repository](references/understand-mode.md#index-repository) runs it, so an unindexed repository costs that run rather than blocking the mode.
- **Sub-agents.**
  The dispatch of the session this skill runs in. [Deliver Mode](references/deliver-mode.md#rules) starts each unit's session with it, and [Propose Mode](references/propose-mode.md) delegates a broad evidence sweep to it.
