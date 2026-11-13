# Unit Dispatch

One admitted unit held, prepared and started in its delivery session.

Follow the [Procedure](#procedure "ƒ"), adhering to [Rules](../rules.md) and [Conventions](../conventions.md).

## Procedure

### 1. Check Execution Prerequisites

- Take the selected batch and unit, current board and delivery evidence, project and engineering checkouts, run allowance, supplied session procedure and any [preparation](../artifacts/dispatch-batch.md#preparations) this run retains for the unit.
- An unsuccessful artifact operation stops this unit: provide it as a unit blocker, retaining any acquired hold.
- Confirm the harness provides sub-agent dispatch and the [epic-base merge permission](../artifacts/pull-request.md#merge-permission); provide an absent capability as a [run blocker](../artifacts/dispatch-batch.md#blockers) before holding work, then stop this unit.

#### Unit of Rows

- For a unit of rows:
  - Confirm the epic carries every [Required Criteria](../artifacts/epic-issue-body.md#required-criteria) criterion its changes bring, with its declared delivering row.
  - Keep each such row a unit of its own, joined to no other row.
  - On an unmet criterion condition, provide a unit blocker and stop this unit.

### 2. Publish the Record

- For a new unit of rows, read the declared files from the work-item file each free row links, before reservation replaces that link.
- For a retained preparation, use its captured declared files and selected record, confirming this run owns that preparation.
- For a hot-fix, use the declared-file context its [Delivery Unit](../artifacts/hotfix.md#delivery-unit) defines.
- Apply [Populate Planning Record](../artifacts/planning-record.md#populate-planning-record "ƒ") for the selected record folder.
- Apply [Publish Planning Record](../artifacts/planning-record.md#publish-planning-record "ƒ") for that folder.
- Retain its confirmed remote publication as the unit's [Start Evidence](../artifacts/dispatch-batch.md#start-evidence).

### 3. Hold the Unit

- Apply [Read Board State](../artifacts/board.md#read-board-state "ƒ") for the selected board immediately before acquiring the unit's hold.

#### Task Rows

- For task rows:
  - Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue "ƒ") for the epic's current body.
  - For a new unit, Run [Reserve Row](../artifacts/epic-issue-body.md#reserve-row "ƒ") for every row of the unit, with that body and the refreshed board items, then Apply [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue "ƒ") with the provided body.
  - For a retained preparation, require every current row to hold its selected record; provide a changed hold as a blocker.
  - Apply [Record Dispatch Status](../artifacts/board-delivery.md#record-dispatch-status "ƒ") for its task issues, where present, and its epic, requesting In Progress.
  - Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue "ƒ") for the epic and confirm every selected row holds this record.

#### Hot-Fix Unit

- For a [hot-fix unit](../artifacts/delivery-plan.md#hot-fix-units):
  - Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue "ƒ") for the hot-fix's current body.

##### New Hot-Fix Unit

- For a new unit, use that issue, board identity and refreshed board items.

- Apply [Record Dispatch Status](../artifacts/board-delivery.md#record-dispatch-status "ƒ") with [Hot-fix Identity](../artifacts/hotfix.md#hot-fix-identity) for In Progress and the supplied [Board Evidence](../artifacts/hotfix.md#board-evidence). That status is the hold [Delivery Unit](../artifacts/hotfix.md#delivery-unit) defines.

- Retain [Board Result](../artifacts/hotfix.md#board-result) with the confirmed status or discrepancy. The session starts only once it is confirmed.

##### Retained Hot-Fix Preparation

- For a retained preparation, require its current board hold to remain confirmed.

##### Confirmed Hot-Fix Hold

- Retain the confirmed hold for this record.

#### Hold Result

- On a competing hold or failed readback, provide a unit blocker and stop this unit.

### 4. Prepare the Session

#### New Unit Checkouts

- For a new unit, prepare each selected branch, base and worktree in the project checkout:
  - Require [Prerequisite Evidence](../artifacts/delivery-branches.md#prerequisite-evidence) and names meeting [Task Branches](../artifacts/delivery-branches.md#task-branches).
  - Run [Fetch Remote Branch](../artifacts/delivery-branches.md#fetch-remote-branch "ƒ") in the project checkout with its base; stop on failure.
  - Run [Add Task Worktree](../artifacts/delivery-branches.md#add-task-worktree "ƒ") in the project checkout with the selected path, task branch and fetched base.
  - Run [Read Checkout Revision](../artifacts/delivery-branches.md#read-checkout-revision "ƒ") in the unit checkout for `HEAD` and retain its full preparation head with the worktree path, branch and base.
  - A unit changing several long-lived branches repeats this for each selected base.

#### Retained Unit Checkouts

- For a retained preparation, Run [Check Task Worktree](../artifacts/delivery-branches.md#check-task-worktree "ƒ") for each recorded checkout with the project checkout, retained path, branch and full preparation head.
- Require every verified result before preparing the brief. A mismatch stops this unit: provide a unit blocker and retain its checkout and hold.

#### Delivery Brief

- Use the selected unit, confirmed preparation and captured declared-file context.

- Write the [Work Identity](../artifacts/delivery-brief.md#work-identity) and [Planning Record](../artifacts/delivery-brief.md#planning-record) context, [Validation Scope](../artifacts/delivery-brief.md#validation-scope), [Change Autonomy](../artifacts/delivery-brief.md#change-autonomy) and [Execution Instructions](../artifacts/delivery-brief.md#execution-instructions) into the prompt file at [Output Path](../artifacts/delivery-brief.md#output-path) or where [Location](../artifacts/delivery-brief.md#location) puts it.
- Each part must meet [Fields](../artifacts/delivery-brief.md#fields).

- Retain the [brief path](../artifacts/delivery-brief.md#brief-path) and any [missing context](../artifacts/delivery-brief.md#missing-context). Resolve gaps before dispatch.
- On missing context, provide a unit blocker, retain the hold and stop this unit before execution.

### 5. Start the Worker

- Run [Check Dispatch Start](../artifacts/dispatch-batch.md#check-dispatch-start "ƒ") with the selected batch and unit, gathered start evidence, current observed sessions, actual free slots and recorded blockers.
- Provide a capacity-only wait with the unit's preparation for the coordinator to retain and resume.
- Start the unit through this session's sub-agent dispatch only after validation succeeds.
- Supply the complete brief and its unit and engineering checkouts to the worker.
- Provide its observed session identity to the coordinator, which records it before selecting another batch.
- On another failed start, provide a unit blocker with its held record and observed error, then stop this unit.
