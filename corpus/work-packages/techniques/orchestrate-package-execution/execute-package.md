---
metadata:
  version: 1.2.0
---

## Capability

Select the highest-priority unstarted package, trigger its work-package workflow, update the roadmap status on completion, and advance the remaining/completed sets.

## Inputs

### remaining_packages

Ordered list of packages not yet started

## Outputs

### completed_packages

List of completed package names

### remaining_packages

List of remaining package names

### overall_progress

Progress indicator (e.g., '3/7 complete'), written into the updated START-HERE.md status table

#### artifact

`START-HERE.md`

#### audience

`human`

### package_planning_paths

Map of package name to the child work-package's planning-folder path, rendered as the planning-folder link in each status row

### child_session_index

The child session the launch opened.

### child_initial_activity

The child workflow's initial activity.

### child_planning_folder_path

The child session's planning folder, as the launch returned it.

## Protocol

### 1. Select Package

- Take the first package from `{remaining_packages}` as `{current_package}`  
  > If the selected package depends on an incomplete package, skip to the next independent package and note the blocked package.

### 2. Launch the Work Package

- Apply the [workflow-triggering-protocol](../../resources/workflow-triggering-protocol.md#triggering-a-work-package) triggering procedure to compose the launch context: package name, scope from plan document, dependencies, and `{planning_folder_path}`
- Apply [workflow-engine](/meta/techniques/workflow-engine/TECHNIQUE.md)::[handle-sub-workflow](/meta/techniques/workflow-engine/handle-sub-workflow.md) with `workflow_id: work-package`; capture `{child_session_index}`, `{child_initial_activity}`, and `{child_planning_folder_path}`. The child session is open. Its walk is the binding activity's.
  > If the `work-package` workflow cannot be loaded or started, refresh the catalog via [list-workflows](/meta/techniques/workflow-engine/list-workflows.md), then retry.

## Rules

### one-at-a-time

Execute one work-package workflow at a time — do not parallelize

### handle-failures

If a package fails, mark it and continue with the next independent package
