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

### Plan Board Changes

The board changes implied by supplied delivery state.

**Inputs:** [Initiative Record](#initiative-record), [Epic Records](#epic-records), [Task Records](#task-records), [Pull Request Records](#pull-request-records), [Published Reviews](#published-reviews), [Issue Link Snapshot](#issue-link-snapshot), [Board Identity](#board-identity), [Board Fields](#board-fields), [Board Items](#board-items), [Output Directory](#output-directory), [Assignee Login](#assignee-login), [Resolved Issues](#resolved-issues).

**Outputs:** [Board Changes](#board-changes).

#### 1. Require Complete Link Snapshot

Require the complete pull-request issue-link snapshot; refuse the computation without it.

#### 2. Compute Delivery Calls

Supply the published agent review records linked from each open epic integration pull request; retain missing records as handoff blockers. Apply [Compute Board Changes](#compute-board-changes), mapping the supplied records and board context to its parameters.

#### 3. Return Proposed Changes

Return the generated calls and unresolved references, meeting [Fields](#fields). The caller gathers missing evidence, applies changes and confirms their live state.

### Record Epic Review

One epic's review status on its board.

**Inputs:** [Review Selection](#review-selection), [Pull Request Records](#pull-request-records), [Published Reviews](#published-reviews), [Output Paths](#output-paths).

**Outputs:** [Confirmed Statuses](#confirmed-statuses).

#### 1. Read Board State

Apply [Read Board State](board.md#read-board-state) for the supplied board to obtain its items and Status field.

#### 2. Read Configuration and Assignee

Apply [Read Board Configuration](board.md#read-board-configuration) with the board identity and output paths for the Status option ids.
- Apply [Read Board Assignee](board.md#read-board-assignee) for the dispatch assignee login.

#### 3. Locate Epic Item

Match the epic's issue to its board item.
- Return an absent item as a finding and stop. The status write below needs it.

#### 4. Write and Confirm Review Status

Apply [Record Dispatch Status](#record-dispatch-status) with the epic as the review identity for In Review or the progress identity for In Progress, fresh pull request and published agent review records, and the fetched board evidence, meeting [Status Changes](#status-changes).
- When the item still shows the preceding status, Apply [Record Dispatch Status](#record-dispatch-status) with the same review or progress identity and supplied pull request, review and board evidence. Confirm the item through Apply [Read Board Configuration](board.md#read-board-configuration) with the same item identity. The item list can lag a write.

#### 5. Return Confirmed Status

Return the confirmed status or the discrepancy left for the caller.

### Record Board Delivery

The board's status and assignees after its issues record delivery.

**Inputs:** [Saved Identities](#saved-identities).

**Outputs:** [Confirmed Statuses](#confirmed-statuses).

#### 1. Read Current Delivery Evidence

Read the issues, the board and its delivery records.
- Apply [Read Tracker Issue](issue.md#read-tracker-issue) for the saved initiative, epic and task identities.
- Apply [Read Board State](board.md#read-board-state) for the selected board.
- Apply [Fetch All Delivery Pull Requests](pull-request.md#fetch-all-delivery-pull-requests) for its repositories and items.
- Apply [Fetch Pull Request Issue Links](pull-request.md#fetch-pull-request-issue-links) for those records.
- Fetch the published agent review records linked from each open epic integration pull request, retaining absent or unreadable evidence as a handoff blocker.
- Apply [Read Board Configuration](board.md#read-board-configuration) with the board and output paths.
- Apply [Read Board Assignee](board.md#read-board-assignee) for the assignment login.
- Retain these returned snapshots for the following computation.

#### 2. Plan Delivery Changes

Apply [Plan Board Changes](#plan-board-changes) with the initiative JSON, linked epic records, task issue records, fresh REST pull request records, published agent review records, complete issue-link snapshot, board identity, board fields, board items, output directory, and assignee login.
- Fetch each unresolved issue.
- Apply [Plan Board Changes](#plan-board-changes) again with the same initiative, epic, task, pull request, review, link and board snapshots, output directory and assignee, adding the fetched files as resolved off-board issue files.

#### 3. Apply and Confirm Calls

Run each emitted call, including the assignee calls, which act on the issue rather than the board item.
- Apply [Read Board Configuration](board.md#read-board-configuration) with the board identity, output paths and changed item identity to confirm its current status.

If that item still shows the preceding status:
- Repeat its emitted write call.
- Apply [Read Board Configuration](board.md#read-board-configuration) with the same board identity, output paths and changed item identity. The item list can lag a write.

#### 4. Recompute Refreshed Board

Fetch the issues and items again.
- Refresh the pull request metadata and linked published agent review records before recomputing statuses; either tip may have changed during the writes.
- Apply [Plan Board Changes](#plan-board-changes) with the refreshed initiative JSON, linked epic records, task issue records, fresh REST pull request records, published agent review records, complete issue-link snapshot, board identity, board fields, board items, output directory, assignee login, and every resolved off-board issue file.
- Stop when it emits no further call and every changed item has been confirmed. An issue added in one pass gets its status in the next.

### Record Dispatch Status

The task and epic statuses owned by a delivery dispatch.

**Inputs:** [Board Items](#board-items), [Board Identity](#board-identity), [Board Fields](#board-fields), [Output Directory](#output-directory), [Assignee Login](#assignee-login), [Dispatch Selection](#dispatch-selection), [Pull Request Records](#pull-request-records), [Published Reviews](#published-reviews).

**Outputs:** [Confirmed Statuses](#confirmed-statuses).

#### 1. Compute Dispatch Calls

Apply [Compute Dispatch Status](#compute-dispatch-status) with the supplied identities, board evidence, fresh pull request records and published agent review records. A missing or failing agent review blocks the In Review write.

#### 2. Apply and Confirm Calls

Run each returned call.
- Apply [Read Board Configuration](board.md#read-board-configuration) with the board identity, output paths and each affected item identity to confirm the write.

#### 3. Return Saved Statuses

Return the saved statuses or unresolved discrepancies.

### Compute Board Changes

Computes membership, Status and assignee calls from supplied delivery evidence.

**Inputs:** [Initiative Record](#initiative-record), [Epic Records](#epic-records), [Task Records](#task-records), [Pull Request Records](#pull-request-records), [Published Reviews](#published-reviews), [Issue Link Snapshot](#issue-link-snapshot), [Board Identity](#board-identity), [Board Fields](#board-fields), [Board Items](#board-items), [Output Directory](#output-directory), [Assignee Login](#assignee-login), [Resolved Issues](#resolved-issues).

**Outputs:** [Board Changes](#board-changes).

#### 1. Compute Board Changes

Run the following command with the supplied inputs.

- `--epics`, `--tasks`, `--prs` and `--links` receive the related records and complete link snapshot. `--agent-reviews` supplies the published review records fetched from the open epic pull requests; absent evidence holds those epics In Progress.
- `--board`, `--fields` and `--items` identify the current board state.
- `--out` receives the call files; `--assignee` is the supplied login.
- `--others` supplies each resolved dependency issue.

Pass each epic or task JSON file as a separate argument after its corresponding flag.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace)" && "[**&lt;workspace&gt;**](#workspace)/scripts/sbx" python3 skills/work-planner/scripts/board.py '[**&lt;initiative-json-file&gt;**](#initiative-record)' --epics '[**&lt;epic-json-file&gt;**](#epic-records)' --tasks '[**&lt;task-json-file&gt;**](#task-records)' --prs '[**&lt;pull-request-records-file&gt;**](#pull-request-records)' --links '[**&lt;issue-link-snapshot-file&gt;**](#issue-link-snapshot)' --agent-reviews '[**&lt;review-records-file&gt;**](#published-reviews)' --board '[**&lt;board-identity&gt;**](#board-identity)' --fields '[**&lt;board-fields-file&gt;**](#board-fields)' --items '[**&lt;board-items-file&gt;**](#board-items)' --out '[**&lt;output-directory&gt;**](#output-directory)' --assignee '[**&lt;assignee-login&gt;**](#assignee-login)'
</pre></big>

**Example:**

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace)" && "[**&lt;workspace&gt;**](#workspace)/scripts/sbx" python3 skills/work-planner/scripts/board.py issue-936.json --epics issue-943.json issue-937.json --tasks issue-637.json --prs prs.json --links links.json --board 'users/[**&lt;owner&gt;**](#board-identity)/projectsV2/9' --fields fields.json --items items.json --out board/ --assignee m2ux
</pre></big>

### Compute Dispatch Status

Renders board calls within the dispatch jurisdiction.

**Inputs:** [Board Items](#board-items), [Board Identity](#board-identity), [Board Fields](#board-fields), [Output Directory](#output-directory), [Assignee Login](#assignee-login), [Dispatch Selection](#dispatch-selection), [Pull Request Records](#pull-request-records), [Published Reviews](#published-reviews).

**Outputs:** [Board Changes](#board-changes).

#### 1. Compute Dispatch Status

Run the following command with the supplied inputs.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace)" && "[**&lt;workspace&gt;**](#workspace)/scripts/sbx" python3 skills/work-planner/scripts/deliver.py --items '[**&lt;board-items-file&gt;**](#board-items)' --board '[**&lt;board-identity&gt;**](#board-identity)' --fields '[**&lt;board-fields-file&gt;**](#board-fields)' --out '[**&lt;output-directory&gt;**](#output-directory)' --assignee '[**&lt;assignee-login&gt;**](#assignee-login)' --progress '[**&lt;held-issue-numbers&gt;**](#dispatch-selection)' --review '[**&lt;complete-epic-numbers&gt;**](#dispatch-selection)' --prs '[**&lt;pull-request-records-file&gt;**](#pull-request-records)' --agent-reviews '[**&lt;review-records-file&gt;**](#published-reviews)'
</pre></big>

## Fields

### Status Changes

An issue closed as completed is Done. Every board item whose issue is closed any other way is removed, whether or not an initiative, epic or task body cites it.

An open initiative whose criteria are all ticked is In Review. An open epic whose criteria are all ticked is In Review only with current published [agent review evidence](agent-review.md#review-record); missing, stale or unresolved review evidence keeps it In Progress.

An open epic with a criterion unticked is In Progress while it is [active](board-queue.md#epic-activity). An inactive one keeps Ready or Backlog; In Progress and In Review become Backlog, and one not yet on the board is added at Backlog.

An initiative is In Progress when an epic its Work Breakdown lists is In Progress or In Review. An epic that has left that table is not read. Otherwise the initiative keeps the Status it holds, In Review becoming In Progress, and one not yet on the board is added at Backlog, so completed work alone starts no initiative. Delivery does not move an initiative or epic between Ready and Backlog.

Only an initiative, an epic or a hot-fix stands In Review. An open task issue is In Progress while a delivery pull request, draft or ready, links it, and Done once that pull request merges into the epic base and the issue closes as completed. Every jurisdiction refuses a task set In Review.

A task whose row links a reserved planning folder is In Progress. A work-item file link alone leaves the row available. Dispatch writes are limited to In Progress for held tasks and epics, and In Review for completed epics; the shared DISPATCH jurisdiction refuses other statuses and removals.

Task readiness meets [Task Eligibility](board-queue.md#task-eligibility). The caller supplies saved issue bodies and closure state.

A task gated on an [unresolvable dependency](board-queue.md#unresolvable-dependencies) keeps the Status it holds: the row waits on no delivery, so no status follows from its gate. The run names the row and the entry and exits nonzero, as every reader of that cell does.

### Change Calls

The result contains calls for issues to add, items to remove, Status to set and assignees to add or remove. Each call names its affected issue and board item. Assignees follow [Assignees](board.md#assignees).

### Missing Evidence

Unresolved issue references identify dependency records the caller must supply before a complete result. A newly added issue receives its status on a subsequent pass using refreshed items.

### Resolved Issues

The supplied resolved off-board dependency issue records, each at its local file path.

### Review Selection

The epic issue identity, board identity and requested Status: In Review or In Progress.

### Saved Identities

The saved initiative, epic and task identities, board identity, output directory and repositories the board issues live in.

### Dispatch Selection

The supplied comma-separated held task and epic issue numbers for In Progress, and complete epic numbers for In Review.

### Board Changes

The generated membership, Status and assignee calls and unresolved references.

### Confirmed Statuses

The saved item statuses or unresolved discrepancies returned after item readback.

### Initiative Record

The supplied complete current initiative JSON at its local file path.

### Epic Records

The supplied complete current epic JSON records, each at a separate local file path.

### Task Records

The supplied complete current task issue JSON records, each at a separate local file path.

### Pull Request Records

The supplied freshly fetched complete REST pull request records, one JSON object per nonempty line at the local file path.

### Published Reviews

The JSON list of published agent-review records fetched from their linked planning records, at its local file path.

### Issue Link Snapshot

The supplied complete pull-request issue-link snapshot at its local file path.

### Board Identity

The supplied users/owner/projectsV2/number or orgs/owner/projectsV2/number board identity.

### Board Fields

The supplied board field definitions at their local snapshot path.

### Board Items

The supplied board items with Status and their complete issue records, at the local paginated snapshot path.

### Output Directory

The supplied local directory receiving generated calls.

### Output Paths

The supplied local paths for fetched evidence and generated calls.

### Assignee Login

The supplied login assigned to work from Ready.

### Workspace

The absolute supplied checkout path holding the installed Work Planner scripts and sandbox helper.
