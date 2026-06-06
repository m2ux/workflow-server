---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 5
  legacy_id: 5
---

## Capability

Trigger and manage work-package workflow instances for each planned package in priority order

## Inputs

### remaining-packages

Ordered list of packages not yet started

### priority-order

Full priority order for reference

## Protocol

### 1. Initialize Iteration

- Derive {remaining-packages} from {priority-order} minus {completed-packages}
- Set {overall-progress} to '{\$completed}/{\$total} complete'

### 2. Select Package

- Take the first package from {remaining-packages}
- Set current-package to the selected package
- If the next package depends on an incomplete package, skip to the next independent package and note the blocked package

### 3. Trigger Workflow

- Use attached [workflow-triggering-protocol](../resources/workflow-triggering-protocol.md) (workflow-triggering-protocol) for the triggering procedure
- Call get_workflow('work-package') to load the work-package workflow
- Pass context: package name, scope from plan document, dependencies, the {planning-folder}
- If the work-package workflow cannot be loaded or started, verify it exists via list_workflows, then retry

### 4. Update Status

- After work-package workflow completes, update the START-HERE.md status table — this is the {implementation-status} roadmap
- Mark completed package as done, add PR link
- Update {overall-progress} counter

### 5. Check Remaining

- Remove completed package from {remaining-packages}, add to {completed-packages}
- If {remaining-packages} is not empty, continue the loop with the next package

## Outputs

### implementation-status

Updated roadmap status reflecting completed packages

#### completed-packages

List of completed package names

#### remaining-packages

List of remaining package names

#### overall-progress

Progress indicator (e.g., '3/7 complete')

## Rules

### one-at-a-time

Execute one work-package workflow at a time — do not parallelize

### handle-failures

If a package fails, mark it and continue with the next independent package
