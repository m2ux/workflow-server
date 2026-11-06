# Delivery Brief

The instructions and context supplied to one delivery session.

## Fields

### Location

The brief's local working-file path, outside every repository it names because the brief is not part of the delivered change. Absent a supplied path, it is the session's scratchpad named for the unit.

### Work Identity

The brief names the epic or hot-fix issue URL, task ids, Descriptions, covered acceptance criteria and the theme board carrying that issue's item. It includes each task branch, with the base it is cut from and the unit checkout where the session works on it, and the project checkout the session merges through.

### Planning Record

The brief names the reserved planning folder and engineering worktree. Each task has one work-item file in that folder, registered in its README, and the brief carries the component the caller read from the file the plan was checked against, which is the one this file declares. Its row retains the folder link while reserved.

### Validation Scope

The mapping from the unit's criteria to the work item's required test rows, with instructions requiring implementation and verification of that scope. The mapping must meet [Test Coverage](pull-request-body.md#test-coverage).

### Change Autonomy

The brief names the supplied [allowance](plan-change.md#allowance): the plan changes the session applies on its own. It requires the session's [change list](plan-change.md#change-list) with its result, holding what it applied and what it held.

### Execution Instructions

The supplied session-procedure reference and invocation context, including its planning, publication, merge, debt and arising-issue obligations, with the confirmed decisions and evidence needed to execute it. A missing instruction or prerequisite is a finding provided to the caller.

### Output Path

The prompt-file destination; absent when Location selects the session scratchpad.

### Brief Path

The completed working prompt file path.

### Missing Context

Any required context missing from the supplied brief inputs.
