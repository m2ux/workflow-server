---
name: work-planner
description: >-
  Plans and maintains agent-engineering work on GitHub: [I] proposal issues, [Ixx] initiative
  issues, their [Ixx:Eyy] epics and [Ixx:Eyy:Wzz] tasks, each theme's project board, and the
  Proposals board. Use to propose work or raise a proposal; to plan the work, plan out, scope or
  break down work, or write a work plan or work breakdown; to raise, plan, restructure, review or
  renumber an initiative or epic; to check an issue's format or dependency order; to fold review
  findings into issues; to sync an initiative or epic with completed work; to hoist or triage
  orphan issues into an initiative; for a progress summary, standup or status update in Slack; or
  to revise or update the work-planner skill itself.
---

# Work Planner

Work Planner plans work as GitHub issues and keeps the plan current until the work is delivered. The issues are the plan:

- **Proposal**  States a goal in an initiative's sections, with no Work Breakdown.
- **Initiative**  States a goal and lists its epics.
- **Epic**  Lists its tasks in a Work Breakdown table.
- **Task**  One pull request's worth of work.
- **Standalone issue**  Work outside any initiative.

Each theme's project board shows where its items stand. The Proposals board holds proposals. A planning record holds what an initiative leaves out: the evidence, the decisions and each review.

## Modes

Read the file for the mode the request calls for:

- **[Propose](references/propose-mode.md)**
  - The same intake as Plan: a confirmed goal and the evidence behind it
  - One proposal issue, titled `[I]` with no number
  - Placement on the Proposals board, in Suggested
- **[Plan](references/plan-mode.md)**
  - Raising, planning and restructuring initiatives and epics
  - Review passes of a plan against its goal
  - Dependency checks
  - Renumbering of epics and tasks
  - Folding review findings into issues
- **[Review](references/review-mode.md)**
  - Checks of existing issues against the templates
  - Fixes for each issue that departs from its template
  - A scan for a merged pull request whose task still has an unticked coverage criterion
  - A scan for an initiative criterion still unticked, or ticked early, against the epics that cite it
- **[Sync](references/sync-mode.md)**
  - Links from each task that has a pull request to that pull request, open or merged
  - Ticks for the criteria that hold, and for each Work Breakdown row once it is complete
  - Closure of complete task issues, epics and initiatives
  - The theme board brought current with its issues
- **[Hoist](references/hoist-mode.md)**
  - Discovery of orphan issues
  - Placements for each in an existing or new initiative, epic or task
  - Migration or subsumption of the orphans the user places
  - Formatting of orphans with target's rules and deprecating body
- **[Progress](references/progress-mode.md)**
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
| Proposal | `[I] Name: Subtitle` | `type:proposal` |
| Initiative | `[I07] Name: Subtitle` | `type:initiative`, a `theme:*` |
| Epic | `[I07:E00] Name: Subtitle` | `type:epic`, its initiative's `theme:*` |
| Task | `[I07:E00:W01] Name: Subtitle` | `type:task` |
| Standalone issue | `Name: Subtitle`, with no prefix | no `type:*` |

- **Numbers.**
  - `I` is the initiative number, `E` the epic within it, and `W` the task within the epic.
  - Initiatives and epics count from `00`, and tasks from `W01`.
  - A proposal's prefix is `[I]`, with no number.
- **Titles.**
  - The prefix separates levels with colons (`[I07:E00:W01]`), then a short name, a colon, and a subtitle stating the outcome.
  - The name is two or three words and the subtitle a succinct summary of at most ten, both in title case: `[I07:E06] Reliability Evaluation: Briefs, Measures and the Thresholds That Define Reliable`.
  - A standalone issue's title is the same without the prefix.
- **Bodies.**
  - Every body follows its template: [proposal.md](templates/proposal.md), [initiative.md](templates/initiative.md), [epic.md](templates/epic.md), [task.md](templates/task.md), [issue.md](templates/issue.md) for a standalone issue outside any initiative, and [pull-request.md](templates/pull-request.md) for a pull request.
  - A proposal has the initiative's sections without the Work Breakdown table.
  - A task or standalone issue has an epic's structure without the Work Breakdown table.
  - Keep the section order and the table columns.
  - Fill each `{{…}}` and delete a section the template marks as optional when it has nothing to say.
  - What a body leaves out is in the [Work Breakdown guide](references/work-breakdown.md).
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
  Find the next initiative number with [List initiative titles](references/commands.md#list-initiative-titles).
- **Labels.**
  - Besides the type and theme, add `enhancement`, `bug`, `tech-debt`, `workflows` and a `priority: *` as they apply.
  - Only labels that exist, as [List labels](references/commands.md#list-labels) shows.

## Themes and boards

Every initiative belongs to one theme, and each theme has one project board.

| Theme | Label | Description |
| --- | --- | --- |
| Canon | `theme:canon` | Definitions Checked Against the Design Canon |
| Language | `theme:language` | The Definition Language and Its Rules |
| Mechanical | `theme:mechanical` | The Engine That Runs Definitions |
| Delivery | `theme:delivery` | What Reaches Agents and Hosts |

- **One theme.**
  An initiative carries one `theme:*` label, and each of its epics carries the same one.
- **One board per theme.**
  - Its title is the theme's name, a colon, and its description: `Canon: Definitions Checked Against the Design Canon`.
  - It is linked to the repository.
  - It holds the theme's initiatives, their epics and their task issues.
- **Assignees.**
  An issue at Ready, In Progress, In Review or Done is assigned to the user; one in Backlog has no assignee.
- **Standalone issues.**  A standalone issue sits on no board.
- **Proposals.**
  - The board is titled `Proposals`. It holds proposal issues, the incoming funnel for work that may become an initiative.
  - Its copy source is the open board titled `Proposals template`. That template carries Priority: High, Medium and Low, and its view is a board grouped by Status.
  - When no open board is titled `Proposals`, [Create proposals board](references/commands.md#create-proposals-board) creates it.
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
  - [Create board](references/commands.md#create-board) copies the Initiative template, titles the copy as above, and links it to the repository.

## Dependencies

- **GitHub CLI (`gh`).**
  - Logged in through its keyring, with the `repo` scope for issues and pull requests and the `project` scope for project boards.
  - Issue and pull request calls go through REST (`gh api`), never GraphQL, and every call needs full host permissions.
  - A board is created with `gh project`, as [Create board](references/commands.md#create-board) and [Create proposals board](references/commands.md#create-proposals-board) specify.
- **Sandbox.**
  `scripts/sbx` in the workspace checkout, the one holding this skill, runs the skill's scripts under bubblewrap with no network. `<workspace>` in the mode files stands for that checkout.
- **Python 3.10 or later.**
  Standard library only, for the scripts in `scripts/` and their tests in `test/`.
- **git.**
  - For the planning record: a worktree of the `engineering` branch, whose records live under `artifacts/planning/`.
  - For delivery: each initiative's integration branches, which its pull requests target, per the [Work Breakdown guide](references/work-breakdown.md#delivery).
- **Sub-agents.**  Where the harness has them, for plan mode's broad evidence sweeps.

## Rules

- **Work Breakdown guide.**
  Every mode reads [work-breakdown.md](references/work-breakdown.md): the columns, numbering, references and delivery of the Work Breakdown tables, and what a [Problem and a Proposal](references/work-breakdown.md#problem-and-proposal) hold.
- **Decisions.**
  - Ask them one at a time, each with a recommended option.
  - Record each answer in the affected issues and, when there is one, the planning record.
- **Measured claims.**  A count or a chain comes from a command's output, never from a hand count.
- **Bodies state the plan as it is.**
  - No body carries change narrative: nothing moved, renumbered, replaced, discharged or formerly anything.
  - How the plan evolved goes in the planning record and in commit and pull request bodies.
- **Other initiatives.**  Editing another initiative's issue needs the user's explicit approval.
- **Replies to feedback.**
  - Once feedback on an issue is folded into its body, a comment mentions the reviewer and answers each of their points in turn, precisely and factually, with no thanks or filler. It is posted with [Comment on issue](references/commands.md#comment-on-issue).
  - Each answer names what the body now says, by criterion id where one carries it, or the issue that takes the point.
- **Commands**
  Every command one spec in [commands.md](references/commands.md), with the conventions they share.
