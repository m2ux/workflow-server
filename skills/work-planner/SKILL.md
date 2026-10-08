---
name: work-planner
description: >-
  Plans and maintains agent-engineering work on GitHub: proposal issues, [Ixx] initiative
  issues, their [Ixx:Eyy] epics and [Ixx:Eyy:Wzz] tasks, each theme's project board, and the
  Proposals board. Use to propose work, scope the problem, or raise a proposal; to plan the work,
  scope the solution, or break down work, or write a work plan or work breakdown; to raise, plan, restructure, align or
  renumber an initiative or epic; to check an issue's format, its compliance with the rules, its criteria or its dependency
  order, or a Done column that disagrees with its delivery, or a merged task that still carries an unmet criterion; to fold review findings into issues; to sync an initiative or epic with completed work; to advance a board or decide what moves to ready;
  to deliver the work on a board, start the work it makes available, or dispatch sessions for ready tasks;
  to understand or explain a pull request's changes, write an architecture overview of one, or diagram what a change does for its reviewer;
  to hoist or triage orphan issues into an initiative; for a standup or a status update in Slack;
  or to revise or update the work-planner skill itself.
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

Read the file for the mode the request calls for:

- **[Propose](references/propose-mode.md)**
  - Scoping the problem: the friction, the evidence, and the boundary
  - Stating the goal as clauses someone could observe
  - Raising one proposal issue
  - Placing it on the Proposals board
- **[Plan](references/plan-mode.md)**
  - Taking a proposal's problem and goal as the scope it plans
  - Raising, planning and restructuring initiatives and epics
  - Acceptance criteria that comply with the goal pass when they are written
  - Review passes of a plan against its goal
  - Dependency checks
  - Renumbering of epics and tasks
  - Folding review findings into issues
- **[Align](references/align-mode.md)**
  - Checks of existing issues against the templates and against the rules that bind them
  - Fixes for each issue that departs from its template or from those rules
  - A check of every acceptance criterion against the verifiable rule
  - An alignment of every acceptance criterion with the sources the initiative marks
  - A further task that adopts each criterion a merged pull request leaves unticked
  - A scan for an initiative criterion still unticked, or ticked early, against the epics that cite it
  - Repair of a work-breakdown cell that disagrees with its delivery
  - Epic bases for an initiative in progress, and open task pull requests pointed at them
  - A row for a task issue the epic table does not list
  - A review pull request for an epic whose tasks are delivered and whose criteria are ticked
- **[Sync](references/sync-mode.md)**
  - Links from each task that has a pull request to that pull request, open or merged
  - Ticks for the criteria that hold, and for each Work Breakdown row once it is complete
  - Closure of complete task issues, epics and initiatives
  - Pull requests merging a completed epic's bases into its initiative's integration branches
  - The theme board brought current with its issues
- **[Advance](references/advance-mode.md)**
  - Sync of the board's open initiatives
  - A parallel work map for initiatives with no priority
  - Placement of the highest set as In Progress and the next set as Ready
  - Placement of a partly completed epic as In Progress and the next unstarted epic as Ready
- **[Deliver](references/deliver-mode.md)**
  - Delivery of a theme board's work, each unit planned, implemented and raised as a pull request
  - Advance of the board the work is taken from
  - The units of work its epics make available, and the rows a session holds
  - A planning record and a row's link that hold each unit for one session
  - A session per unit, in a worktree of its own
  - A test for each criterion a unit delivers, of the kind that criterion can be observed by
  - A test plan table mapping each test to the parent epic criteria it covers
  - A merge, on each run, of an open pull request whose test plan has passed
  - A merge of the unit's pull request into the epic base once its test plan has passed
  - Hoisting of issues arising from the delivery of a unit
- **[Understand](references/understand-mode.md)**
  - An architecture overview of one pull request, for the engineer who reviews it
  - A structural and a functional diagram, drawn from the structure the graph measures over the change
  - The order to read the diff in
  - A planning record of its own, held by the pull request's number
  - A References row on the pull request linking the overview
- **[Hoist](references/hoist-mode.md)**
  - Discovery of orphan issues
  - Placements for each in an existing or new initiative, epic or task
  - Migration or subsumption of the orphans the user places
  - Formatting of orphans with target's rules and deprecating body
- **[Standup](references/standup-mode.md)**
  - Standup summaries of a theme's board for a Slack channel
  - A paragraph for management on what the window accomplished
  - What completed, what is in progress and what is next
- **[Revise](references/revise-mode.md)**
  - To make changes to this skill's own files
  - Conformance with the [skill guidelines](../guidelines.md) and the skill's own [guidelines](references/guidelines.md)

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
  - Besides the type and theme, add `enhancement`, `bug`, `tech-debt` and `priority:` with a positive integer as they apply. A larger number is higher. There is no maximum.
  - **Example.**  workflow-server adds `workflows`.
  - Only labels that exist, as [List Labels](references/commands.md#list-labels) shows.

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
  - When no open board is titled `Proposals`, [Create Proposals Board](references/commands.md#create-proposals-board) creates it.
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
  - [Create Board](references/commands.md#create-board) copies the Initiative Template, titles the copy as above, and links it to the repository.

## Dependencies

- **GitHub CLI (`gh`).**
  - Logged in through its keyring, with the `repo` scope for issues and pull requests and the `project` scope for project boards.
  - Issue and pull request calls go through REST (`gh api`), and every call needs full host permissions. What REST does not expose, such as a pull request's Development field, goes through `gh api graphql`.
  - A board is created with `gh project`, as [Create Board](references/commands.md#create-board) and [Create Proposals Board](references/commands.md#create-proposals-board) specify.
- **Sandbox.**
  `scripts/sbx` in the workspace checkout, the one holding this skill, runs the skill's scripts under bubblewrap with no network. `<workspace>` in the mode files stands for that checkout.
- **Python 3.10 or later.**
  Standard library only, for the scripts in `scripts/` and their tests in `test/`.
- **git.**
  - For the planning record: [Add Planning Record](references/commands.md#add-planning-record).
  - For delivery: each initiative's integration branches and each epic's base branches, per the [Work Breakdown Guide](references/work-breakdown.md#delivery).
  - For dispatch: a worktree per unit of work, as [Create Task Worktree](references/commands.md#create-task-worktree) cuts it.
  - For understanding a change: a worktree at a pull request's head commit, as [Create Pull Request Worktree](references/commands.md#create-pull-request-worktree) cuts it.
- **GitNexus.**
  The `gitnexus` command, for the structure [Understand Mode](references/understand-mode.md) measures over a change. It indexes the repository under review itself, as [Index Repository](references/commands.md#index-repository) runs it, so an unindexed repository costs that run rather than blocking the mode.
- **Sub-agents.**
  The dispatch of the session this skill runs in. [Deliver Mode](references/deliver-mode.md#rules) starts each unit's session with it, and [Plan Mode](references/plan-mode.md) delegates a broad evidence sweep to it.

## Rules

- **Work Breakdown Guide.**
  Every mode reads the [Work Breakdown Guide](references/work-breakdown.md): the columns, numbering, references and delivery of the Work Breakdown tables, and what a [Problem and a Proposal](references/work-breakdown.md#problem-and-proposal) hold.
- **Decisions.**
  - Ask them one at a time, as an [Interview](references/interview.md).
  - Record each answer in the affected issues and, when there is one, the planning record.
- **Measured claims.**  A count or a chain comes from a command's output, never from a hand count.
- **Bodies state the plan as it is.**
  - No body carries change narrative: nothing moved, renumbered, replaced, discharged or formerly anything.
  - How the plan evolved goes in the planning record and in commit and pull request bodies.
- **Other initiatives.**  Editing another initiative's issue needs the user's explicit approval.
- **References.**
  The References section does not link issues or pull requests on the same board. Relational logic is communicated by the GitHub project, not by bare links.
- **Replies to feedback.**
  - Once feedback on an issue is folded into its body, a comment mentions the reviewer and answers each of their points in turn, precisely and factually, with no thanks or filler. It is posted with [Comment on Issue](references/commands.md#comment-on-issue).
  - Each answer names what the body now says, by criterion id where one carries it, or the issue that takes the point.
- **Commands**
  Every command one spec in [Commands](references/commands.md), with the conventions they share.
