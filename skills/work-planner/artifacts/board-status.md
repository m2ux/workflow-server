# Board Status

The Status and membership each board item takes from supplied issue, delivery and review evidence, proposed as calls held to one write jurisdiction.

## Commands

### Compute Board Changes

Derive each initiative, epic and task item's Status from supplied delivery evidence under [Item Status](#item-status) and [Closure](#closure), within the delivery jurisdiction of [Write Jurisdiction](#write-jurisdiction), and provide [Board Changes](#board-changes "●") to the requester.

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

- Pass each epic or task JSON file as a separate argument after its corresponding flag.

- Require the complete [Issue Link Snapshot](#issue-link-snapshot "○"); refuse the computation without it.
- Supply published review records linked from each open epic integration pull request; missing published agent-review evidence holds the epic In Progress and is retained as a handoff blocker.

- Assignee changes must follow [Assignees](board.md#assignees). A newly added issue receives its Status on a subsequent pass using refreshed items.

### Compute Dispatch Status

Render the In Progress a dispatch holds and the In Review a completed epic takes, within the dispatch jurisdiction of [Write Jurisdiction](#write-jurisdiction), and provide [Board Changes](#board-changes "●") to the requester. A missing or failing agent review refuses the In Review write, and an issue not on the board refuses the computation. Assignee changes must follow [Assignees](board.md#assignees).

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

### Status Change

One issue's proposed board change: its repository and number, title and board item id, or no item; the Status it holds, or none; and the Status it takes or its removal, with the assignee calls that Status brings. A change outside the computation's [jurisdiction](#write-jurisdiction) is refused, naming the issue.

### Board Changes

The computation's [status changes](#status-change), each an executable `gh` call naming its issue and item: an issue to add, an item to remove, a Status to set, an assignee to add or remove. Then the count of current issues and of changes to do, each unresolved issue reference with its repository and number, and each handoff blocker or refusal naming its issue. A nonzero exit carries a blocker or refusal.

### Resolved Issues

The supplied resolved off-board dependency issue records, each at its local file path.

### Dispatch Selection

The supplied comma-separated held task and epic issue numbers for In Progress, and complete epic numbers for In Review. Either list can be empty when no write of that kind is selected.

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

### Assignee Login

The supplied login assigned to work from Ready. eg `m2ux`

### Workspace

The absolute supplied checkout path holding the installed Work Planner scripts and sandbox helper.

## Guidance

### Closure

An issue closed as completed is Done. Every board item whose issue is closed any other way is removed, whether or not an initiative, epic or task body cites it.

### Item Status

An open initiative whose criteria are all ticked is In Review. An open epic whose criteria are all ticked is In Review only with current published [agent review evidence](agent-review.md#review-record); missing, stale or unresolved review evidence keeps it In Progress.

An open epic with a criterion unticked is In Progress while it is [active](board-queue.md#epic-activity). An inactive one keeps Ready or Backlog; In Progress and In Review become Backlog, and one not yet on the board is added at Backlog.

An initiative is In Progress when an epic its Work Breakdown lists is In Progress or In Review. An epic that has left that table is not read. Otherwise the initiative keeps the Status it holds, In Review becoming In Progress, and one not yet on the board is added at Backlog, so completed work alone starts no initiative.

An open task issue is In Progress while a delivery pull request, draft or ready, links it, and Done once that pull request merges into the epic base and the issue closes as completed. A task whose row links a reserved planning folder is In Progress; a work-item file link alone leaves the row available.

Task readiness must meet [Task Eligibility](board-queue.md#task-eligibility). The caller supplies saved issue bodies and closure state.

A task gated on an [unresolvable dependency](board-queue.md#unresolvable-dependencies) keeps the Status it holds: the row waits on no delivery, so no status follows from its gate. The run names the row and the entry and exits nonzero, as every reader of that cell does.

### Write Jurisdiction

Each computation holds its changes to one jurisdiction and refuses a change outside it, naming the issue.

- **Every jurisdiction.**
  A task never stands In Review. In Review is held by an initiative, an epic, or a hot-fix, as its [Board Status](hotfix.md#board-status) gives it.
- **Delivery.**
  Board changes computed from delivery evidence move no initiative or epic between Ready and Backlog.
- **Queue.**
  The [queue](board-queue.md) sets Backlog, Ready and In Progress on initiatives and epics, and moves no task. In Review and Done are refused, but for an open hot-fix's In Review and the Done of a hot-fix closed as completed.
- **Dispatch.**
  A dispatch sets In Progress on held tasks and epics and In Review on completed epics, and refuses every other Status and any removal.
