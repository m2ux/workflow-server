# Hot-fix

A hot-fix's board status, delivery unit and branch, delivering pull requests, hold and delivery record.

## Operations

### Settle Hot-fix Board Status

One hot-fix's board item set where [Board Status](#board-status) places it.

#### 1. Read Current Issue

Apply [Read Tracker Issue](issue.md#read-tracker-issue "ƒ") for the current state of [Hot-fix Identity](#hot-fix-identity).

#### 2. Read Current Board

Apply [Read Board State](board.md#read-board-state "ƒ") for the board in [Board Evidence](#board-evidence) to obtain the issue’s item and Status. A hot-fix with no item has no Status.

#### 3. Apply Required Status

- Apply the status [Board Status](#board-status) gives that state and Status:

##### A Status

- Apply [Place Issue on Board](board.md#place-issue-on-board "ƒ") with the supplied board, the hot-fix issue and that status, which adds the item where the board has none.

##### Off the Board, With an Item

- Run [Remove Board Item](board.md#remove-board-item "ƒ") with the supplied board owner and number and the item id Read Board State provided.

##### Off the Board, With No Item

- Change nothing; the hot-fix already stands off the board.

#### 4. Provide Settled Board

Provide [Board Result](#board-result) with the settled item, its removal, or the unchanged board.

## Commands

### Sync Hot-fix Issue

Record the open or merged pull request delivering a hot-fix, tick verified criteria, report whether the hot-fix is closable, and provide [Output Body](#output-body "●") and [Delivery Findings](#delivery-findings "●") to the requester.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/sync.py '[**&lt;hot-fix-json-file&gt;**](#hot-fix-record "○")' &#92;
  --prs '[**&lt;pull-request-records-file&gt;**](#pull-request-records "○")' &#92;
  --links '[**&lt;issue-link-snapshot-file&gt;**](#issue-links "○")' &#92;
  --pr [**&lt;pull-request-number&gt;**](#delivery-selection "○") &#92;
  --tick '[**&lt;criterion-ids&gt;**](#delivery-selection "○")' &#92;
  --fix '[**&lt;output-body-file&gt;**](#output-body "○")'
</pre></big>

- A `--pr` that does not deliver the hot-fix is refused, naming the condition it fails.
- `<criterion-ids>` is a comma-separated list of verified criterion ids.

- Tick only criteria the requester has verified. The requester publishes the body and closes the tracker issue under [Delivery Record](#delivery-record).

## Fields

### Delivery Unit

The hot-fix unit record: its issue identity, board state, branch, target base, worktree and delivery evidence.

- An open hot-fix Ready on the board is a delivery unit of its own, whatever any epic's state. Its issue is the unit's task issue; it has no row and no epic record.
- Its Coverage is every criterion it carries. Its record folder takes its prefix and title name as a task id and Description.
- Its component lies on its [target](hotfix-body.md#target), which its session's work item declares.
- **Running.**
  Any open pull request whose Development field links it, draft or not, makes it running: it is neither offered nor released, and an In Progress status it holds stays its hold. A linking pull request is enough to keep a second session off it, while only a [delivering pull request](#delivering-pull-request) is merged or recorded as its fix.
- **Unrecorded.**
  A merged delivering pull request on an open hot-fix leaves its merge awaiting the [delivery record](#delivery-record), whoever merged it.
- **Hold.**
  Its In Progress status is its hold: a dispatch sets it, and a return to Ready releases it while it is neither running nor unrecorded.

### Branch

A hot-fix's branch is cut from its [target](hotfix-body.md#target), which its `unit` line names as its base, and is named for its prefix in lowercase and hyphenated with a slug of at most four words from its title's name: `f00-key-validation`. Its worktree is named by its branch, as a task branch's is.

### Delivering Pull Request

A repository-qualified reference to the hot-fix's delivering pull request.

- A pull request delivers a hot-fix when its title opens with the hot-fix's prefix, `[F00] Purpose`, it lives in the hot-fix's repository, its base is the hot-fix's [target](hotfix-body.md#target), and its Development field links the hot-fix.
- It is opened from the hot-fix's [branch](#branch), as a draft.
- It is marked ready for review only once its review cycle is complete: its current [agent review](agent-review.md#review-record) leaves every finding fixed.
- A reopened hot-fix still counts a delivering pull request merged before it reopened, since the issue records no reopen time.
- A pull request into a branch the body named as its target before an edit stops counting, since the body names the current target.

### Delivery Record

The hot-fix issue's criterion evidence, delivering pull-request reference and closure state.

- A hot-fix's merge is recorded on its own issue alone: its criteria and delivering pull request, then its closure. It records nothing on an epic or initiative.
- Its board item must follow [Board Status](#board-status) once the issue closes.

### Repository

The supplied repository owner and name.

### Hot-fix Record

The supplied complete current hot-fix issue JSON. eg `issue-874.json`

### Board Evidence

The supplied board identity, most recently read board items with Status and field definitions, output directory and assignee login when holding a unit.

### Pull Request Records

The supplied current pull request records. eg `prs.json`

### Issue Links

The complete supplied issue-link snapshot. eg `links.json`

### Delivery Selection

Verified criterion ids may be empty when recording delivery without requesting criterion ticks.

The confirmed delivering pull request number and the verified criterion ids. eg `pull-request-number: 950`, `criterion-ids: AC1`

### Output Body

The supplied local destination for the complete provided body. eg `fixed-874.md`

### Hot-fix Number

The selected hot-fix number for the source issue.

### Board Result

The confirmed saved item and Status, item removal, unchanged board or discrepancy.

### Delivery Findings

The resulting body and eligibility findings for the supplied hot-fix delivery.

### Workspace

The absolute checkout holding the installed Work Planner scripts and sandbox helper.

### Hot-fix Identity

The supplied source or hot-fix issue's repository, number and URL.

## Guidance

### Board Status

- An open hot-fix stands In Review while a [delivering pull request](#delivering-pull-request) of it is open and ready for review, and In Progress while one is an open draft.
- Otherwise an open hot-fix is Ready, whatever any initiative's or epic's priority, and In Progress once it holds In Progress or In Review. It reaches the board as its [placement](placement.md#disposition-conditions) orders.
- A closed hot-fix takes the status [Status Changes](board-delivery.md#status-changes) gives a closed issue.
- No initiative or epic waits on a hot-fix, and a hot-fix waits on none.
