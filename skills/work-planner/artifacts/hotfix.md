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

#### 1. Select Hot-fix Number

Apply [Select Tracker Number](issue.md#select-tracker-number "ƒ") in [Repository](#repository "○") using the hot-fix prefix letter to select a number for the source issue identified by [Hot-fix Identity](#hot-fix-identity "○").

#### 2. Ensure Required Labels

Apply [Ensure Repository Labels](repository-labels.md#ensure-repository-labels "ƒ") with the labels hot-fix [Titles](hotfix-body.md#titles) name.

#### 3. Provide Selected Number

Provide the [hot-fix number](#hot-fix-number "●") to the caller for rewriting and saving the issue's body, title and labels. The caller then invokes Apply [Settle Hot-fix Board Status](#settle-hot-fix-board-status "ƒ") as its [placement](placement.md#disposition-conditions) orders.

### Hold Hot-fix Unit

One confirmed hot-fix unit held for its session.

#### 1. Record Dispatch Hold

Apply [Record Dispatch Status](board-delivery.md#record-dispatch-status "ƒ") with [Hot-fix Identity](#hot-fix-identity "○") for In Progress and the supplied [Board Evidence](#board-evidence "○"). That status is the hold [Delivery Unit](#delivery-unit) defines.

#### 2. Provide Confirmed Hold

Provide [Board Result](#board-result "●") with the confirmed status or discrepancy. The session starts only once it is confirmed.

### Release Hot-fix Hold

A held hot-fix provided to the work the delivery plan offers.

#### 1. Read Current Development

- Apply [Capture Issue Development](issue.md#capture-issue-development "ƒ") for [Hot-fix Identity](#hot-fix-identity "○").
- Refuse the release while its [Delivery Unit](#delivery-unit) is running or unrecorded, and provide the pull request that makes it so to the caller.

#### 2. Provide Unit to Ready

Apply [Place Issue on Board](board.md#place-issue-on-board "ƒ") with the board in [Board Evidence](#board-evidence "○"), the hot-fix issue and Ready.

#### 3. Provide Saved Status

Provide [Board Result](#board-result "●") with the saved item and Status.

### Record Hot-fix Delivery

One hot-fix body with its confirmed delivery and verified criteria recorded.

#### 1. Record Verified Delivery

Apply [Sync Hot-fix Issue](#sync-hot-fix-issue "ƒ") to [Hot-fix Record](#hot-fix-record "○") with [Pull Request Records](#pull-request-records "○"), [Issue Links](#issue-links "○") and [Delivery Selection](#delivery-selection "○"), writing [Output Body](#output-body "○"). Tick only criteria the requester has verified.

#### 2. Provide Delivery Findings

Provide [Output Body](#output-body "●") and [Delivery Findings](#delivery-findings "●"); the requester publishes the body and closes the tracker issue, as [Delivery Record](#delivery-record) states.

### Settle Hot-fix Board Status

One hot-fix's board item set where [Board Status](#board-status) places it.

#### 1. Read Current Issue

Apply [Read Tracker Issue](issue.md#read-tracker-issue "ƒ") for the current state of [Hot-fix Identity](#hot-fix-identity "○").

#### 2. Read Current Board

Apply [Read Board State](board.md#read-board-state "ƒ") for the board in [Board Evidence](#board-evidence "○") to obtain the issue’s item and Status. A hot-fix with no item has no Status.

#### 3. Apply Required Status

- Apply the status [Board Status](#board-status) gives that state and Status:

##### A Status

- Apply [Place Issue on Board](board.md#place-issue-on-board "ƒ") with the supplied board, the hot-fix issue and that status, which adds the item where the board has none.

##### Off the Board, With an Item

- Apply [Remove Board Item](board.md#remove-board-item "ƒ") with the supplied board owner and number and the item id Read Board State provided.

##### Off the Board, With No Item

- Change nothing; the hot-fix already stands off the board.

#### 4. Provide Settled Board

Provide [Board Result](#board-result "●") with the settled item, its removal, or the unchanged board.

### Sync Hot-fix Issue

Records the pull request that delivers a hot-fix, open or merged, ticks verified criteria, and reports whether it is closable.

#### 1. Sync Hot-fix Issue

- A `--pr` that does not deliver the hot-fix is refused, naming the condition it fails.
- `<criterion-ids>` is a comma-separated list of verified criterion ids.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && \
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/sync.py '[**&lt;hot-fix-json-file&gt;**](#hot-fix-record "○")' \
  --prs '[**&lt;pull-request-records-file&gt;**](#pull-request-records "○")' \
  --links '[**&lt;issue-link-snapshot-file&gt;**](#issue-links "○")' \
  --pr [**&lt;pull-request-number&gt;**](#delivery-selection "○") \
  --tick [**&lt;criterion-ids&gt;**](#delivery-selection "○") \
  --fix '[**&lt;output-body-file&gt;**](#output-body "○")'
</pre></big>

#### 2. Provide Recorded Hot-fix Issue

Provide [Output Body](#output-body "●"), [Delivery Findings](#delivery-findings "●") to the requester.

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

**Example:**

```text
issue-874.json
```

### Board Evidence

The supplied board identity, most recently read board items with Status and field definitions, output directory and assignee login when holding a unit.

### Pull Request Records

The supplied current pull request records.

**Example:**

```text
prs.json
```

### Issue Links

The complete supplied issue-link snapshot.

**Example:**

```text
links.json
```

### Delivery Selection

The confirmed delivering pull request number and the verified criterion ids.

**Example:**

```text
pull-request-number: 950
criterion-ids: AC1
```

### Output Body

The supplied local destination for the complete provided body.

**Example:**

```text
fixed-874.md
```

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
