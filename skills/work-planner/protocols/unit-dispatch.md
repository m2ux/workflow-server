# Unit Dispatch

One admitted unit held, prepared and started in its delivery session.

**Runs in:** the project checkout.

## Prerequisites

Read these files first.

- [Dispatch Batch](../artifacts/dispatch-batch.md)
- [Epic Issue Body](../artifacts/epic-issue-body.md)
- [Pull Request](../artifacts/pull-request.md)
- [Planning Record](../artifacts/planning-record.md)
- [Issue](../artifacts/issue.md)
- [Board](../artifacts/board.md)
- [Board Delivery](../artifacts/board-delivery.md)
- [Hot-fix](../artifacts/hotfix.md)
- [Delivery Branches](../artifacts/delivery-branches.md)
- [Delivery Brief](../artifacts/delivery-brief.md)

## Procedure

1. **Check execution prerequisites.**
   Take the selected batch and unit, current board and delivery evidence, project and engineering checkouts, run allowance, supplied session procedure and any [preparation](../artifacts/dispatch-batch.md#preparations) this run retains for the unit.
   - Confirm the harness provides sub-agent dispatch and the [epic-base merge permission](../artifacts/pull-request.md#merge-permission); return the absent capability before holding work.
   - For a unit of rows, confirm the epic carries every [Required Criteria](../artifacts/epic-issue-body.md#required-criteria) criterion its changes bring, with its declared delivering row.
     - Keep each such row a unit of its own, joined to no other row.
2. **Publish the record.**
   For a new unit of rows, read each component from the work-item file its free row links, before reservation replaces that link.
   - For a retained preparation, use its captured components and selected record, confirming this run owns that preparation.
   - For a hot-fix, use the component context its [Delivery Unit](../artifacts/hotfix.md#delivery-unit) defines.
   - Run [Populate Planning Record](../artifacts/planning-record.md#populate-planning-record) for the selected record folder.
   - Run [Publish Planning Record](../artifacts/planning-record.md#publish-planning-record) for that folder.
   - Retain its confirmed remote publication as the unit's [start evidence](../artifacts/dispatch-batch.md#start-readiness).
3. **Hold the unit.**
   Run [Read Board State](../artifacts/board.md#read-board-state) for the selected board immediately before acquiring the unit's hold.
   - **Task rows.**
     - Run [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue) for the epic's current body.
     - For a new unit, run [Reserve Task Rows](../artifacts/epic-issue-body.md#reserve-task-rows) for every row of the unit, with that body and the refreshed board items.
       - Publish the returned body through [Save Tracker Issue](../artifacts/issue.md#save-tracker-issue).
     - For a retained preparation, require every current row to hold its selected record; return a changed hold as a blocker.
     - Run [Record Dispatch Status](../artifacts/board-delivery.md#record-dispatch-status) for its task issues, where present, and its epic, requesting In Progress.
     - Run [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue) for the epic and confirm every selected row holds this record.
   - **Hot-fix unit.**
     - Run [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue) for the hot-fix's current body.
     - For a new unit, run [Hold Hot-fix Unit](../artifacts/hotfix.md#hold-hot-fix-unit) with that issue, board identity and refreshed board items.
     - For a retained preparation, require its current board hold to remain confirmed.
     - Retain the confirmed hold for this record.
   - Return a competing hold or failed readback without starting a worker.
4. **Prepare the session.**
   Run [Create Task Worktree](../artifacts/delivery-branches.md#create-task-worktree) in the project checkout for each selected branch, base and worktree.
   - Call [Populate Delivery Brief](../artifacts/delivery-brief.md#populate-delivery-brief) with the selected unit, its components, reserved folder, worktrees and returned bases, project and engineering checkouts, test obligations, board identity, run allowance and supplied session procedure.
   - Return a missing-context finding before execution, retaining the hold.
5. **Start the worker.**
   Run [Validate Dispatch Start](../artifacts/dispatch-batch.md#validate-dispatch-start) with the selected batch and unit, gathered start evidence, current observed sessions and actual free slots.
   - Return a capacity-only wait with the unit's preparation for the coordinator to retain and resume.
   - Start the unit through this session's sub-agent dispatch only after validation succeeds.
   - Supply the complete brief and its unit and engineering checkouts to the worker.
   - Return its observed session identity to the coordinator, which records it before selecting another batch.
   - Return a failed start as a held unit with its record and error; a hold is released only through the caller's explicit release decision.
