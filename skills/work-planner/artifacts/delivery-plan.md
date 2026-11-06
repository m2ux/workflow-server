# Delivery Plan

The available units, held rows and hot-fixes, blocked work and merge candidates for one board.

## Commands

### Compute Available Work

Compute available work from supplied board and delivery snapshots and provide [Plan Report](#plan-report "●") and [Dispatch Export](#dispatch-export "●") to the requester, or [Failure](#failure "●") if the operation fails.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/deliver.py &#92;
  --items '[**&lt;board-items-file&gt;**](#board-items "○")' &#92;
  --prs '[**&lt;pull-request-records-file&gt;**](#pull-request-records "○")' &#92;
  --links '[**&lt;issue-link-snapshot-file&gt;**](#issue-link-snapshot "○")' &#92;
  --project '[**&lt;checkout&gt;**](#project-checkout "○")' &#92;
  --revision '[**&lt;revision&gt;**](#revision "○")' &#92;
  --bases '[**&lt;epic-base-names&gt;**](#epic-base-names "○")' &#92;
  --engineering '[**&lt;engineering-worktree&gt;**](#engineering-worktree "○")' &#92;
  --lane [**&lt;lane-index&gt;**](#requested-lane "○") &#92;
  --dispatch-plan '[**&lt;dispatch-export-file&gt;**](#dispatch-export-path "○")'
</pre></big>

- Include each supplied [Off-Board Issues](#off-board-issues "○") file with `--others`.

- Read each row’s own links from the epic body to determine whether its work is under way.

- Fetch the project checkout’s remote epic bases and long-lived branches before reading producer outputs against them.
- Read each free row’s work-item file from the supplied engineering worktree.
- Use `--date` to override the [record date](#record-date "○").
- Omit `--lane` when the run names no lane. Offered units must meet [Admission](lane.md#admission).
- Omit `--dispatch-plan` when no dispatch export is requested.

- The computation runs [Evaluate Lane Admission](lane.md#evaluate-lane-admission "ƒ") internally for each derived free unit under [Admission](lane.md#admission). The requester decides holds and dispatch, and supplies missing evidence for another pass.

## Fields

### Work Units

A unit is one task row or tasks that name each other in Joins, as [Work Breakdown](epic-issue-body.md#work-breakdown) defines. A unit of rows comes only from an epic that is Ready or In Progress in the supplied board items: the plan offers no other row, and none other is held. A [hot-fix unit](#hot-fix-units) has no row. One unit is one session's work, delivered by one pull request into each epic base it changes. Its first task id and Description determine the planning-folder identity, which every row of the unit is reserved with, and with each epic base it changes its branch and worktree, as [Task Branches](delivery-branches.md#task-branches) names them. In an epic of several bases, the bases a unit changes are read from the [Component](work-item.md#component) declaration of the work-item file each free row links, in the engineering worktree. A unit with a row linking no work item changes every epic base, as [Task Branches](delivery-branches.md#task-branches) states for unplanned rows.

### Hot-fix Units

A hot-fix is a unit as its [Delivery Unit](hotfix.md#delivery-unit) states, with the branch, base and worktree its [Branch](hotfix.md#branch) names.

### Report Lines

- A `unit` line names one session's tasks, its lane as `lane 2` or `unlaned`, Coverage and record folder, then a branch, base and worktree for each epic base it changes, separated by semicolons: `branch i07/e00/w01-queue-plan-main, base i07/e00/main, worktree .worktrees/i07/e00/w01-queue-plan-main; branch i07/e00/w01-queue-plan-workflows, base i07/e00/workflows, worktree .worktrees/i07/e00/w01-queue-plan-workflows`. One base keeps the unsuffixed branch: `branch i07/e00/w01-queue-plan, base i07/e00/main, worktree .worktrees/i07/e00/w01-queue-plan`. A hot-fix's line names its prefix and issue: `unit F00 #874: unlaned, coverage AC1, record 2026-10-06-874-f00-key-validation, branch f00-key-validation, base workspace, worktree .worktrees/f00-key-validation`.
- An `invalid` line names a malformed task-table Lane cell or a joined unit with different Lane values. The unit is not offered and the run exits nonzero; the summary counts invalid units.
- An `undeclared` line names a row of a unit in an epic of several bases whose linked work item names no long-lived branch with an epic base, and why: the file is unread, or its component names no long-lived branch or one with no epic base. The unit is not offered until its work item declares one, and a run meeting one exits nonzero. It also names an open hot-fix, whatever its state, whose body names no [target](hotfix-body.md#target), or one of the project checkout's repository whose target the evaluated revision's [Branches](delivery-branches.md#branches) does not declare. It is offered as no unit and no merge until its target is one.
- A `hold` line names a row a session holds and the record it links, or a hot-fix its [Delivery Unit](hotfix.md#delivery-unit) holds.
- A `blocked` line names a free row whose dependencies are undelivered or whose joined task is unavailable.
- An `output` line records each output read for a row naming another epic's row, as [Producer Outputs](delivery-branches.md#producer-outputs) states: the producer row, the delivery, the output commit, the consumer revision and commit, and whether it is available there, or why it is unverified.
- An `unresolvable` line names a free row carrying a `Depends on` entry nothing can resolve, and the entry as written. The row waits on no delivery, so it is told apart from a blocked one, and a run meeting one exits nonzero.
- A `merge` line names an open pull request, never a draft, whose test plan has passed and the base it targets: a task pull request into an epic base, or an open hot-fix's [delivering pull request](hotfix.md#delivering-pull-request) into its target, when no `undeclared` or unresolved line names that hot-fix's target.
- An `unrecorded` line names a hot-fix its [Delivery Unit](hotfix.md#delivery-unit) leaves unrecorded, and each merged delivering pull request.
- An unresolved issue reference identifies missing dependency evidence.
- An unresolved hot-fix of a repository other than the project checkout's names its target, which that checkout's [Branches](delivery-branches.md#branches) cannot declare. It is offered once a plan whose project checkout is of its repository finds the target declared.

### Branch Context

The long-lived branch names are the ones [Branches](delivery-branches.md#branches) reads at the evaluated revision a delivery survey names, and the `source` line names it. A base whose last segment is not one of those names is ignored. A supplied record date determines the planning folder's day; the default is today.

### Dispatch Export

The optional JSON export holds exactly the available units in report order. Each entry has a repository-qualified `id`, its `record` folder and its complete `report` line. Joined rows share one entry, such as `o/r#I07:E00:W01+W02`; a hot-fix uses `o/r#F02`. Diagnostic, held and blocked lines remain in the report and create no export entry.

### Board Items

The current board-items snapshot file, including each issue body. eg `items.json`

### Pull Request Records

The current pull request records snapshot file. eg `prs.json`

### Issue-Link Snapshot

The complete Development relation snapshot file. eg `links.json`

### Epic-Base Names

A comma-separated list of full epic-base branch names. eg `i07/e00/main,i07/e00/workflows`

### Engineering Worktree

The engineering checkout where each free row’s linked work-item file is read. eg `<checkout>/.engineering`

### Off-Board Issues

Each resolved off-board issue record supplied through `--others`.

### Requested Lane

The optional requested bare decimal lane index; absent when the run names no lane, meeting [Index](lane.md#index). eg `2`

### Record Date

The optional input selecting the planning-folder day, as [Branch Context](#branch-context) states.

### Dispatch-Export Path

The optional destination file for the dispatch export; absent when no export is requested.

### Plan Report

The computed report. Its units and diagnostic lines must meet [Report Lines](#report-lines).

### Workspace

The checkout holding the installed skill, its scripts and tests.

### Project Checkout

The project repository checkout supplied for branch and delivery reads or writes.

### Revision

The fetched commit or revision evaluated by the run. eg `origin/workspace`

### Failure

The operation and error, discrepancy or missing evidence that prevents a verified result.
