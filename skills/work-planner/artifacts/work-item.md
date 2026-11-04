# Work Item

The local plan for one task's work.

## Prerequisites

Read these files first.

- [Issue Body](issue-body.md)
- [Pull Request Body](pull-request-body.md)
- [Delivery Branches](delivery-branches.md)

## Operations

### *Populate* Work Item

One task's local implementation plan.

**Inputs:** Task id, task scope, epic context, design, the component the implementation extends, supplied criteria and test requirements, and output file.

- Write the supplied task's file from [Template](#template), returning its path for registration in the planning record.
  - Its name and content must meet [Identity](#identity) and [Sections](#sections).
  - The supplied component must meet [Component](#component).
  - The test row must meet [Test Coverage](pull-request-body.md#test-coverage), using the supplied criteria without copying them into the file.

## Fields

### Template

````markdown
**Component:** {{The long-lived branch and path of the one component this task's implementation extends}}

## Overview

{{What this task delivers and why.}}

## Problem

{{The present friction.}}

## Proposal

{{The scene, then the design. Lists of distinct items use bullets.}}

## Work Breakdown

| Part | Description |
| --- | --- |
| Analysis | {{The evidence to gather}} |
| Plan | {{The decisions and design}} |
| Implementation | {{The work to perform}} |
| Review | {{The review of that work}} |
| Test | {{The checks required by the work, including the project's system test when applicable}} |
````

### Identity

One file per task, named for its id in lowercase, such as `w01.md`: the name the epic row's link carries once its reservation is released. The record's README links each file by that name, and releasing the row refuses a record that does not hold it. The file names no other task and carries no acceptance criteria, Coverage, dependency or Joins; those belong to the epic table.

### Component

One declaration line ahead of the first heading, naming the single component the Implementation part extends as `<long-lived branch>:<path>`: the [long-lived branch](delivery-branches.md#branches) that holds it and the path to it there, such as `workspace:skills/work-planner/scripts/deliver.py`.

- A task that creates the component names the path it creates.
- The long-lived branch decides which of an epic's bases the task's unit changes, as [Task Branches](delivery-branches.md#task-branches) states.
- A task whose implementation extends more than one component is split into a task for each.
- A component is one file, never a directory, since the dependency check groups an epic's rows into candidate units by it.

### Sections

- Component names the component the Implementation part extends, meeting [Component](#component).
- Overview states what the task delivers and why.
- Problem and Proposal meet [Problem and Proposal](issue-body.md#problem-and-proposal); the Proposal starts with the scene.
- Work Breakdown decomposes the work into parts, such as analysis, plan, implementation, review and test. Its columns are Part and Description. The test row names the checks required by the work.
