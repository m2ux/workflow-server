# Board Delivery

The membership, status and assignee changes that record delivery on one board.

## Prerequisites

Read these files first.

- [Board Queue](board-queue.md)
- [Board](board.md)
- [Issue](issue.md)
- [Pull Request](pull-request.md)
- [Agent Review](agent-review.md)

## Operations

### *Plan* Board Changes

The board changes implied by supplied delivery state.

**Inputs:** Initiative JSON, epic and task records, fresh REST pull request records, published agent review records fetched from their linked planning records, complete issue-link snapshot, board identity, fields and items, output directory, assignee login and resolved off-board issue files.

1. Require the complete pull-request issue-link snapshot; refuse the computation without it.
2. Supply the published agent review records linked from each open epic integration pull request; retain missing records as handoff blockers. Run [Compute Board Changes](#compute-board-changes), mapping the supplied records and board context to its parameters.
3. Return the generated calls and unresolved references, meeting [Fields](#fields). The caller gathers missing evidence, applies changes and confirms their live state.

### *Record* Epic Review

One epic's review status on its board.

**Inputs:** Epic issue identity, board identity, requested status (In Review or In Progress), fresh pull request records, published agent review records and output paths.

1. Run [Read Board State](board.md#read-board-state) for the supplied board to obtain its items and Status field.
2. Run [Read Board Configuration](board.md#read-board-configuration) with the board identity and output paths for the Status option ids.
   - Run [Read Board Assignee](board.md#read-board-assignee) for the dispatch assignee login.
3. Match the epic's issue to its board item.
   - Return an absent item as a finding and stop. The status write below needs it.
4. Run [Record Dispatch Status](#record-dispatch-status) with the epic as the review identity for In Review or the progress identity for In Progress, fresh pull request and published agent review records, and the fetched board evidence, meeting [Status Changes](#status-changes).
   - Repeat the write and read the item again when it still shows the preceding status. The item list can lag a write.
5. Return the confirmed status or the discrepancy left for the caller.

### *Record* Board Delivery

The board's status and assignees after its issues record delivery.

**Inputs:** Saved initiative, epic and task identities, board identity, output directory, and the repositories the board's issues live in.

1. Read the issues, the board and its delivery records.
   - Run [Read Tracker Issue](issue.md#read-tracker-issue) for the saved initiative, epic and task identities.
   - Run [Read Board State](board.md#read-board-state) for the selected board.
   - Run [Fetch All Initiative Pull Requests](pull-request.md#fetch-all-initiative-pull-requests) for its repositories.
   - Run [Fetch Pull Request Issue Links](pull-request.md#fetch-pull-request-issue-links) for those records.
   - Fetch the published agent review records linked from each open epic integration pull request, retaining absent or unreadable evidence as a handoff blocker.
   - Run [Read Board Configuration](board.md#read-board-configuration) with the board and output paths.
   - Run [Read Board Assignee](board.md#read-board-assignee) for the assignment login.
   - Pass these returned snapshots to Plan Board Changes.
2. Run [Plan Board Changes](#plan-board-changes) with the initiative JSON, linked epic records, task issue records, fresh REST pull request records, published agent review records, complete issue-link snapshot, board identity, board fields, board items, output directory, and assignee login.
   - Fetch each unresolved issue.
   - Pass the fetched files to Plan Board Changes as resolved off-board issue files.
3. Run each emitted call, including the assignee calls, which act on the issue rather than the board item.
   - Run [Read Board Configuration](board.md#read-board-configuration) with the board identity, output paths and changed item identity to confirm its current status.
   - If that item still shows the preceding status:
     - Repeat its write.
     - Repeat the same item read. The item list can lag a write.
4. Fetch the issues and items again.
   - Refresh the pull request metadata and linked published agent review records before recomputing statuses; either tip may have changed during the writes.
   - Run [Plan Board Changes](#plan-board-changes) with the refreshed initiative JSON, linked epic records, task issue records, fresh REST pull request records, published agent review records, complete issue-link snapshot, board identity, board fields, board items, output directory, assignee login, and every resolved off-board issue file.
   - Stop when it emits no further call and every changed item has been confirmed. An issue added in one pass gets its status in the next.

### *Record* Dispatch Status

The task and epic statuses owned by a delivery dispatch.

**Inputs:** Board items, board identity, field definitions, output directory, assignee login, held task and epic issue numbers for In Progress, and complete epic numbers for In Review, fresh pull request records and published agent review records.

1. Run [Compute Dispatch Status](#compute-dispatch-status) with the supplied identities, board evidence, fresh pull request records and published agent review records. A missing or failing agent review blocks the In Review write.
2. Apply each returned call and confirm each affected item through [Read Board Configuration](board.md#read-board-configuration).
3. Return the saved statuses or unresolved discrepancies.

## Fields

### Status Changes

An open initiative whose criteria are all ticked is In Review. An open epic whose criteria are all ticked is In Review only with current published [agent review evidence](agent-review.md#review-record); missing, stale or unresolved review evidence keeps it In Progress. An epic with an open pull request and a criterion unticked is In Progress.

An initiative or epic with no open pull request and unticked criteria keeps Ready or Backlog, and keeps In Progress when delivery has started. In Review then becomes In Progress. One not yet on the board is added at Backlog, or at In Progress when delivery has started. Delivery does not move an initiative or epic between Ready and Backlog.

A task whose row links a reserved planning folder is In Progress. A work-item file link alone leaves the row available. Dispatch writes are limited to In Progress for held tasks and epics, and In Review for completed epics; the shared DISPATCH jurisdiction refuses other statuses, task In Review and removals.

Task readiness meets [Task Eligibility](board-queue.md#task-eligibility). The caller supplies saved issue bodies and closure state.

A task gated on an [unresolvable dependency](board-queue.md#unresolvable-dependencies) keeps the Status it holds: the row waits on no delivery, so no status follows from its gate. The run names the row and the entry and exits nonzero, as every reader of that cell does.

### Change Calls

The result contains calls for issues to add, items to remove, Status to set and assignees to add or remove. Each call names its affected issue and board item. Assignees follow [Assignees](board.md#assignees).

### Missing Evidence

Unresolved issue references identify dependency records the caller must supply before a complete result. A newly added issue receives its status on a subsequent pass using refreshed items.

## Commands

### Compute Board Changes

Computes membership, Status and assignee calls from supplied delivery evidence.

**Inputs:** Initiative JSON, epic and task JSON records, pull request and complete issue-link snapshots, board identity, board fields and items, output directory, assignee login and resolved off-board issue records.

- `--epics`, `--tasks`, `--prs` and `--links` receive the related records and complete link snapshot. `--agent-reviews` supplies the published review records fetched from the open epic pull requests; absent evidence holds those epics In Progress.
- `--board`, `--fields` and `--items` identify the current board state.
- `--out` receives the call files; `--assignee` is the supplied login.
- `--others` supplies each resolved dependency issue.

Pass each epic or task JSON file as a separate argument after its corresponding flag.

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/board.py '<initiative-json-file>' --epics '<epic-json-file>' --tasks '<task-json-file>' --prs '<pull-request-records-file>' --links '<issue-link-snapshot-file>' --agent-reviews '<review-records-file>' --board '<board-identity>' --fields '<board-fields-file>' --items '<board-items-file>' --out '<output-directory>' --assignee '<assignee-login>'
```

**Example:**

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/board.py issue-936.json --epics issue-943.json issue-937.json --tasks issue-637.json --prs prs.json --links links.json --board 'users/<owner>/projectsV2/9' --fields fields.json --items items.json --out board/ --assignee m2ux
```

### Compute Dispatch Status

Renders board calls within the dispatch jurisdiction.

**Inputs:** Board items, board identity, fields, output directory, assignee, comma-separated held task and epic numbers, and comma-separated complete epic numbers, fresh pull request records and published agent review records.

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/deliver.py --items '<board-items-file>' --board '<board-identity>' --fields '<board-fields-file>' --out '<output-directory>' --assignee '<assignee-login>' --progress '<held-issue-numbers>' --review '<complete-epic-numbers>' --prs '<pull-request-records-file>' --agent-reviews '<review-records-file>'
```
