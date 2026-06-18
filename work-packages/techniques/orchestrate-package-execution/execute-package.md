---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Select the highest-priority unstarted package, trigger its work-package workflow, update the roadmap status on completion, and advance the remaining/completed sets.

## Inputs

### remaining_packages

Ordered list of packages not yet started

## Protocol

### 1. Select Package

- Take the first package from `{remaining_packages}` as `{current_package}`  
  > If the selected package depends on an incomplete package, skip to the next independent package and note the blocked package.

### 2. Trigger Workflow

- Apply the [workflow-triggering-protocol](../../resources/workflow-triggering-protocol.md#triggering-a-work-package) triggering procedure
- Call `get_workflow('work-package')` to load the `work-package` workflow
- Pass context: package name, scope from plan document, dependencies, and `{planning_folder_path}`  
  > If the `work-package` workflow cannot be loaded or started, verify it exists via `list_workflows`, then retry.

### 3. Update Status

- Capture the completed package's `{planning_folder_path}` from the child workflow's `returnedContext` and store it in `{package_planning_paths}` keyed by package name
- Update the `START-HERE.md` status table: mark the completed package as done, add its PR link, and add a link to the package's planning-folder `README.md`
- Recompute `{overall_progress}` to reflect the completed count

### 4. Check Remaining

- Remove the completed package from `{remaining_packages}`, add it to `{completed_packages}`

## Outputs

### completed_packages

List of completed package names

### remaining_packages

List of remaining package names

### overall_progress

Progress indicator (e.g., '3/7 complete'), written into the updated START-HERE.md status table

#### artifact

`START-HERE.md`

### package_planning_paths

Map of package name to the child work-package's planning-folder path, captured as each child workflow completes

## Rules

### one-at-a-time

Execute one work-package workflow at a time — do not parallelize

### handle-failures

If a package fails, mark it and continue with the next independent package
