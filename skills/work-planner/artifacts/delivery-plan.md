# Delivery Plan

The available units, held rows, blocked work and merge candidates for one board.

## Prerequisites

Read these files first.

- [Epic Issue Body](epic-issue-body.md)
- [Delivery Branches](delivery-branches.md)

## Operations

### *Plan* Available Work

One delivery plan from supplied board and delivery evidence.

**Inputs:** Board items, pull request records, complete issue-link snapshot, project checkout, epic-base names, resolved off-board issue files and optional record date.

1. Run [Compute Available Work](#compute-available-work), mapping each supplied input to its named command parameter.
2. Return the units, holds, blockers, merge candidates and unresolved references meeting [Fields](#fields). The caller decides holds and dispatch, and supplies missing evidence for another pass.

## Fields

### Work Units

A unit is one task row or tasks that name each other in Joins, as [Work Breakdown](epic-issue-body.md#work-breakdown) defines. One unit is one pull request's work. Its task ids and Descriptions determine the planning-folder identity, branch, epic base and worktree.

### Report Lines

- A `unit` line names one session's tasks, Coverage, record folder, branch, base and worktree. One base is `base i07/e00/main`; several are `bases i07/e00/main i07/e00/workflows`.
- A `hold` line names a row a session holds and the record it links.
- A `blocked` line names a free row whose dependencies are undelivered or whose joined task is unavailable.
- An `unresolvable` line names a free row carrying a `Depends on` entry nothing can resolve, and the entry as written. The row waits on no delivery, so it is told apart from a blocked one, and a run meeting one exits nonzero.
- A `merge` line names an open pull request whose test plan has passed and the epic base it targets.
- An unresolved issue reference identifies missing dependency evidence.

### Branch Context

The project checkout supplies the long-lived branch names defined in [Branches](delivery-branches.md#branches). A base whose last segment is not one of those names is ignored. A supplied record date determines the planning folder's day; the default is today.

## Commands

### Compute Available Work

Computes available work from supplied board and delivery snapshots.

**Inputs:** Board items, pull request records, complete issue-link snapshot, project checkout, epic-base names, resolved off-board issue records and optional record date.

- `--items`, `--prs` and `--links` receive the supplied snapshots. A row's own links, which say whether its work is under way, are read from the epic body.
- `--project` is the checkout; `--bases` is its comma-separated epic-base list.
- `--others` supplies each resolved off-board issue; `--date` selects another record date.

`<epic-base-names>` is a comma-separated list of full epic-base branch names.

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/deliver.py --items '<board-items-file>' --prs '<pull-request-records-file>' --links '<issue-link-snapshot-file>' --project '<checkout>' --bases '<epic-base-names>'
```

**Example:**

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/deliver.py --items items.json --prs prs.json --links links.json --project '<checkout>' --bases i07/e00/main,i07/e00/workflows
```
