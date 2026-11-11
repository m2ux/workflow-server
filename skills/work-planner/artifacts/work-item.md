# Work Item

The local plan for one task's work.

## Operations

### Populate Work Item

One task's local implementation plan.

#### 1. Populate Work Item File

- Write the [Template](#template) from [Task Context](#task-context) at the destination in [Work Item File](#work-item-file).
- Its name and content must meet [Identity](#identity) and [Sections](#sections).
- The supplied files must meet [Component](#component).
- The test row must meet [Test Coverage](pull-request-body.md#test-coverage), using the supplied criteria without copying them into the file.

#### 2. Provide Populated Work Item

Provide [Work Item File](#work-item-file) with its path for registration in the planning record.

## Fields

### Template

````markdown
**Component:** {{The long-lived branch and path of each file this task's implementation changes, separated by commas}}

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

One declaration line ahead of the first heading, listing each file the Implementation part changes as `<long-lived branch>:<path>`, separated by commas: the [long-lived branch](delivery-branches.md#branches) that holds it and the path to it there, such as `workspace:skills/work-planner/scripts/deliver.py, workspace:skills/work-planner/test/test_deliver.py`.

- A task that creates a file names the path it creates.
- The long-lived branches decide which of an epic's bases the task's unit changes, as [Task Branches](delivery-branches.md#task-branches) states.
- Each entry is one file, never a directory, since the dependency check groups an epic's rows into candidate units, and pairs rows of different epics as contending, by any file they share.

### Sections

- Component lists each file the Implementation part changes, meeting [Component](#component).
- Overview states what the task delivers and why.
- Problem and Proposal must meet [Problem and Proposal](issue-body.md#problem-and-proposal); the Proposal starts with the scene.
- Work Breakdown decomposes the work into parts, such as analysis, plan, implementation, review and test. Its columns are Part and Description. The test row names the checks required by the work.

### Task Context

The supplied task id and scope, epic context, design, declared files, criteria and test requirements.

### Work Item File

The supplied local output path and the populated work item at that path. The file is absent until populated.
