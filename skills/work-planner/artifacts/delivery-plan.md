# Delivery Plan

The available units, held rows and hot-fixes, blocked work and merge candidates for one board.

## Prerequisites

Read these files first.

- [Epic Issue Body](epic-issue-body.md)
- [Delivery Branches](delivery-branches.md)
- [Work Item](work-item.md)
- [Hot-fix](hotfix.md)

## Operations

### *Plan* Available Work

One delivery plan from supplied board and delivery evidence.

**Inputs:** Board items, pull request records, complete issue-link snapshot, project checkout, evaluated revision, epic-base names, engineering worktree, resolved off-board issue files and optional record date.

1. Run [Compute Available Work](#compute-available-work), mapping each supplied input to its named command parameter.
2. Return the units, holds, blockers, undeclared rows, merge candidates, unrecorded hot-fixes and unresolved references meeting [Fields](#fields). The caller decides holds and dispatch, and supplies missing evidence for another pass.

## Fields

### Work Units

A unit is one task row or tasks that name each other in Joins, as [Work Breakdown](epic-issue-body.md#work-breakdown) defines. A unit of rows comes only from an epic that is Ready or In Progress in the supplied board items: the plan offers no other row, and none other is held. A [hot-fix unit](#hot-fix-units) has no row. One unit is one session's work, delivered by one pull request into each epic base it changes. Its first task id and Description determine the planning-folder identity, which every row of the unit is reserved with, and with each epic base it changes its branch and worktree, as [Task Branches](delivery-branches.md#task-branches) names them. In an epic of several bases, the bases a unit changes are read from the [Component](work-item.md#component) declaration of the work-item file each free row links, in the engineering worktree. A unit with a row linking no work item changes every epic base, as [Task Branches](delivery-branches.md#task-branches) states for unplanned rows.

### Hot-fix Units

A hot-fix is a unit as its [Delivery Unit](hotfix.md#delivery-unit) states, with the branch, base and worktree its [Branch](hotfix.md#branch) names.

### Report Lines

- A `unit` line names one session's tasks, Coverage and record folder, then a branch, base and worktree for each epic base it changes, separated by semicolons: `branch i07/e00/w01-queue-plan-main, base i07/e00/main, worktree .worktrees/i07/e00/w01-queue-plan-main; branch i07/e00/w01-queue-plan-workflows, base i07/e00/workflows, worktree .worktrees/i07/e00/w01-queue-plan-workflows`. One base keeps the unsuffixed branch: `branch i07/e00/w01-queue-plan, base i07/e00/main, worktree .worktrees/i07/e00/w01-queue-plan`. A hot-fix's line names its prefix and issue: `unit F00 #874: coverage AC1, record 2026-10-06-874-f00-key-validation, branch f00-key-validation, base (default branch), worktree .worktrees/f00-key-validation`.
- An `undeclared` line names a row of a unit in an epic of several bases whose linked work item names no long-lived branch with an epic base, and why: the file is unread, or its component names no long-lived branch or one with no epic base. The unit is not offered until its work item declares one, and a run meeting one exits nonzero.
- A `hold` line names a row a session holds and the record it links, or a hot-fix its [Delivery Unit](hotfix.md#delivery-unit) holds.
- A `blocked` line names a free row whose dependencies are undelivered or whose joined task is unavailable.
- An `output` line records each output read for a row naming another epic's row, as [Producer Outputs](delivery-branches.md#producer-outputs) states: the producer row, the delivery, the output commit, the consumer revision and commit, and whether it is available there, or why it is unverified.
- An `unresolvable` line names a free row carrying a `Depends on` entry nothing can resolve, and the entry as written. The row waits on no delivery, so it is told apart from a blocked one, and a run meeting one exits nonzero.
- A `merge` line names an open pull request whose test plan has passed and the base it targets: a task pull request into an epic base, or an open hot-fix's [delivering pull request](hotfix.md#delivering-pull-request) into its repository's default branch.
- An `unrecorded` line names a hot-fix its [Delivery Unit](hotfix.md#delivery-unit) leaves unrecorded, and each merged delivering pull request.
- An unresolved issue reference identifies missing dependency evidence.

### Branch Context

The long-lived branch names are the ones [Branches](delivery-branches.md#branches) reads at the evaluated revision a delivery survey names, and the `source` line names it. A base whose last segment is not one of those names is ignored. A supplied record date determines the planning folder's day; the default is today.

## Commands

### Compute Available Work

Computes available work from supplied board and delivery snapshots.

**Inputs:** Board items, pull request records, complete issue-link snapshot, project checkout, evaluated revision, epic-base names, engineering worktree, resolved off-board issue records and optional record date.

- `--items`, `--prs` and `--links` receive the supplied snapshots. A row's own links, which say whether its work is under way, are read from the epic body.
- `--project` is the checkout and `--revision` the evaluated revision; `--bases` is its comma-separated epic-base list.
- `--project` is also where producer outputs are read, against the remote epic bases and long-lived branches it holds, so fetch them before the run.
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
