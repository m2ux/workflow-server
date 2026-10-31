# Board Queue

The queue for one theme board: initiative priority sets, status and assignee changes, pending decisions, waiting work and next epics.

## Prerequisites

Read these files first.

- [Epic Issue Body](epic-issue-body.md)

## Operations

### *Plan* Board Queue

Derives the queue from supplied board and delivery snapshots and confirmed decisions.

**Inputs:** Board identity, current board items with Status, initiative pull request records, board fields, assignee login, output directory, resolved off-board issue files and confirmed unplanned initiative identities. The caller supplies the delivery state.

1. Run [Compute Board Queue](#compute-board-queue) with the snapshots as `--items`, `--prs` and `--fields`, the board as `--board`, the login as `--assignee`, the output directory as `--out`, every resolved issue file as `--others` and every confirmed unplanned initiative as `--unplanned`.
   - The queue must meet [Fields](#fields).
   - Refuse a Status change outside Backlog, Ready and In Progress, identifying the issue. In Review, Done and task issues are outside the write scope.
2. Return the proposed Status and assignee calls, report lines and unresolved issue references to the caller.
   - Distinguish pending decisions and missing evidence as [Completeness](#completeness) defines.
   - Report each [unresolvable dependency](#unresolvable-dependencies) with the row and the entry, and leave that row's epic where it stands.
   - The caller supplies further evidence and confirmed decisions for another pass and applies the proposed changes to tracked objects.

## Fields

### Board Identity

The queue belongs to one theme board, identified as `users/{owner}/projectsV2/{id}` or `orgs/{owner}/projectsV2/{id}`. Its source snapshots contain board items with Status, board fields, initiative pull requests and any off-board issues its rows depend on.

### Priority Sets

A parallel work map assigns a positive integer to each ranked initiative. Every initiative with the same number runs together as one set. One left unordered stays in Backlog.

The epics of one initiative carry their own sets. Every epic with the same number starts together, and a number is compared only with its siblings'.

A priority label is `priority:` and a positive integer. A larger number is higher, with no maximum. Two such labels on one issue count as the larger number.

### Initiative Status

- The highest priority set is In Progress, all together. The next set is Ready, all together. Lower sets stay in Backlog. When the highest set leaves In Progress, the Ready set moves to In Progress.
- An initiative in Backlog with no priority label stays there. An initiative in Ready with no priority label moves to Backlog, with its epics.
- An initiative In Progress with no priority label needs a decision: a positive integer keeps it In Progress; none sends it to Backlog once its open pull requests have completed.
- An initiative stays In Progress while an open pull request names one of its epics, `[Ixx:Eyy]`, even when a higher set has started. The highest set moves to In Progress immediately. After the lower set's open pull requests complete, it moves to Ready if it is the next number, or Backlog if a number sits between it and the highest.
- An initiative confirmed unplanned follows the same wait, then moves to Backlog with its epics.
- An initiative In Review or Done remains in that state.

### Epic Status

- On an initiative In Progress, a partly completed epic is In Progress even with open questions. Partly completed means a delivered task row on an epic that is not closed as completed. Delivery follows [Task Delivery](epic-issue-body.md#task-delivery), using the supplied evidence.
- On that initiative, an unstarted epic can start when every prerequisite epic its initiative row names is closed as completed, all of each prerequisite's bases have merged into their long-lived branches, and the epic's Open Questions section is empty.
- Of the epics that can start, those carrying the highest priority number are next and Ready, all together. The highest counts the epics already In Progress, so an epic of a lower number waits while a higher one runs.
- An epic with no priority label ranks below every number, so it is Ready only when no labelled sibling can start or is running.
- Any other Ready epic of that initiative moves to Backlog.
- An epic In Review or Done remains in that state.
- On an initiative that moves to Backlog, its epics move to Backlog. A Ready epic of an initiative that is not In Progress moves to Backlog.

### Task Eligibility

A task is Ready only when its epic is Ready or In Progress and every row its Depends on cell names is delivered. A row naming another epic's row waits for that epic to close, since its output reaches this epic's base when that epic's bases merge, and the rows beside it wait for nothing it waits on. The queue contains no task issue changes; task status comes from the supplied delivery state.

### Proposed Changes

The queue contains calls for Status and assignee changes to initiatives and epics. Status changes are between Backlog, Ready and In Progress. The assignee is the login assigned to work from Ready. Call files occupy the supplied output directory, for example `board/`. They describe proposed changes, not confirmation of live board state.

### Report Lines

| Line | When It Is Printed | What It Names |
| --- | --- | --- |
| `order` | No open initiative has a priority label | The open initiatives, including any already In Progress, for a parallel work map |
| `ask` | An initiative is In Progress and has no priority label | That initiative, for a positive integer or none |
| `wait` | An open pull request names one of an initiative's epics | That initiative and the pull request |
| `next` | An initiative is In Progress and has epics that are Ready | Those epics |

### Recommended Decisions

The answer a caller applies where it resolves an `order` or `ask` line on its own.

- For `order`, priority 1 on every open initiative already In Progress or named by an open pull request, and no number on the rest. Where no initiative qualifies, nothing is under way and the line has no recommended answer.
- For `ask`, the number of the highest set already running, so the initiative joins it, or 1 where no initiative carries a priority label.

### Unresolvable Dependencies

A `Depends on` entry that names no row and links no issue, names an issue the run was not given, or names a row the epic it points to does not carry, cannot resolve. No delivery makes it readable, so it is told apart from a prerequisite that has not landed.

- The report names the row and the entry as written, and a run that met one while deciding a placement exits nonzero.
- The epic that row gates keeps the Status it holds. The run proposes no move for it, so a Ready epic is not returned to Backlog on an entry nobody can read.
- Every entry of a cell is read, so a cell carrying two names both.
- A note raised while reading delivery rather than deciding a placement is reported and leaves the exit status alone.

### Completeness

An `order` or `ask` line means a decision is pending. An unresolved issue reference means dependency evidence is missing. Either leaves the queue incomplete.

A complete queue may still propose changes. Live board state has converged when a queue derived from refreshed items is complete and contains no further call. `wait` and `next` lines remain reportable at that point.

## Commands

### Compute Board Queue

Prints proposed Status and assignee calls, `order`, `ask`, `wait` and `next` lines, and unresolved issue references for one board queue. It exits nonzero where an [unresolvable dependency](#unresolvable-dependencies) stopped it placing a row.

**Inputs:** Current board and delivery snapshots, board identity, assignee login, output directory, resolved dependency evidence, confirmed unplanned initiatives and the permitted Status scope.

- `--items` is the board's items with Status.
- `--prs` is the pull requests that name an initiative.
- `--board` is the [board identity](#board-identity).
- `--fields` is the board's fields.
- `--out` is the directory the calls are written to.
- `--assignee` is the login assigned to work from Ready.
- `--others` is an issue file for an issue the rows depend on that is not on the board. Repeatable.
- `--unplanned` is an initiative left with no priority, an issue number or `<owner>/<repo>#<issue-number>`. Repeatable.

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/board-queue.py --items '<board-items-file>' --prs '<pull-request-records-file>' --board '<board-identity>' --fields '<board-fields-file>' --out '<output-directory>' --assignee '<assignee-login>'
```

**Example:**

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/board-queue.py --items items.json --prs prs.json --board 'users/<owner>/projectsV2/9' --fields fields.json --out board/ --assignee m2ux
```
