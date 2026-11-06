# Board Queue

The queue for one theme board: initiative priority sets, hot-fix status, status and assignee changes, pending decisions, waiting work, next epics, Ready units and epics waiting on a priority.

## Commands

### Compute Board Queue

Print proposed Status and assignee calls, [report lines](#report-lines) and unresolved issue references for one board queue and provide [Queue Result](#queue-result "●") to the requester. It exits nonzero for invalid task-table lane assignments or where an [unresolvable dependency](#unresolvable-dependencies) stopped it placing a row.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/board-queue.py &#92;
  --items '[**&lt;board-items-file&gt;**](#board-items "○")' &#92;
  --prs '[**&lt;pull-request-records-file&gt;**](#pull-request-records "○")' &#92;
  --links '[**&lt;issue-link-snapshot-file&gt;**](#issue-link-snapshot "○")' &#92;
  --board [**&lt;board-identity&gt;**](#board-identity "○") &#92;
  --fields '[**&lt;board-fields-file&gt;**](#board-fields "○")' &#92;
  --out '[**&lt;output-directory&gt;**](#output-directory "○")' &#92;
  --assignee '[**&lt;assignee-login&gt;**](#assignee-login "○")'
</pre></big>

- Include each supplied [Resolved Issues](#resolved-issues "○") file with `--others`.

- Repeat `--unplanned` for each supplied [Unplanned Initiative](#unplanned-initiatives "○").

- The computation reads [Read Lane Assignments](lane.md#read-lane-assignments "ƒ") and runs [Validate Lane Unit](lane.md#validate-lane-unit "ƒ") internally with each complete free unit derived after queue placement.
- Refuse a Status change outside Backlog, Ready and In Progress, identifying the issue, other than a hot-fix’s, which its [Board Status](hotfix.md#board-status) settles. In Review, Done and task issues are otherwise outside the write scope.
- Distinguish pending decisions and missing evidence under [Completeness](#completeness). The requester supplies further evidence and confirmed decisions for another pass and applies the proposed changes.

- The highest priority set is In Progress, all together. The next set is Ready, all together. Lower sets stay in Backlog. When the highest set leaves In Progress, the Ready set moves to In Progress.
- An initiative in Backlog with no priority label stays there. An initiative in Ready with no priority label moves to Backlog, as [Backlog Cascade](#backlog-cascade) states.
- An initiative In Progress with no priority label needs a decision: a positive integer keeps it In Progress; none sends it to Backlog once its epics' work has completed.
- An initiative stays In Progress while an epic its Work Breakdown lists is [active](#epic-activity), [handed off](#epic-handoff) or In Review, even when a higher set has started, as Board Delivery holds it In Progress. The epic's integration pull request is not activity; the epic's In Review status is what holds the initiative while that pull request awaits its merge. The highest set moves to In Progress immediately. Once that work completes, a lower set moves to Ready if it is the next number, or Backlog if a number sits between it and the highest.
- An initiative confirmed unplanned follows the same wait, then moves to Backlog as [Backlog Cascade](#backlog-cascade) states.
- An initiative In Review or Done remains in that state.

- Each hot-fix stands where its [Board Status](hotfix.md#board-status) places it.

- On an initiative Ready or In Progress, an [active](#epic-activity) epic is In Progress even with open questions. A delivered task row alone is not activity.
- On that initiative, an inactive epic can start when every entry of its initiative row's Depends on cell is delivered, every prerequisite epic that row names is closed as completed, all of each prerequisite's bases have merged into their long-lived branches, and the epic's Open Questions section is empty.
- Of the epics that can start, those carrying the highest priority number are next and Ready, all together. The highest counts the epics already In Progress, so an epic of a lower number waits while a higher one runs.
- An epic with no priority label is never Ready, whatever its siblings' state, so one that can start stays in Backlog.
- Any other Ready or In Progress epic of that initiative moves to Backlog.
- An epic In Review or Done, or [handed off](#epic-handoff), remains in that state.
- A Ready epic of an initiative that is neither Ready nor In Progress moves to Backlog. An epic is Ready only on an initiative Ready or In Progress.
- An initiative kept In Progress only while its epics' work completes readies none of its epics: its active epics are In Progress, and its inactive epics in Ready or In Progress move to Backlog.

## Fields

### Board Identity

The theme board identity as `users/{owner}/projectsV2/{id}` or `orgs/{owner}/projectsV2/{id}`. eg `users/<owner>/projectsV2/9`

### Priority Sets

A parallel work map is a mapping from initiative identity to positive integer priority. Every initiative with the same number runs together as one set. One left unordered stays in Backlog.

The epics of one initiative carry their own sets. Every epic with the same number starts together, and a number is compared only with its siblings'.

A priority label is `priority:` and a positive integer. A larger number is higher, with no maximum. Two such labels on one issue count as the larger number.

### Ready Units

A collection of units, each carrying initiative, epic and member task ids plus its [lane report label](lane.md#report-label). A unit contains one unjoined row or all rows of a unit defined by [Joins](dependency-graph.md#joins). Every member must be free and undelivered and meet [Task Eligibility](#task-eligibility) under its epic's proposed status; row availability follows [Task Delivery](epic-issue-body.md#task-delivery). Units include rows with no linked work item. Status and assignee calls depend on priority and delivery state.

### Proposed Changes

The queue contains calls for Status and assignee changes to initiatives, epics and hot-fixes. Status changes are between Backlog, Ready and In Progress, and a hot-fix's change as its [Board Status](hotfix.md#board-status) gives it. The assignee is the login assigned to work from Ready. Call files occupy the supplied output directory, for example `board/`. They describe proposed changes, not confirmation of live board state.

### Report Lines

| Line | When It Is Printed | What It Names |
| --- | --- | --- |
| `order` | No open initiative has a priority label | The open initiatives, including any already In Progress, for a parallel work map |
| `ask` | An initiative is In Progress and has no priority label | That initiative, for a positive integer or none |
| `wait` | An initiative is held In Progress by an epic it lists that is active, handed off or In Review | That initiative, the open delivery pull requests, and each epic In Review, awaiting review or held by a session |
| `reconcile` | An initiative would return to Backlog while an epic of it is active, handed off or In Review | That initiative and each such epic, for the user to finish or release |
| `next` | An initiative is Ready or In Progress and has epics that are Ready | Those epics |
| `unit` | A unit must meet [Ready Units](#ready-units) and [Unit Consistency](lane.md#unit-consistency) | Its initiative, epic and task ids followed by its [Report Label](lane.md#report-label), for example `unit I01:E00:W01+W02: lane 2` |
| `invalid` | A task has an [assignment finding](lane.md#assignments), or a free unit fails [Unit Consistency](lane.md#unit-consistency) | Its affected rows and values; the invalid unit is not reported as Ready, and the run exits nonzero |
| `rank` | An open initiative has an open epic with no priority label that is not [handed off](#epic-handoff) | That initiative and each such epic, for the user to rank |

### Resolved Issues

The supplied off-board dependency issue files, each containing its complete issue record.

### Unplanned Initiatives

The confirmed initiatives left with no priority, each supplied as an issue number or `<owner>/<repo>#<issue-number>`.

### Queue Result

A report containing proposed [changes](#proposed-changes), [Report Lines](#report-lines) and unresolved issue references, with the command exit status. The call files are written in [Output Directory](#output-directory). Pending decisions, missing evidence and invalid assignments remain explicit in the report; this is not a JSON envelope.

### Board Items

The supplied current board items with Status and their complete issue records, at the local paginated snapshot path. eg `items.json`

### Pull Request Records

The supplied complete initiative and hot-fix pull request records, one JSON object per nonempty line at the local file path. eg `prs.json`

### Issue Link Snapshot

The complete supplied pull-request issue-link snapshot at its local JSON path. eg `links.json`

### Board Fields

The supplied board-field definitions at their local snapshot path. eg `fields.json`

### Output Directory

The supplied local directory receiving proposed calls. eg `board/`

### Assignee Login

The supplied login assigned to work from Ready. eg `m2ux`

### Workspace

The absolute supplied checkout path holding the installed Work Planner scripts and sandbox helper.

## Guidance

### Backlog Cascade

An initiative that moves to Backlog takes its unstarted epics with it, and each loses its assignees, as [Assignees](board.md#assignees) states. Board Delivery moves each Ready task issue of a Backlog epic to Backlog, as [Task Eligibility](#task-eligibility) states.

An epic that is [active](#epic-activity), [handed off](#epic-handoff) or In Review is not released. The queue prints a `reconcile` line naming it, and the initiative and every one of its epics stay where they stand until the user finishes or releases that work.

### Epic Activity

An open epic is active while it has task work under way, and Board Delivery reads it the same way:

- a task row links a reserved planning folder, as [Task Delivery](epic-issue-body.md#task-delivery) defines, or
- an open pull request whose title names the epic, `[Ixx:Eyy]`, is not the epic's integration pull request, whose head is the epic base `ixx/eyy/<branch>` and whose base is `<branch>`.

A delivered row, and the integration pull request, are not activity.

### Epic Handoff

An open epic whose acceptance criteria are all ticked is handed off. Board Delivery places it In Review when its current agent review passes, and holds it In Progress while that review is missing or failing. The queue neither readies, parks nor releases it, and it holds its initiative In Progress as an epic In Review does.

### Task Eligibility

A task is Ready only when its epic is Ready or In Progress and every row its Depends on cell names is delivered. A row naming another epic's row waits for that row's outputs, as [Producer Outputs](delivery-branches.md#producer-outputs) states, and the rows beside it wait for nothing it waits on. The queue reads no checkout, so an output in the consumer's own repository stays unverified here, and the delivery survey, which reads one, is where such a row is found available. The queue contains no task issue changes; task status comes from the supplied delivery state.

### Unresolvable Dependencies

A `Depends on` entry that names no row and links no issue, names an issue the run was not given, or names a row the epic it points to does not carry, cannot resolve. No delivery makes it readable, so it is told apart from a prerequisite that has not landed.

- The report names the row and the entry as written, and a run that met one while deciding a placement exits nonzero.
- The epic that row gates keeps the Status it holds. The run proposes no move for it, so a Ready epic stays Ready on an entry nobody can read.
- Every entry of a cell is read, so a cell carrying two names both.

### Completeness

An `order` or `ask` line means a decision is pending. An unresolved issue reference means dependency evidence is missing. Either leaves the queue incomplete.

Invalid lane assignments leave the unit report incomplete and the run exits nonzero. They do not supply placement or assignee inputs.

A complete queue may still propose changes. Live board state has converged when a queue derived from refreshed items is complete and contains no further call. Every other [report line](#report-lines) remains reportable at that point.
