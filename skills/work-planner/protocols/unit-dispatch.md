# Unit Dispatch

One admitted unit held, prepared and started in its delivery session.

Follow the [Procedure](#procedure "ƒ"), adhering to [Rules](../rules.md) and [Conventions](../conventions.md).

## Procedure

### 1. Check Execution Prerequisites

- Take the selected batch and unit, current board and delivery evidence, project and engineering checkouts, run allowance, supplied session procedure and any [preparation](../artifacts/dispatch-batch.md#preparations) this run retains for the unit.
- Confirm the harness provides sub-agent dispatch and the [epic-base merge permission](../artifacts/pull-request.md#merge-permission); provide the absent capability before holding work.

#### Unit of Rows

- For a unit of rows:
- Confirm the epic carries every [Required Criteria](../artifacts/epic-issue-body.md#required-criteria) criterion its changes bring, with its declared delivering row.
- Keep each such row a unit of its own, joined to no other row.

### 2. Publish the Record

- For a new unit of rows, read each component from the work-item file its free row links, before reservation replaces that link.
- For a retained preparation, use its captured components and selected record, confirming this run owns that preparation.
- For a hot-fix, use the component context its [Delivery Unit](../artifacts/hotfix.md#delivery-unit) defines.
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

- For a hot-fix unit:
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

- Provide a competing hold or failed readback without starting a worker.

### 4. Prepare the Session

#### Unit Checkouts

- For each selected branch, base and worktree in the project checkout:

- Require [Prerequisite Evidence](../artifacts/delivery-branches.md#prerequisite-evidence) and names meeting [Task Branches](../artifacts/delivery-branches.md#task-branches).

- Run [Fetch Remote Branch](../artifacts/delivery-branches.md#fetch-remote-branch "ƒ") in the [project checkout](../artifacts/delivery-branches.md#project-checkout) of the repository the work changes, passing the base; stop on failure.

- Run [Add Task Worktree](../artifacts/delivery-branches.md#add-task-worktree "ƒ") in the project checkout at [Worktree Path](../artifacts/delivery-branches.md#worktree-path) for the [task branch](../artifacts/delivery-branches.md#task-branch), rooted in the fetched [Base Branch](../artifacts/delivery-branches.md#base-branch).

- Retain [Worktree Result](../artifacts/delivery-branches.md#worktree-result) with the worktree path, branch and base, or [Failure](../artifacts/delivery-branches.md#failure).

- A unit that changes several long-lived branches runs this once for each epic base, with the branch and worktree [Task Branches](../artifacts/delivery-branches.md#task-branches) names for it.

#### Delivery Brief

- Use the selected unit, confirmed preparation and captured component context.

- Write the [Work Identity](../artifacts/delivery-brief.md#work-identity) and [Planning Record](../artifacts/delivery-brief.md#planning-record) context, [Validation Scope](../artifacts/delivery-brief.md#validation-scope), [Change Autonomy](../artifacts/delivery-brief.md#change-autonomy) and [Execution Instructions](../artifacts/delivery-brief.md#execution-instructions) into the prompt file at [Output Path](../artifacts/delivery-brief.md#output-path) or where [Location](../artifacts/delivery-brief.md#location) puts it.
- Each part must meet [Fields](../artifacts/delivery-brief.md#fields).

- Retain the [brief path](../artifacts/delivery-brief.md#brief-path) and any [missing context](../artifacts/delivery-brief.md#missing-context). Resolve gaps before dispatch.
- Provide a missing-context finding before execution, retaining the hold.

### 5. Start the Worker

- Run [Check Dispatch Start](../artifacts/dispatch-batch.md#check-dispatch-start "ƒ") with the selected batch and unit, gathered start evidence, current observed sessions and actual free slots.
- Provide a capacity-only wait with the unit's preparation for the coordinator to retain and resume.
- Start the unit through this session's sub-agent dispatch only after validation succeeds.
- Supply the complete brief and its unit and engineering checkouts to the worker.
- Provide its observed session identity to the coordinator, which records it before selecting another batch.
- Provide a failed start as a held unit with its record and error; a hold is released only through the caller's explicit release decision.
