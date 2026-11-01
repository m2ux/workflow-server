# Delivery Plan

The available units, held rows, blocked work and merge candidates for one board.

## Prerequisites

Read these files first.

- [Epic Issue Body](epic-issue-body.md)
- [Delivery Branches](delivery-branches.md)
- [Work Item](work-item.md)

## Operations

### *Plan* Available Work

One delivery plan from supplied board and delivery evidence.

**Inputs:** Board items, pull request records, complete issue-link snapshot, project checkout, evaluated revision, epic-base names, engineering worktree, resolved off-board issue files and optional record date.

1. Run [Compute Available Work](#compute-available-work), mapping each supplied input to its named command parameter.
2. Return the units, holds, blockers, undeclared rows, merge candidates and unresolved references meeting [Fields](#fields). The caller decides holds and dispatch, and supplies missing evidence for another pass.

## Fields

### Work Units

A unit is one task row or tasks that name each other in Joins, as [Work Breakdown](epic-issue-body.md#work-breakdown) defines. One unit is one session's work, delivered by one pull request into each epic base it changes. Its task ids and Descriptions determine the planning-folder identity, and with each epic base it changes its branch and worktree, as [Task Branches](delivery-branches.md#task-branches) names them. In an epic of several bases, the bases a unit changes are read from the [Component](work-item.md#component) declaration of the work-item file each free row links, in the engineering worktree. A unit with a row linking no work item changes every epic base, as [Task Branches](delivery-branches.md#task-branches) states for unplanned rows.

### Report Lines

- A `unit` line names one session's tasks, Coverage and record folder, then a branch, base and worktree for each epic base it changes, separated by semicolons: `branch i07/e00/w01-queue-plan-main, base i07/e00/main, worktree .worktrees/i07/e00/w01-queue-plan-main; branch i07/e00/w01-queue-plan-workflows, base i07/e00/workflows, worktree .worktrees/i07/e00/w01-queue-plan-workflows`. One base keeps the unsuffixed branch: `branch i07/e00/w01-queue-plan, base i07/e00/main, worktree .worktrees/i07/e00/w01-queue-plan`.
- An `undeclared` line names a row of a unit in an epic of several bases whose linked work item names no long-lived branch with an epic base, and why: the file is unread, or its component names no long-lived branch or one with no epic base. The unit is not offered until its work item declares one, and a run meeting one exits nonzero.
- A `hold` line names a row a session holds and the record it links.
- A `blocked` line names a free row whose dependencies are undelivered or whose joined task is unavailable.
- An `unresolvable` line names a free row carrying a `Depends on` entry nothing can resolve, and the entry as written. The row waits on no delivery, so it is told apart from a blocked one, and a run meeting one exits nonzero.
- A `merge` line names an open pull request whose test plan has passed and the epic base it targets.
- An unresolved issue reference identifies missing dependency evidence.

### Branch Context

The long-lived branch names are the ones [Branches](delivery-branches.md#branches) reads at the evaluated revision a delivery survey names, and the `source` line names it. A base whose last segment is not one of those names is ignored. A supplied record date determines the planning folder's day; the default is today.

## Commands

### Compute Available Work

Computes available work from supplied board and delivery snapshots.

**Inputs:** Board items, pull request records, complete issue-link snapshot, project checkout, evaluated revision, epic-base names, engineering worktree, resolved off-board issue records and optional record date.

- `--items`, `--prs` and `--links` receive the supplied snapshots. A row's own links, which say whether its work is under way, are read from the epic body.
- `--project` is the checkout and `--revision` the evaluated revision; `--bases` is its comma-separated epic-base list.
- `--engineering` is the engineering worktree, where each free row's work-item file is read.
- `--others` supplies each resolved off-board issue; `--date` selects another record date.

`<epic-base-names>` is a comma-separated list of full epic-base branch names.

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/deliver.py --items '<board-items-file>' --prs '<pull-request-records-file>' --links '<issue-link-snapshot-file>' --project '<checkout>' --revision '<revision>' --bases '<epic-base-names>' --engineering '<engineering-worktree>'
```

**Example:**

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/deliver.py --items items.json --prs prs.json --links links.json --project '<checkout>' --revision origin/workspace --bases i07/e00/main,i07/e00/workflows --engineering '<checkout>/.engineering'
```
