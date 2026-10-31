# Delivery Brief

The instructions and context supplied to one delivery session.

## Prerequisites

Read these files first.

- [Pull Request Body](pull-request-body.md)
- [Plan Change](plan-change.md)

## Operations

### *Populate* Delivery Brief

One complete prompt file for a confirmed delivery unit.

**Inputs:** Epic URL, task ids, Descriptions, each task's component, criteria, test obligations, branch and bases, worktree, reserved folder, engineering worktree, board identity, change allowance, supplied session procedure and output path.

1. Write the supplied identity, context and execution instructions to the prompt file, at the supplied output path or where [Location](#location) puts it.
   - Each part must meet [Fields](#fields).
2. Return the brief path and any missing context. The caller resolves gaps before dispatch.

## Fields

### Location

The brief is a working file, not part of the delivered change, so it sits in a working directory outside every repository it names. Absent a supplied path it takes the session's scratchpad, named for the unit.

### Work Identity

The brief names the epic issue URL, task ids, Descriptions, covered acceptance criteria and the theme board carrying the epic's item. It includes the selected branch, each epic base and the worktree where the session executes.

### Planning Record

The brief names the reserved planning folder and engineering worktree. Each task has one work-item file in that folder, registered in its README, and the brief carries the component the caller read from the file the plan was checked against, which is the one this file declares. Its row retains the folder link while reserved.

### Validation Scope

The brief carries the tests required by the unit's criteria, meeting [Test Coverage](pull-request-body.md#test-coverage). It identifies the work item's test rows and requires implementation and verification of that scope.

### Change Autonomy

The brief names the supplied [allowance](plan-change.md#allowance): the plan changes the session applies on its own. It requires the session's [change list](plan-change.md#change-list) with its result, holding what it applied and what it held.

### Execution Instructions

The caller supplies the session procedure and its invocation context. The brief includes that procedure with its planning, publication, merge, debt and arising-issue obligations, plus the confirmed decisions and evidence needed to execute it. A missing instruction or prerequisite is a finding returned to the caller.
