---
name: work-planner
description: >-
  Plans and maintains agent-engineering work on GitHub: [Ixx] initiative issues, their [Ixx:Eyy]
  epics and [Ixx:Eyy:Wzz] tasks, and the initiative's project board. Use to plan the work, plan out,
  scope or break down work, or write a work plan or work breakdown; to raise, plan, restructure,
  review or renumber an initiative or epic; to check an issue's format or dependency order; to fold
  review findings into issues; to update an initiative or epic with completed work; to hoist or
  triage orphan issues into an initiative; or for a progress summary, standup or status update in
  Slack.
---

# Work Planner

Work Planner plans agent-engineering work as GitHub issues and keeps the plan current until the work is delivered.

The plan has three levels. An initiative issue states a goal and lists its epics. Each epic is an issue whose Work Breakdown table lists its tasks. A task is one pull request's worth of work: a row in its epic, with an issue of its own only when it needs discussion or evidence. The issues are the plan, and the initiative's project board shows where each item stands. A planning record on the `engineering` branch holds what the issues leave out: the evidence, the decisions and each review.

The modes follow the plan through its life: Plan writes it, Review keeps its issues to the templates, Update records work as it lands, Hoist brings stray issues into it, and Progress reports on it.

## Modes

Read the file for the mode the request calls for:

- **[Plan](references/plan-mode.md)**
  - Raising, planning and restructuring initiatives and epics
  - Review passes of a plan against its goal
  - Dependency checks
  - Renumbering of epics and tasks
  - Folding review findings into issues
- **[Review](references/review-mode.md)**
  - Checks of existing issues against the templates
  - Fixes for each issue that departs from its template
- **[Update](references/update-mode.md)**
  - Links from each delivered task to its pull request
  - Ticks for the criteria that hold
  - Closure of complete task issues, epics and initiatives
  - Project board updates
- **[Hoist](references/hoist-mode.md)**
  - Discovery of orphan issues
  - Placements for each in an existing or new initiative, epic or task
  - Migration or subsumption of the orphans the user places
  - Formatting of each migrated or left orphan by its target's rules, with its original body kept as a comment
- **[Progress](references/progress-mode.md)**
  - Standup summaries of the project board for a Slack channel
  - A paragraph for management on what the window accomplished
  - What completed, what is in progress and what is next

## Agent-engineering scheme

| Level | Title | Labels |
| --- | --- | --- |
| Initiative | `[I07] Name: Subtitle` | `type:initiative`, a `theme:*` |
| Epic | `[I07:E00] Name: Subtitle` | `type:epic`, a `theme:*` |
| Task | `[I07:E00:W01] Name: Subtitle` | `type:task` |
| Standalone issue | `Name: Subtitle`, with no prefix | no `type:*` |

- **Numbers.** `I` is the initiative number, `E` the epic within it, and `W` the task within the epic. Initiatives and epics count from `00`, and tasks from `W01`.
- **Titles.** The prefix separates levels with colons (`[I07:E00:W01]`), then a short name, a colon, and a subtitle stating the outcome; a standalone issue's title is the same without the prefix. The name is two or three words and the subtitle a succinct summary of at most ten, both in title case: `[I07:E06] Reliability Evaluation: Briefs, Measures and the Thresholds That Define Reliable`.
- **Bodies.** Every body follows its template: [initiative.md](templates/initiative.md), [epic.md](templates/epic.md), [task.md](templates/task.md), and [issue.md](templates/issue.md) for a standalone issue outside any initiative. A task or standalone issue has an epic's structure without the Work Breakdown table. Keep the section order and the table columns. Fill each `{{…}}` and delete a section the template marks as optional when it has nothing to say. What a body leaves out is in the [Work Breakdown guide](references/work-breakdown.md).
- **Code references.** A body references code as a link on the words it supports, a permalink pinned to a commit with its line anchors, never a bare `path:line`: `the [extrinsic type](…/blob/<sha>/runtime/src/lib.rs#L1231-L1232)`.
- **Succinct items.** Each Problem and Proposal item is one or two sentences. Several things go in a bulleted list, with sub-bullets as needed, never packed into one sentence.
- **Next number.** Find the next initiative number by listing titles: `gh api --paginate "repos/{owner}/{repo}/issues?state=all&per_page=100" --jq '.[] | select(.pull_request==null) | .title' | grep '^\[I'`.
- **Labels.** Besides the type and theme, add `enhancement`, `bug`, `tech-debt`, `workflows` and a `priority: *` as they apply. Only labels that exist: `gh api "repos/{owner}/{repo}/labels?per_page=100" --jq '.[].name'`.

## Commands

GitHub goes through REST only, with full host permissions. Once per session, before the first `gh` call, unset `GH_TOKEN` and `GITHUB_TOKEN` so `gh` uses its keyring login; where shell state does not persist between commands, confirm instead that neither is set in the shell profile. `gh` resolves `{owner}/{repo}` from the git remote of the directory it runs in, so run these inside a checkout of the repository that holds the issues:

```bash
gh api --method POST repos/{owner}/{repo}/issues -f title='[I07:E00] Name: Subtitle' -F body=@epic.md -f 'labels[]=type:epic' -f 'labels[]=enhancement' --jq .number
gh api --method PATCH repos/{owner}/{repo}/issues/943 -F body=@epic.md --jq .number
gh api repos/{owner}/{repo}/issues/943 --jq .body > live-943.md
gh api repos/{owner}/{repo}/issues/943 > issue-943.json
gh api --method PATCH repos/{owner}/{repo}/issues/943 -f title='[I07:E00] Name: Subtitle' --jq .title
gh api --method POST repos/{owner}/{repo}/issues/943/labels -f 'labels[]=type:epic' --jq '.[].name'
gh api --method DELETE repos/{owner}/{repo}/issues/943/labels/type:initiative --jq '.[].name'
gh api --method PATCH repos/{owner}/{repo}/issues/943 -f state=closed -f state_reason=completed --jq .state
```

Bodies always go through a file with `-F body=@file`. Never inline them, which avoids quoting and the workspace's dynamic-shell restrictions. Keep these files in a working directory outside the repository.

The scripts in `scripts/` run under the sandbox, invoked by the absolute path of the workspace checkout's `scripts/sbx`. `<workspace>` in the mode files stands for that checkout. Their tests are in `test/`: `cd <workspace>/skills/work-planner && <workspace>/scripts/sbx python3 -m unittest discover -s test`.

## Rules

- **Work Breakdown guide.** Every mode reads [work-breakdown.md](references/work-breakdown.md): the columns, numbering, references and delivery of the Work Breakdown tables.
- **Decisions.** Ask them one at a time, each with a recommended option, and record each answer in the affected issues and, when there is one, the planning record.
- **Measured claims.** A count or a chain comes from a command's output, never from a hand count.
- **Bodies state the plan as it is.** No body carries change narrative: nothing moved, renumbered, replaced, discharged or formerly anything. How the plan evolved goes in the planning record and in commit and pull request bodies.
- **Other initiatives.** Editing another initiative's issue needs the user's explicit approval.
- **Replies to feedback.** Once feedback on an issue is folded into its body, a comment mentions the
  reviewer and answers each of their points in turn, precisely and factually, with no thanks or
  filler. Each answer names what the body now says, by criterion id where one carries it, or the
  issue that takes the point.
