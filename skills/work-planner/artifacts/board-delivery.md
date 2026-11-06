# Board Delivery

The membership, status and assignee changes that record delivery on one board.

## Operations

### Record Epic Review

One epic's review status on its board.

#### 1. Read Board State

Apply [Read Board State](board.md#read-board-state "ƒ") for the board in [Review Selection](#review-selection).

#### 2. Read Configuration and Assignee

- Apply [Read Board Configuration](board.md#read-board-configuration "ƒ").
- Run [Find User](board.md#find-user "ƒ").

#### 3. Locate Epic Item

- Match the epic's issue to its board item.
- Provide an absent item as a finding and stop. The status write below needs it.

#### 4. Write and Confirm Review Status

- Apply [Record Dispatch Status](#record-dispatch-status "ƒ") with the epic as the review identity for In Review or the progress identity for In Progress, as [Review Selection](#review-selection) requests, meeting [Status Changes](#status-changes).
- When the item still shows the preceding status, Apply [Record Dispatch Status](#record-dispatch-status "ƒ") again for the same review or progress identity. Apply [Read Board Configuration](board.md#read-board-configuration "ƒ") for the same item to confirm the write. The item list can lag a write.

#### 5. Provide Confirmed Status

Provide [Confirmed Statuses](#confirmed-statuses) with the confirmed status or the discrepancy left for the requester.

### Record Dispatch Status

The task and epic statuses owned by a delivery dispatch.

#### 1. Compute Dispatch Calls

Run [Compute Dispatch Status](#compute-dispatch-status "ƒ").

#### 2. Apply and Confirm Calls

- Run each provided call.
- Apply [Read Board Configuration](board.md#read-board-configuration "ƒ") for each affected item to confirm the write.

#### 3. Provide Saved Statuses

Provide [Confirmed Statuses](#confirmed-statuses) with saved statuses or unresolved discrepancies.

## Commands

### Compute Board Changes

Compute membership, Status and assignee calls from supplied delivery evidence and provide [Board Changes](#board-changes "●") to the requester.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/board.py '[**&lt;initiative-json-file&gt;**](#initiative-record "○")' &#92;
  --epics '[**&lt;epic-json-file&gt;**](#epic-records "○")' &#92;
  --tasks '[**&lt;task-json-file&gt;**](#task-records "○")' &#92;
  --prs '[**&lt;pull-request-records-file&gt;**](#pull-request-records "○")' &#92;
  --links '[**&lt;issue-link-snapshot-file&gt;**](#issue-link-snapshot "○")' &#92;
  --agent-reviews '[**&lt;review-records-file&gt;**](#published-reviews "○")' &#92;
  --board [**&lt;board-identity&gt;**](#board-identity "○") &#92;
  --fields '[**&lt;board-fields-file&gt;**](#board-fields "○")' &#92;
  --items '[**&lt;board-items-file&gt;**](#board-items "○")' &#92;
  --out '[**&lt;output-directory&gt;**](#output-directory "○")' &#92;
  --assignee '[**&lt;assignee-login&gt;**](#assignee-login "○")'
</pre></big>

- Include each supplied [Resolved Issues](#resolved-issues "○") file with `--others`.

- Missing published agent-review evidence holds the epic In Progress.

- Pass each epic or task JSON file as a separate argument after its corresponding flag.

- Require the complete [Issue Link Snapshot](#issue-link-snapshot "○"); refuse the computation without it.
- Supply published review records linked from each open epic integration pull request; retain missing records as handoff blockers.

- Assignee changes must follow [Assignees](board.md#assignees). A newly added issue receives its status on a subsequent pass using refreshed items. Apply [Status Changes](#status-changes) to the supplied evidence.

### Compute Dispatch Status

Render board calls within the dispatch jurisdiction and provide [Board Changes](#board-changes "●") to the requester. A missing or failing agent review blocks the In Review write. Apply the dispatch jurisdiction in [Status Changes](#status-changes). Assignee changes must follow [Assignees](board.md#assignees).

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/deliver.py &#92;
  --items '[**&lt;board-items-file&gt;**](#board-items "○")' &#92;
  --board [**&lt;board-identity&gt;**](#board-identity "○") &#92;
  --fields '[**&lt;board-fields-file&gt;**](#board-fields "○")' &#92;
  --out '[**&lt;output-directory&gt;**](#output-directory "○")' &#92;
  --assignee '[**&lt;assignee-login&gt;**](#assignee-login "○")' &#92;
  --progress '[**&lt;held-issue-numbers&gt;**](#dispatch-selection "○")' &#92;
  --review '[**&lt;complete-epic-numbers&gt;**](#dispatch-selection "○")' &#92;
  --prs '[**&lt;pull-request-records-file&gt;**](#pull-request-records "○")' &#92;
  --agent-reviews '[**&lt;review-records-file&gt;**](#published-reviews "○")'
</pre></big>

## Fields

### Change Calls

A collection of executable calls for issues to add, items to remove, Status to set and assignees to add or remove. Each call names its affected issue and board item.

### Missing Evidence

A collection of unresolved issue references identifying dependency records missing from the supplied evidence. Each reference retains its repository and issue number.

### Resolved Issues

The supplied resolved off-board dependency issue records, each at its local file path.

### Review Selection

The epic issue identity, board identity and requested Status: In Review or In Progress.

### Saved Identities

The saved initiative, epic and task identities, board identity, output directory and repositories the board issues live in.

### Dispatch Selection

The supplied comma-separated held task and epic issue numbers for In Progress, and complete epic numbers for In Review. Either list can be empty when no write of that kind is selected.

### Board Changes

The generated membership, Status and assignee calls and unresolved references.

### Confirmed Statuses

The saved item statuses or unresolved discrepancies provided after item readback.

### Initiative Record

The supplied complete current initiative JSON at its local file path. eg `issue-936.json`

### Epic Records

The supplied complete current epic JSON records, each at a separate local file path. eg `issue-943.json issue-937.json`

### Task Records

The supplied complete current task issue JSON records, each at a separate local file path. eg `issue-637.json`

### Pull Request Records

The supplied freshly fetched complete REST pull request records, one JSON object per nonempty line at the local file path. eg `prs.json`

### Published Reviews

The JSON list of published agent-review records fetched from their linked planning records, at its local file path.

### Issue Link Snapshot

The supplied complete pull-request issue-link snapshot at its local file path. eg `links.json`

### Board Identity

The supplied users/owner/projectsV2/number or orgs/owner/projectsV2/number board identity. eg `users/m2ux/projectsV2/9`

### Board Fields

The supplied board field definitions at their local snapshot path. eg `fields.json`

### Board Items

The supplied board items with Status and their complete issue records, at the local paginated snapshot path. eg `items.json`

### Output Directory

The supplied local directory receiving generated calls. eg `board/`

### Output Paths

The supplied local paths for fetched evidence and generated calls.

### Assignee Login

The supplied login assigned to work from Ready. eg `m2ux`

### Workspace

The absolute supplied checkout path holding the installed Work Planner scripts and sandbox helper.

## Guidance

### Status Changes

An issue closed as completed is Done. Every board item whose issue is closed any other way is removed, whether or not an initiative, epic or task body cites it.

An open initiative whose criteria are all ticked is In Review. An open epic whose criteria are all ticked is In Review only with current published [agent review evidence](agent-review.md#review-record); missing, stale or unresolved review evidence keeps it In Progress.

An open epic with a criterion unticked is In Progress while it is [active](board-queue.md#epic-activity). An inactive one keeps Ready or Backlog; In Progress and In Review become Backlog, and one not yet on the board is added at Backlog.

An initiative is In Progress when an epic its Work Breakdown lists is In Progress or In Review. An epic that has left that table is not read. Otherwise the initiative keeps the Status it holds, In Review becoming In Progress, and one not yet on the board is added at Backlog, so completed work alone starts no initiative. Delivery does not move an initiative or epic between Ready and Backlog.

Only an initiative, an epic or a hot-fix stands In Review. An open task issue is In Progress while a delivery pull request, draft or ready, links it, and Done once that pull request merges into the epic base and the issue closes as completed. Every jurisdiction refuses a task set In Review.

A task whose row links a reserved planning folder is In Progress. A work-item file link alone leaves the row available. Dispatch writes are limited to In Progress for held tasks and epics, and In Review for completed epics; the shared DISPATCH jurisdiction refuses other statuses and removals.

Task readiness must meet [Task Eligibility](board-queue.md#task-eligibility). The caller supplies saved issue bodies and closure state.

A task gated on an [unresolvable dependency](board-queue.md#unresolvable-dependencies) keeps the Status it holds: the row waits on no delivery, so no status follows from its gate. The run names the row and the entry and exits nonzero, as every reader of that cell does.
