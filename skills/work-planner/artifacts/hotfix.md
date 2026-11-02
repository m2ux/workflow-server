# Hot-fix

A hot-fix's board status, delivery unit and branch, delivering pull requests, hold and delivery record.

## Prerequisites

Read these files first.

- [Hot-fix Body](hotfix-body.md)
- [Issue](issue.md)
- [Issue Body](issue-body.md)
- [Board](board.md)
- [Board Delivery](board-delivery.md)
- [Repository Labels](repository-labels.md)

## Operations

### *Open* Hot-fix Issue

A source issue made a hot-fix on its confirmed theme board, held in Backlog for its body rewrite.

**Inputs:** Repository, source issue identity and the confirmed theme board.

1. Run [Select Tracker Number](issue.md#select-tracker-number) with the hot-fix prefix letter.
2. Run [Ensure Repository Labels](repository-labels.md#ensure-repository-labels) with the labels hot-fix [Titles](hotfix-body.md#titles) name.
3. Run [Place Issue on Board](board.md#place-issue-on-board) with the confirmed theme board, the source issue and Backlog, since the source issue is not yet in the hot-fix format.
4. Return the hot-fix number and the saved board item to the caller, which rewrites the issue's body, title and labels, then settles its status through [Settle Hot-fix Board Status](#settle-hot-fix-board-status).

### *Hold* Hot-fix Unit

One confirmed hot-fix unit held for its session.

**Inputs:** Hot-fix issue, board identity, the board items the caller last read, field definitions, output directory and assignee login.

1. Run [Record Dispatch Status](board-delivery.md#record-dispatch-status) with the hot-fix issue for In Progress and the supplied board evidence. That status is the hold [Delivery Unit](#delivery-unit) defines.
2. Return the confirmed status, or the discrepancy, to the caller. The session starts only once it is confirmed.

### *Release* Hot-fix Hold

A held hot-fix returned to the work the delivery plan offers.

**Inputs:** Board identity and the held hot-fix's issue identity.

1. Run [Capture Issue Development](issue.md#capture-issue-development) for the hot-fix issue.
   - Refuse the release while its [Delivery Unit](#delivery-unit) is running or unrecorded, and return the pull request that makes it so to the caller.
2. Run [Read Tracker Issue](issue.md#read-tracker-issue) for the hot-fix's complete JSON, then [Check Body Format](issue-body.md#check-body-format) with it for its [format findings](issue-body.md#format-findings).
3. Run [Place Issue on Board](board.md#place-issue-on-board) with the supplied board, the hot-fix issue and the status [Board Status](#board-status) gives an open hot-fix holding Ready with those findings.
4. Return the saved item and its Status to the caller.

### *Record* Hot-fix Delivery

One hot-fix body with its confirmed delivery and verified criteria recorded.

**Inputs:** Hot-fix JSON, pull request records, complete issue-link snapshot, delivering pull request number, verified criterion ids and output body file.

1. Run [Sync Hot-fix Issue](#sync-hot-fix-issue) with the hot-fix JSON, records as `--prs`, snapshot as `--links`, delivery number as `--pr`, verified ids as `--tick` and output as `--fix`. Tick only criteria the caller has verified.
2. Return the body and eligibility findings; the caller publishes the body and closes the tracker issue, as [Delivery Record](#delivery-record) states.

### *Settle* Hot-fix Board Status

One hot-fix's board item set where [Board Status](#board-status) places it.

**Inputs:** Board identity and the hot-fix issue identity.

1. Run [Read Tracker Issue](issue.md#read-tracker-issue) for the hot-fix's complete JSON.
2. For an open hot-fix, run [Check Body Format](issue-body.md#check-body-format) with that JSON for its [format findings](issue-body.md#format-findings).
3. Run [Read Board State](board.md#read-board-state) for its item and Status. A hot-fix with no item has no Status.
4. Apply the status [Board Status](#board-status) gives that state, those findings and Status:
   - **A status.**
     - Run [Place Issue on Board](board.md#place-issue-on-board) with the supplied board, the hot-fix issue and that status, which adds the item where the board has none.
   - **Off the board, with an item.**
     - Run [Remove Board Item](board.md#remove-board-item) with the supplied board owner and number and the item id Read Board State returned.
   - **Off the board, with no item.**
     - Change nothing; the hot-fix already stands off the board.
5. Return the settled item, its removal, or the unchanged board to the caller.

## Fields

### Board Status

- An open hot-fix is Backlog while it is out of the hot-fix format: checked as a hot-fix, its title, labels or body leave a [format finding](issue-body.md#format-findings) to apply or decide.
- An open hot-fix in that format is Ready, whatever any initiative's or epic's priority, and stays In Progress once it holds it.
- A hot-fix never stands In Review: one in the format found there moves to In Progress.
- A hot-fix closed as completed is Done, and one closed any other way leaves the board.
- No initiative or epic waits on a hot-fix, and a hot-fix waits on none.

### Delivery Unit

- An open hot-fix Ready on the board is a delivery unit of its own, whatever any epic's state. Its issue is the unit's task issue; it has no row and no epic record.
- Its Coverage is every criterion it carries. Its record folder takes its prefix and title name as a task id and Description.
- Its component lies on its [target](hotfix-body.md#target), which its session's work item declares.
- **Running.**
  Any open pull request whose Development field links it makes it running: it is neither offered nor held. A linking pull request is enough to keep a second session off it, while only a [delivering pull request](#delivering-pull-request) is merged or recorded as its fix.
- **Unrecorded.**
  A merged delivering pull request on an open hot-fix leaves its merge awaiting the [delivery record](#delivery-record), whoever merged it.
- **Hold.**
  Otherwise its In Progress status is its hold: a dispatch sets it, and a return to Ready releases it while it is neither running nor unrecorded.

### Branch

A hot-fix's branch is cut from its [target](hotfix-body.md#target), which its `unit` line names as its base, and is named for its prefix in lowercase and hyphenated with a slug of at most four words from its title's name: `f00-key-validation`. Its worktree is named by its branch, as a task branch's is.

### Delivering Pull Request

- A pull request delivers a hot-fix when its title opens with the hot-fix's prefix, `[F00] Purpose`, it lives in the hot-fix's repository, its base is the hot-fix's [target](hotfix-body.md#target), and its Development field links the hot-fix.
- It is opened from the hot-fix's [branch](#branch).
- A reopened hot-fix still counts a delivering pull request merged before it reopened, since the issue records no reopen time.
- A pull request into a branch the body named as its target before an edit stops counting, since the body names the current target.

### Delivery Record

- A hot-fix's merge is recorded on its own issue alone: its criteria and delivering pull request, then its closure. It records nothing on an epic or initiative.
- Its board item follows [Board Status](#board-status) once the issue closes.

## Commands

### Sync Hot-fix Issue

Records the pull request that delivers a hot-fix, open or merged, ticks verified criteria, and reports whether it is closable.

**Inputs:** Hot-fix JSON, pull request records, complete issue-link snapshot, delivering pull request number, verified criterion ids and output file.

- A `--pr` that does not deliver the hot-fix is refused, naming the condition it fails.
- `<criterion-ids>` is a comma-separated list of verified criterion ids.

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/sync.py '<hot-fix-json-file>' --prs '<pull-request-records-file>' --links '<issue-link-snapshot-file>' --pr '<pull-request-number>' --tick '<criterion-ids>' --fix '<output-body-file>'
```

**Example:**

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/sync.py issue-874.json --prs prs.json --links links.json --pr 950 --tick AC1 --fix fixed-874.md
```
