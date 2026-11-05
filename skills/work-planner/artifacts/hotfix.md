# Hot-fix

A hot-fix's board status, delivery unit and branch, delivering pull requests, hold and delivery record.

## Prerequisites

Read these files first.

- [Hot-fix Body](hotfix-body.md)
- [Issue](issue.md)
- [Board](board.md)
- [Board Delivery](board-delivery.md)
- [Placement](placement.md)
- [Repository Labels](repository-labels.md)
- [Agent Review](agent-review.md)

## Operations

### Open Hot-fix Issue

A source issue's hot-fix number and labels, ready for its body rewrite.

**Inputs:** [Repository](#repository), [Hot-fix Identity](#hot-fix-identity).

**Outputs:** [Hot-fix Number](#hot-fix-number).

#### 1. Select Hot-fix Number

Apply [Select Tracker Number](issue.md#select-tracker-number) with the hot-fix prefix letter.

#### 2. Ensure Required Labels

Apply [Ensure Repository Labels](repository-labels.md#ensure-repository-labels) with the labels hot-fix [Titles](hotfix-body.md#titles) name.

#### 3. Return Selected Number

Return the hot-fix number to the caller for rewriting and saving the issue's body, title and labels. The caller then invokes Apply [Settle Hot-fix Board Status](#settle-hot-fix-board-status) as its [placement](placement.md#disposition-conditions) orders.

### Hold Hot-fix Unit

One confirmed hot-fix unit held for its session.

**Inputs:** [Hot-fix Identity](#hot-fix-identity), [Board Evidence](#board-evidence).

**Outputs:** [Board Result](#board-result).

#### 1. Record Dispatch Hold

Apply [Record Dispatch Status](board-delivery.md#record-dispatch-status) with the hot-fix issue for In Progress and the supplied board evidence. That status is the hold [Delivery Unit](#delivery-unit) defines.

#### 2. Return Confirmed Hold

Return the confirmed status, or the discrepancy, to the caller. The session starts only once it is confirmed.

### Release Hot-fix Hold

A held hot-fix returned to the work the delivery plan offers.

**Inputs:** [Hot-fix Identity](#hot-fix-identity), [Board Evidence](#board-evidence).

**Outputs:** [Board Result](#board-result).

#### 1. Read Current Development

- Apply [Capture Issue Development](issue.md#capture-issue-development) for the hot-fix issue.
- Refuse the release while its [Delivery Unit](#delivery-unit) is running or unrecorded, and return the pull request that makes it so to the caller.

#### 2. Return Unit to Ready

Apply [Place Issue on Board](board.md#place-issue-on-board) with the supplied board, the hot-fix issue and Ready.

#### 3. Return Saved Status

Return the saved item and its Status to the caller.

### Record Hot-fix Delivery

One hot-fix body with its confirmed delivery and verified criteria recorded.

**Inputs:** [Hot-fix Record](#hot-fix-record), [Pull Request Records](#pull-request-records), [Issue Links](#issue-links), [Delivery Selection](#delivery-selection), [Output Body](#output-body).

**Outputs:** [Output Body](#output-body), [Delivery Findings](#delivery-findings).

#### 1. Record Verified Delivery

Apply [Sync Hot-fix Issue](#sync-hot-fix-issue) with the hot-fix JSON, records as `--prs`, snapshot as `--links`, delivery number as `--pr`, verified ids as `--tick` and output as `--fix`. Tick only criteria the caller has verified.

#### 2. Return Delivery Findings

Return the body and eligibility findings; the caller publishes the body and closes the tracker issue, as [Delivery Record](#delivery-record) states.

### Settle Hot-fix Board Status

One hot-fix's board item set where [Board Status](#board-status) places it.

**Inputs:** [Board Evidence](#board-evidence), [Hot-fix Identity](#hot-fix-identity).

**Outputs:** [Board Result](#board-result).

#### 1. Read Current Issue

Apply [Read Tracker Issue](issue.md#read-tracker-issue) for the hot-fix's current state.

#### 2. Read Current Board

Apply [Read Board State](board.md#read-board-state) for its item and Status. A hot-fix with no item has no Status.

#### 3. Apply Required Status

- Apply the status [Board Status](#board-status) gives that state and Status:

##### A Status

- Apply [Place Issue on Board](board.md#place-issue-on-board) with the supplied board, the hot-fix issue and that status, which adds the item where the board has none.

##### Off the Board, With an Item

- Apply [Remove Board Item](board.md#remove-board-item) with the supplied board owner and number and the item id Read Board State returned.

##### Off the Board, With No Item

- Change nothing; the hot-fix already stands off the board.

#### 4. Return Settled Board

Return the settled item, its removal, or the unchanged board to the caller.

### Sync Hot-fix Issue

Records the pull request that delivers a hot-fix, open or merged, ticks verified criteria, and reports whether it is closable.

**Inputs:** [Hot-fix Record](#hot-fix-record), [Pull Request Records](#pull-request-records), [Issue Links](#issue-links), [Delivery Selection](#delivery-selection), [Output Body](#output-body).

**Outputs:** [Output Body](#output-body), [Delivery Findings](#delivery-findings).

#### 1. Sync Hot-fix Issue

- Run this command from the workspace checkout with the supplied inputs.

- A `--pr` that does not deliver the hot-fix is refused, naming the condition it fails.
- `<criterion-ids>` is a comma-separated list of verified criterion ids.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace)" && "[**&lt;workspace&gt;**](#workspace)/scripts/sbx" python3 skills/work-planner/scripts/sync.py '[**&lt;hot-fix-json-file&gt;**](#hot-fix-record)' --prs '[**&lt;pull-request-records-file&gt;**](#pull-request-records)' --links '[**&lt;issue-link-snapshot-file&gt;**](#issue-links)' --pr '[**&lt;pull-request-number&gt;**](#delivery-selection)' --tick '[**&lt;criterion-ids&gt;**](#delivery-selection)' --fix '[**&lt;output-body-file&gt;**](#output-body)'
</pre></big>

**Example:**

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace)" && "[**&lt;workspace&gt;**](#workspace)/scripts/sbx" python3 skills/work-planner/scripts/sync.py issue-874.json --prs prs.json --links links.json --pr 950 --tick AC1 --fix fixed-874.md
</pre></big>

## Fields

### Board Status

- An open hot-fix stands In Review while a [delivering pull request](#delivering-pull-request) of it is open and ready for review, and In Progress while one is an open draft.
- Otherwise an open hot-fix is Ready, whatever any initiative's or epic's priority, and In Progress once it holds In Progress or In Review. It reaches the board as its [placement](placement.md#disposition-conditions) orders.
- A closed hot-fix takes the status [Status Changes](board-delivery.md#status-changes) gives a closed issue.
- No initiative or epic waits on a hot-fix, and a hot-fix waits on none.

### Delivery Unit

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

- A pull request delivers a hot-fix when its title opens with the hot-fix's prefix, `[F00] Purpose`, it lives in the hot-fix's repository, its base is the hot-fix's [target](hotfix-body.md#target), and its Development field links the hot-fix.
- It is opened from the hot-fix's [branch](#branch), as a draft.
- It is marked ready for review only once its review cycle is complete: its current [agent review](agent-review.md#review-record) leaves every finding fixed.
- A reopened hot-fix still counts a delivering pull request merged before it reopened, since the issue records no reopen time.
- A pull request into a branch the body named as its target before an edit stops counting, since the body names the current target.

### Delivery Record

- A hot-fix's merge is recorded on its own issue alone: its criteria and delivering pull request, then its closure. It records nothing on an epic or initiative.
- Its board item follows [Board Status](#board-status) once the issue closes.

### Repository

The supplied repository owner and name.

### Hot-fix Record

The supplied complete current hot-fix issue JSON.

### Board Evidence

The supplied board identity, most recently read board items with Status and field definitions, output directory and assignee login when holding a unit.

### Pull Request Records

The supplied current pull request records.

### Issue Links

The complete supplied issue-link snapshot.

### Delivery Selection

The confirmed delivering pull request number and the verified criterion ids.

### Output Body

The supplied local destination for the complete returned body.

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
