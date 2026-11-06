# Delivery Brief

The instructions and context supplied to one delivery session.

## Prerequisites

Read these files first.

- [Pull Request Body](pull-request-body.md)
- [Plan Change](plan-change.md)

## Operations

### Populate Delivery Brief

One complete prompt file for a confirmed delivery unit.

#### 1. Write Complete Delivery Brief

- Write the [Work Identity](#work-identity) and [Planning Record](#planning-record) context, [Validation Scope](#validation-scope), [Change Autonomy](#change-autonomy) and [Execution Instructions](#execution-instructions) into the prompt file at [Output Path](#output-path) or where [Location](#location) puts it.
- Each part must meet [Fields](#fields).

#### 2. Provide Brief Context

Provide the [brief path](#brief-path) and any [missing context](#missing-context). The caller resolves gaps before dispatch.

## Fields

### Location

The brief is a working file, not part of the delivered change, so it sits in a working directory outside every repository it names. Absent a supplied path it takes the session's scratchpad, named for the unit.

### Work Identity

The brief names the epic or hot-fix issue URL, task ids, Descriptions, covered acceptance criteria and the theme board carrying that issue's item. It includes each task branch, with the base it is cut from and the unit checkout where the session works on it, and the project checkout the session merges through.

### Planning Record

The brief names the reserved planning folder and engineering worktree. Each task has one work-item file in that folder, registered in its README, and the brief carries the component the caller read from the file the plan was checked against, which is the one this file declares. Its row retains the folder link while reserved.

### Validation Scope

The brief carries the tests required by the unit's criteria, meeting [Test Coverage](pull-request-body.md#test-coverage). It identifies the work item's test rows and requires implementation and verification of that scope.

### Change Autonomy

The brief names the supplied [allowance](plan-change.md#allowance): the plan changes the session applies on its own. It requires the session's [change list](plan-change.md#change-list) with its result, holding what it applied and what it held.

### Execution Instructions

The caller supplies the session procedure and its invocation context. The brief includes that procedure with its planning, publication, merge, debt and arising-issue obligations, plus the confirmed decisions and evidence needed to execute it. A missing instruction or prerequisite is a finding provided to the caller.

### Output Path

The prompt-file destination; absent when Location selects the session scratchpad.

### Brief Path

The completed working prompt file path.

### Missing Context

Any required context missing from the supplied brief inputs.
